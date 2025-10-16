import Stripe from 'stripe';
import { config } from '../../../config/env';
import { NotFoundError } from '../../../shared/errors';
import { databaseService } from '../../../config/database';

export class StripeService {
  private stripe: Stripe;

  private get prisma() {
    return databaseService.getClient();
  }

  constructor() {
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createCheckoutSession({
    userId,
    planId,
    tier,
    billingCycle,
    successUrl,
    cancelUrl,
  }: {
    userId: string;
    planId: string;
    tier: string;
    billingCycle: 'monthly' | 'yearly';
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundError('Subscription Plan');
    }

    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const interval = billingCycle === 'monthly' ? 'month' : 'year';

    const session = await this.stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
        tier,
        billingCycle,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier} Plan`,
              description: `${plan.name} - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} billing`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
            recurring: {
              interval: interval as Stripe.Price.Recurring.Interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return {
      url: session.url!,
      sessionId: session.id,
    };
  }

  /**
   * Verify checkout session and create subscription (backup for webhook)
   * This is called when user returns to success URL
   */
  async verifyAndCreateSubscription(sessionId: string): Promise<{
    success: boolean;
    subscription?: any;
    message: string;
  }> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return {
          success: false,
          message: 'Payment not completed',
        };
      }

      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      const tier = session.metadata?.tier;
      const billingCycle = session.metadata?.billingCycle;

      if (!userId || !planId || !tier || !billingCycle) {
        return {
          success: false,
          message: 'Missing required metadata in checkout session',
        };
      }

      const existingSubscription = await this.prisma.subscription.findFirst({
        where: {
          userId,
          stripeSubId: session.subscription as string,
        },
      });

      if (existingSubscription) {
        return {
          success: true,
          subscription: existingSubscription,
          message: 'Subscription already exists',
        };
      }

      // Get the subscription from Stripe
      if (!session.subscription) {
        return {
          success: false,
          message: 'No subscription found in checkout session',
        };
      }

      const subscription = await this.stripe.subscriptions.retrieve(
        session.subscription as string,
        { expand: ['latest_invoice', 'customer'] }
      );
      const subscriptionData = subscription as any;

      console.log('Full subscription object:', JSON.stringify(subscription, null, 2));
      console.log('Retrieved subscription from Stripe:', {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscriptionData.current_period_start,
        current_period_end: subscriptionData.current_period_end,
        all_keys: Object.keys(subscription),
      });

      // Get plan from database to set maxMessages
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        return {
          success: false,
          message: 'Subscription plan not found',
        };
      }

  
      let currentPeriodStart = subscriptionData.current_period_start;
      let currentPeriodEnd = subscriptionData.current_period_end;

    
      if (!currentPeriodStart && subscriptionData.items?.data?.[0]) {
        console.log('Trying to get dates from subscription items...');
      }

      if (!currentPeriodStart || !currentPeriodEnd) {
        console.warn('Period dates not found in subscription, using fallback...');
        const createdTimestamp = subscriptionData.created || subscriptionData.start_date;
        
        if (createdTimestamp) {
          currentPeriodStart = createdTimestamp;
          // Calculate end date based on billing cycle (1 month = ~30 days, 1 year = 365 days)
          const daysToAdd = billingCycle === 'monthly' ? 30 : 365;
          currentPeriodEnd = createdTimestamp + (daysToAdd * 24 * 60 * 60); // seconds
          
          console.log('Using fallback dates:', {
            created: createdTimestamp,
            calculatedStart: currentPeriodStart,
            calculatedEnd: currentPeriodEnd,
          });
        }
      }

      console.log('Extracted dates:', {
        currentPeriodStart,
        currentPeriodEnd,
        startDateConverted: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : 'undefined',
        endDateConverted: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : 'undefined',
      });

      if (!currentPeriodStart || !currentPeriodEnd) {
        console.error('Missing period dates from Stripe subscription even after fallback');
        console.error('Full subscription data:', subscriptionData);
        return {
          success: false,
          message: 'Invalid subscription period dates from Stripe',
        };
      }

      // Create subscription in database
      const newSubscription = await this.prisma.subscription.create({
        data: {
          userId,
          planId,
          tier,
          billingCycle,
          price: subscription.items.data[0].price.unit_amount! / 100,
          maxMessages: plan.maxMessages,
          stripeSubId: subscription.id,
          isActive: true,
          startDate: new Date(currentPeriodStart * 1000),
          endDate: new Date(currentPeriodEnd * 1000),
          renewalDate: new Date(currentPeriodEnd * 1000),
        },
      });

      return {
        success: true,
        subscription: newSubscription,
        message: 'Subscription created successfully',
      };
    } catch (error) {
      console.error('Error verifying checkout session:', error);
      throw error;
    }
  }

  async handleWebhook(rawBody: string, signature: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripeWebhookSecret
      );

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Checkout.Session);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error('Stripe webhook error:', err);
      throw err;
    }
  }

  private async handleSubscriptionCreated(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const tier = session.metadata?.tier;
    const billingCycle = session.metadata?.billingCycle;

    if (!userId || !planId || !tier || !billingCycle) {
      throw new Error('Missing required metadata in checkout session');
    }

    // Check if subscription already exists
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        stripeSubId: session.subscription as string,
      },
    });

    if (existingSubscription) {
      console.log('Subscription already exists, skipping creation');
      return;
    }

    // Get the subscription from Stripe
    if (!session.subscription) {
      throw new Error('No subscription found in checkout session');
    }
    
    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string,
      { expand: ['latest_invoice', 'customer'] }
    );
    const subscriptionData = subscription as any;

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    let currentPeriodStart = subscriptionData.current_period_start;
    let currentPeriodEnd = subscriptionData.current_period_end;

  
    if (!currentPeriodStart || !currentPeriodEnd) {
      console.warn('Period dates not found in webhook subscription, using fallback...');
      const createdTimestamp = subscriptionData.created || subscriptionData.start_date;
      
      if (createdTimestamp) {
        currentPeriodStart = createdTimestamp;
        // Calculate end date based on billing cycle
        const daysToAdd = billingCycle === 'monthly' ? 30 : 365;
        currentPeriodEnd = createdTimestamp + (daysToAdd * 24 * 60 * 60);
      }
    }

    if (!currentPeriodStart || !currentPeriodEnd) {
      throw new Error('Invalid subscription period dates from Stripe');
    }

    // Create subscription in database
    await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        tier,
        billingCycle,
        price: subscription.items.data[0].price.unit_amount! / 100,
        maxMessages: plan.maxMessages,
        stripeSubId: subscription.id,
        isActive: true,
        startDate: new Date(currentPeriodStart * 1000),
        endDate: new Date(currentPeriodEnd * 1000),
        renewalDate: new Date(currentPeriodEnd * 1000),
      },
    });
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    // Handle successful payment - extend subscription if needed
    const subscriptionId = (invoice as any).subscription;
    console.log('Payment succeeded for subscription:', subscriptionId);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // Handle failed payment - mark subscription as inactive
    const subscriptionId = (invoice as any).subscription;
      
    if (subscriptionId) {
      await this.prisma.subscription.update({
        where: { stripeSubId: subscriptionId },
        data: { isActive: false },
      });
    }
  }

  private async handleSubscriptionCancelled(subscription: Stripe.Subscription): Promise<void> {
    // Handle subscription cancellation
    await this.prisma.subscription.update({
      where: { stripeSubId: subscription.id },
      data: { isActive: false },
    });
  }
}
