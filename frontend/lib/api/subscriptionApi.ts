import { apiSlice } from './apiSlice';

export interface SubscriptionPlan {
  id: string;
  tier: 'Basic' | 'Pro' | 'Enterprise';
  name: string;
  maxMessages: number;
  pricing: {
    monthly: number;
    yearly: number;
  };
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'Basic' | 'Pro' | 'Enterprise';
  billingCycle: 'monthly' | 'yearly';
  maxMessages: number;
  usedMessages: number;
  remaining: number;
  price: number;
  isActive: boolean;
  autoRenew: boolean;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
}

export interface SubscriptionResponse {
  success: boolean;
  data: Subscription;
}

export interface SubscriptionsResponse {
  success: boolean;
  data: {
    subscriptions: Subscription[];
    total: number;
  };
}

export interface CreateSubscriptionRequest {
  tier: 'Basic' | 'Pro' | 'Enterprise';
  billingCycle: 'monthly' | 'yearly';
  autoRenew?: boolean;
}

export interface ToggleAutoRenewRequest {
  autoRenew: boolean;
}

export interface CreateCheckoutSessionRequest {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  returnUrl?: string;
  refreshUrl?: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  data: {
    checkoutUrl: string;
    sessionId: string;
  };
}

export interface VerifyCheckoutSessionRequest {
  sessionId: string;
}

export interface VerifyCheckoutSessionResponse {
  success: boolean;
  data: {
    subscription: Subscription;
    message: string;
  };
  message: string;
}

export const subscriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<PlansResponse, void>({
      query: () => '/subscriptions/plans',
    }),

    getUserSubscriptions: builder.query<SubscriptionsResponse, void>({
      query: () => '/subscriptions',
      providesTags: ['Subscriptions'],
    }),

    createSubscription: builder.mutation<SubscriptionResponse, CreateSubscriptionRequest>({
      query: (data) => ({
        url: '/subscriptions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscriptions', 'User'],
    }),

    createCheckoutSession: builder.mutation<CheckoutSessionResponse, CreateCheckoutSessionRequest>({
      query: (data) => ({
        url: '/subscriptions/checkout',
        method: 'POST',
        body: data,
      }),
    }),

    verifyCheckoutSession: builder.mutation<VerifyCheckoutSessionResponse, VerifyCheckoutSessionRequest>({
      query: (data) => ({
        url: '/subscriptions/verify-checkout',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscriptions', 'User'],
    }),

    toggleAutoRenew: builder.mutation<{ success: boolean; data: { id: string; autoRenew: boolean }; message: string }, string>({
      query: (id) => ({
        url: `/subscriptions/${id}/auto-renew`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Subscriptions', id },
        'Subscriptions',
      ],
    }),

    cancelSubscription: builder.mutation<{ success: boolean; data: null; message: string }, string>({
      query: (id) => ({
        url: `/subscriptions/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Subscriptions', 'User'],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetUserSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useCreateCheckoutSessionMutation,
  useVerifyCheckoutSessionMutation,
  useToggleAutoRenewMutation,
  useCancelSubscriptionMutation,
} = subscriptionApi;

