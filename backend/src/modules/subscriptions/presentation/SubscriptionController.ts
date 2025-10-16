import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../application/SubscriptionService';
import { SubscriptionPlanService } from '../application/SubscriptionPlanService';
import { StripeService } from '../infrastructure/StripeService';
import { successResponse } from '../../../shared/utils';
import { AuthRequest } from '../../../shared/types';
import { SubscriptionTier, BillingCycle } from '../../../shared/types';
import { config } from '../../../config/env';

export class SubscriptionController {
  private stripeService: StripeService;

  constructor(
    private subscriptionService: SubscriptionService,
    private subscriptionPlanService: SubscriptionPlanService
  ) {
    this.stripeService = new StripeService();
  }

  getPlans = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const plans = await this.subscriptionPlanService.getActivePlans();
      
      const formattedPlans = plans.map(plan => ({
        id: plan.id,
        tier: plan.tier,
        name: plan.name,
        maxMessages: plan.maxMessages,
        pricing: {
          monthly: plan.monthlyPrice,
          yearly: plan.yearlyPrice,
        },
        features: plan.features,
      }));

      res.status(200).json(successResponse(formattedPlans));
    } catch (error) {
      next(error);
    }
  };

  createSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { tier, billingCycle } = req.body;

      const subscription = await this.subscriptionService.createSubscription(
        req.user.id,
        tier as SubscriptionTier,
        billingCycle as BillingCycle
      );

      res.status(201).json(
        successResponse(
          {
            id: subscription.id,
            tier: subscription.tier,
            maxMessages: subscription.maxMessages,
            usedMessages: subscription.usedMessages,
            price: subscription.price,
            billingCycle: subscription.billingCycle,
            autoRenew: subscription.autoRenew,
            isActive: subscription.isActive,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            renewalDate: subscription.renewalDate,
          },
          'Subscription created successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  };

  createCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { planId, billingCycle, returnUrl, refreshUrl } = req.body;

      if (!planId || !billingCycle) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Plan ID and billing cycle are required'
          }
        });
        return;
      }

      const plans = await this.subscriptionPlanService.getActivePlans();
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Plan not found'
          }
        });
        return;
      }

      const baseUrl = config.clientUrl;
      const successUrl = returnUrl || `${baseUrl}/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = refreshUrl || `${baseUrl}/subscriptions?cancelled=true`;

      const { url, sessionId } = await this.stripeService.createCheckoutSession({
        userId: req.user.id,
        planId,
        tier: plan.tier,
        billingCycle: billingCycle as 'monthly' | 'yearly',
        successUrl,
        cancelUrl,
      });

      res.status(200).json(
        successResponse({
          checkoutUrl: url,
          sessionId,
        }, 'Checkout session created successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  getUserSubscriptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const subscriptions = await this.subscriptionService.getUserSubscriptions(
        req.user.id
      );

      res.status(200).json(
        successResponse({
          subscriptions: subscriptions.map((sub) => ({
            id: sub.id,
            tier: sub.tier,
            maxMessages: sub.maxMessages,
            usedMessages: sub.usedMessages,
            remaining: sub.remaining,
            price: sub.price,
            billingCycle: sub.billingCycle,
            autoRenew: sub.autoRenew,
            isActive: sub.isActive,
            startDate: sub.startDate,
            endDate: sub.endDate,
            renewalDate: sub.renewalDate,
          })),
          total: subscriptions.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  toggleAutoRenew = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      const subscription = await this.subscriptionService.toggleAutoRenew(
        id,
        req.user.id
      );

      res.status(200).json(
        successResponse(
          {
            id: subscription.id,
            autoRenew: subscription.autoRenew,
          },
          `Auto-renew ${subscription.autoRenew ? 'enabled' : 'disabled'}`
        )
      );
    } catch (error) {
      next(error);
    }
  };

  cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;

      await this.subscriptionService.cancelSubscription(id, req.user.id);

      res.status(200).json(
        successResponse(null, 'Subscription cancelled successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  // Get single subscription
  getSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;
      const subscription = await this.subscriptionService.getSubscriptionById(id, req.user.id);

      res.status(200).json(
        successResponse({
          id: subscription.id,
          tier: subscription.tier,
          maxMessages: subscription.maxMessages,
          usedMessages: subscription.usedMessages,
          remaining: subscription.remaining,
          price: subscription.price,
          billingCycle: subscription.billingCycle,
          autoRenew: subscription.autoRenew,
          isActive: subscription.isActive,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          renewalDate: subscription.renewalDate,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updateSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;
      const updateData = req.body;

      const subscription = await this.subscriptionService.updateSubscription(id, req.user.id, updateData);

      res.status(200).json(
        successResponse({
          id: subscription.id,
          tier: subscription.tier,
          maxMessages: subscription.maxMessages,
          usedMessages: subscription.usedMessages,
          price: subscription.price,
          billingCycle: subscription.billingCycle,
          autoRenew: subscription.autoRenew,
          isActive: subscription.isActive,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          renewalDate: subscription.renewalDate,
        }, 'Subscription updated successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  deleteSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { id } = req.params;
      await this.subscriptionService.deleteSubscription(id, req.user.id);

      res.status(200).json(
        successResponse(null, 'Subscription deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  verifyCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { sessionId } = req.body;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID is required'
          }
        });
        return;
      }

      const result = await this.stripeService.verifyAndCreateSubscription(sessionId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'PAYMENT_VERIFICATION_FAILED',
            message: result.message
          }
        });
        return;
      }

      res.status(200).json(
        successResponse({
          subscription: {
            id: result.subscription.id,
            tier: result.subscription.tier,
            maxMessages: result.subscription.maxMessages,
            usedMessages: result.subscription.usedMessages,
            remaining: result.subscription.remaining,
            price: result.subscription.price,
            billingCycle: result.subscription.billingCycle,
            isActive: result.subscription.isActive,
            startDate: result.subscription.startDate,
            endDate: result.subscription.endDate,
            renewalDate: result.subscription.renewalDate,
          },
          message: result.message
        }, 'Payment verified successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  handleStripeWebhook = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        res.status(400).json({ error: 'Missing stripe-signature header' });
        return;
      }

      const rawBody = req.body.toString();
      
      await this.stripeService.handleWebhook(rawBody, signature);
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  };
}

