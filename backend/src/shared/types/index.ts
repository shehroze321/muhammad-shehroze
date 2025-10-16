import { Request } from 'express';

// Extend Express Request to include user and session
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  sessionId?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  message?: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
}

// Conversation iteration type
export interface Iteration {
  generation: string;
  reflection: string;
}

// Generation Result
export interface GenerationResult {
  finalPost: string;
  iterations: Iteration[];
  tokens: number;
}

// Subscription tiers
export enum SubscriptionTier {
  BASIC = 'Basic',
  PRO = 'Pro',
  ENTERPRISE = 'Enterprise',
}

// Billing cycles
export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

// Message roles
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

// Input types
export enum InputType {
  TEXT = 'text',
  VOICE = 'voice',
}

// Languages
export enum Language {
  ENGLISH = 'english',
  URDU = 'urdu',
}

// Quota info
export interface QuotaInfo {
  type: 'session' | 'free' | 'subscription';
  remaining: number;
  total: number;
  message?: string;
}

// Usage stats
export interface UsageStats {
  userType: 'anonymous' | 'authenticated';
  freeQuota?: {
    used: number;
    limit: number;
    remaining: number;
    resetsOn: Date;
  };
  sessionQuota?: {
    used: number;
    limit: number;
    remaining: number;
  };
  subscriptions?: Array<{
    tier: string;
    used: number;
    limit: number;
    remaining: number;
    endsAt: Date;
  }>;
  totalTokensThisMonth?: number;
  totalConversations?: number;
  message?: string;
}

