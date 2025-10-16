export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  iterations?: Iteration[];
  createdAt: string;
}

export interface Iteration {
  generation: string;
  reflection: string;
}

export interface Conversation {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
  isAnonymous?: boolean;
}

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

export interface UserSubscription {
  id: string;
  tier: string;
  maxMessages: number;
  usedMessages: number;
  remaining: number;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  autoRenew: boolean;
  isActive: boolean;
  startDate: string;
  endDate: string;
  renewalDate?: string;
}

export interface QuotaInfo {
  type: 'session' | 'free' | 'subscription';
  remaining: number;
  total: number;
  message?: string;
}

