import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  body: z.object({
    tier: z.enum(['Basic', 'Pro', 'Enterprise']),
    billingCycle: z.enum(['monthly', 'yearly']),
  }),
});

export const toggleAutoRenewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid subscription ID'),
  }),
});

export const cancelSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid subscription ID'),
  }),
});

export const subscriptionIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid subscription ID'),
  }),
});

export const updateSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid subscription ID'),
  }),
  body: z.object({
    maxMessages: z.number().min(1).optional(),
    price: z.number().min(0).optional(),
    billingCycle: z.enum(['monthly', 'yearly']).optional(),
    autoRenew: z.boolean().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const createPlanSchema = z.object({
  body: z.object({
    tier: z.string().min(1),
    name: z.string().min(1),
    maxMessages: z.number().int(),
    monthlyPrice: z.number().min(0),
    yearlyPrice: z.number().min(0),
    features: z.array(z.string()),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updatePlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan ID'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    maxMessages: z.number().int().optional(),
    monthlyPrice: z.number().min(0).optional(),
    yearlyPrice: z.number().min(0).optional(),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const planIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan ID'),
  }),
});

export const createCheckoutSessionSchema = z.object({
  body: z.object({
    planId: z.string().uuid('Invalid plan ID'),
    billingCycle: z.enum(['monthly', 'yearly']),
    returnUrl: z.string().url().optional(),
    refreshUrl: z.string().url().optional(),
  }),
});

export const verifyCheckoutSessionSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
  }),
});

