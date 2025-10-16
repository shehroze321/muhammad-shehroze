import { Router } from 'express';
import { SubscriptionController } from './SubscriptionController';
import { SubscriptionPlanController } from './SubscriptionPlanController';
import { SubscriptionService } from '../application/SubscriptionService';
import { SubscriptionPlanService } from '../application/SubscriptionPlanService';
import { SubscriptionRepository } from '../infrastructure/SubscriptionRepository';
import { SubscriptionPlanRepository } from '../infrastructure/SubscriptionPlanRepository';
import { authenticate } from '../../../shared/middleware/auth';
import { validate } from '../../../shared/middleware/validate';
import {
  createSubscriptionSchema,
  toggleAutoRenewSchema,
  cancelSubscriptionSchema,
  subscriptionIdSchema,
  updateSubscriptionSchema,
  createPlanSchema,
  updatePlanSchema,
  planIdSchema,
  createCheckoutSessionSchema,
  verifyCheckoutSessionSchema,
} from './subscription.validation';

const router = Router();

const subscriptionRepository = new SubscriptionRepository();
const subscriptionPlanRepository = new SubscriptionPlanRepository();
const subscriptionPlanService = new SubscriptionPlanService(subscriptionPlanRepository);
const subscriptionService = new SubscriptionService(subscriptionRepository, subscriptionPlanService);
const subscriptionController = new SubscriptionController(subscriptionService, subscriptionPlanService);
const subscriptionPlanController = new SubscriptionPlanController(subscriptionPlanService);

// Public routes
router.get('/plans', subscriptionController.getPlans);

// Stripe webhook endpoint (must be before body parsing middleware)
router.post('/webhook', subscriptionController.handleStripeWebhook);

// Protected routes
router.post(
  '/',
  authenticate,
  validate(createSubscriptionSchema),
  subscriptionController.createSubscription
);

router.post(
  '/checkout',
  authenticate,
  validate(createCheckoutSessionSchema),
  subscriptionController.createCheckoutSession
);

router.post(
  '/verify-checkout',
  authenticate,
  validate(verifyCheckoutSessionSchema),
  subscriptionController.verifyCheckoutSession
);

router.get('/', authenticate, subscriptionController.getUserSubscriptions);

router.get('/:id', authenticate, validate(subscriptionIdSchema), subscriptionController.getSubscription);
router.put('/:id', authenticate, validate(updateSubscriptionSchema), subscriptionController.updateSubscription);
router.delete('/:id', authenticate, validate(subscriptionIdSchema), subscriptionController.deleteSubscription);

router.patch('/:id/cancel', authenticate, validate(cancelSubscriptionSchema), subscriptionController.cancelSubscription);

router.patch(
  '/:id/auto-renew',
  authenticate,
  validate(toggleAutoRenewSchema),
  subscriptionController.toggleAutoRenew
);

router.get('/admin/plans', subscriptionPlanController.getAllPlans);
router.post('/admin/plans', validate(createPlanSchema), subscriptionPlanController.createPlan);
router.get('/admin/plans/:id', validate(planIdSchema), subscriptionPlanController.getPlanById);
router.put('/admin/plans/:id', validate(updatePlanSchema), subscriptionPlanController.updatePlan);
router.delete('/admin/plans/:id', validate(planIdSchema), subscriptionPlanController.deletePlan);
router.patch('/admin/plans/:id/toggle', validate(planIdSchema), subscriptionPlanController.togglePlanStatus);

export default router;

