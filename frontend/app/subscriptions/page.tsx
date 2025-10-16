'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { PricingCard } from '@/components/subscription/PricingCard';
import { Header } from '@/components/layout/Header';
import { useAppSelector } from '@/lib/store/hooks';
// import { setPendingPlanSelection } from '@/lib/store/slices/authSlice';
import { 
  useGetPlansQuery, 
  useGetUserSubscriptionsQuery,
  useToggleAutoRenewMutation,
  useCancelSubscriptionMutation,
  useCreateCheckoutSessionMutation
} from '@/lib/api/subscriptionApi';
import { Alert, AlertDescription } from '@/components/ui/alert';

function SubscriptionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const dispatch = useAppDispatch();
  const { isAuthenticated, user, pendingPlanSelection } = useAppSelector((state) => state.auth);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  const { data: plansData, isLoading: isLoadingPlans } = useGetPlansQuery();
  const { data: subscriptionsData, isLoading: isLoadingSubscriptions } = useGetUserSubscriptionsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [toggleAutoRenew] = useToggleAutoRenewMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] = useCreateCheckoutSessionMutation();

  // For non-authenticated users, fetch without protection
  const plans = plansData?.data || [];
  const subscriptions = subscriptionsData?.data?.subscriptions || [];
  const activeSubscription = subscriptions.find(sub => sub.isActive);
  const hasActiveSubscription = !!activeSubscription;

  // Calculate quota info for authenticated users
  const getQuotaInfo = () => {
    if (isAuthenticated && user) {
      if (activeSubscription) {
        return {
          remaining: activeSubscription.remaining,
          total: activeSubscription.maxMessages,
        };
      } else {
        return {
          remaining: user.freeQuotaLimit - user.freeQuotaUsed,
          total: user.freeQuotaLimit,
        };
      }
    }
    return { remaining: 3, total: 3 };
  };

  const quotaInfo = getQuotaInfo();

  // Check if authenticated user can access chat (free trial status)
  const checkFreeTrialStatus = () => {
    if (isAuthenticated && user) {
      const freeQuotaRemaining = user.freeQuotaLimit - user.freeQuotaUsed;
      return freeQuotaRemaining > 0;
    }
    return false;
  };

  // Redirect to verify-payment page if session_id is present
  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    
    if (sessionId && isAuthenticated) {
      router.replace(`/verify-payment?session_id=${sessionId}`);
    }
  }, [searchParams, isAuthenticated, router]);

  // Handle authenticated user redirect logic
  useEffect(() => {
    if (isAuthenticated && user && !isLoadingSubscriptions && !activeSubscription) {
      const hasFreeTrial = checkFreeTrialStatus();
      
      // If user has pending plan selection, proceed to checkout
      if (pendingPlanSelection && pendingPlanSelection.planId && pendingPlanSelection.tier) {
        const { planId, tier } = pendingPlanSelection;
        handlePlanSelect(planId, tier);
        return;
      }
      
      // If no free trial left, stay on subscription page
      if (!hasFreeTrial) {
        return; // Show subscription page with trial expired message
      }
      
      // If has free trial and no pending plan, redirect to chat
      if (hasFreeTrial) {
        router.push('/chat');
        return;
      }
    }
  }, [isAuthenticated, user, isLoadingSubscriptions, activeSubscription, pendingPlanSelection, router]);

  // Handle plan selection
  const handlePlanSelect = async (planId: string, tier: string) => {
    if (!isAuthenticated) {
      // Redirect to login with plan info in query params
      const params = new URLSearchParams({
        planId,
        tier,
        billing: billingCycle,
      });
      router.push(`/login?${params.toString()}`);
    } else {
      // User is authenticated, create Stripe checkout session directly
      try {
        const result = await createCheckoutSession({
          planId,
          billingCycle: billingCycle as 'monthly' | 'yearly',
          returnUrl: `${window.location.origin}/verify-payment?session_id={CHECKOUT_SESSION_ID}`,
          refreshUrl: `${window.location.origin}/subscriptions?cancelled=true`,
        }).unwrap();

        // Redirect to Stripe checkout page
        if (result.data.checkoutUrl) {
          window.location.href = result.data.checkoutUrl;
        }
      } catch (error: unknown) {
        console.error('Failed to create checkout session:', error);
        alert('Failed to initialize payment. Please try again.');
      }
    }
  };

  const handleToggleAutoRenew = async (id: string) => {
    try {
      await toggleAutoRenew(id).unwrap();
    } catch (error) {
      console.error('Failed to toggle auto-renew:', error);
      alert('Failed to update auto-renew setting');
    }
  };

  const handleCancelSubscription = async (id: string) => {
    if (confirm('Are you sure you want to cancel this subscription? You can continue using it until the end of the current billing period.')) {
      try {
        await cancelSubscription(id).unwrap();
        alert('Subscription cancelled successfully');
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
        alert('Failed to cancel subscription');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-gray-50">
      {/* Header */}
      <Header 
        quotaRemaining={quotaInfo.remaining}
        quotaTotal={quotaInfo.total}
        hasActiveSubscription={hasActiveSubscription || false}
      />

      <div className="container mx-auto px-4 py-12">
        {/* Current Subscription */}
        {activeSubscription && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-bold">Current Subscription</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{activeSubscription.tier} Plan</CardTitle>
                    <p className="text-gray-600 mt-1">
                      {activeSubscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} Billing
                    </p>
                  </div>
                  <Badge className={
                    activeSubscription.isActive ? 'bg-green-500' : 'bg-red-500'
                  }>
                    {activeSubscription.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Usage This Period</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-brand h-2 rounded-full transition-all"
                          style={{ 
                            width: `${activeSubscription.maxMessages === -1 || activeSubscription.maxMessages === 0 ? 0 : (activeSubscription.usedMessages / activeSubscription.maxMessages) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {activeSubscription.usedMessages} / {activeSubscription.maxMessages === -1 ? '∞' : activeSubscription.maxMessages}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="text-lg font-bold">
                        ${activeSubscription.price}/{activeSubscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Renewal</p>
                      <p className="text-lg font-medium">
                        {activeSubscription.renewalDate 
                          ? new Date(activeSubscription.renewalDate).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleToggleAutoRenew(activeSubscription.id)}
                    >
                      {activeSubscription.autoRenew ? 'Disable' : 'Enable'} Auto-Renew
                    </Button>
                    {activeSubscription.isActive && (
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelSubscription(activeSubscription.id)}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trial Expired Message */}
        {isAuthenticated && user && !activeSubscription && !checkFreeTrialStatus() && (
          <div className="mb-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Your free trial has ended. Choose a plan to continue creating amazing content with AI.
                </span>
                <Button size="sm" onClick={() => router.push('/subscriptions')}>
                  View Plans
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Hero Section */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-gradient-brand border-0 text-white">
            ✨ Choose Your Plan
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Pricing Plans for Every Need
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Start free, upgrade when you need more. All plans include our powerful AI refinement system.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center rounded-full border p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-brand text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-brand text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-green-600">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingPlans ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load pricing plans. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (
          /* Pricing Cards */
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, idx) => (
              <PricingCard
                key={plan.tier}
                plan={plan}
                billingCycle={billingCycle}
                isPopular={idx === 1}
                isCurrentPlan={activeSubscription?.tier === plan.tier}
                isLoading={isCreatingCheckout}
                onSelectPlan={handlePlanSelect}
              />
            ))}
          </div>
        )}

        {/* Features Comparison */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold">All Plans Include</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon="🤖"
              title="AI-Powered Generation"
              description="3-iteration refinement process for perfect content"
            />
            <FeatureCard
              icon="🌍"
              title="Multi-Language Support"
              description="Create posts in English and Urdu"
            />
            <FeatureCard
              icon="🎤"
              title="Voice Input"
              description="Speak your ideas, we'll craft the post"
            />
            <FeatureCard
              icon="📊"
              title="Analytics & History"
              description="Track your content performance"
            />
            <FeatureCard
              icon="🔒"
              title="Secure & Private"
              description="Your data is encrypted and protected"
            />
            <FeatureCard
              icon="⚡"
              title="Fast Generation"
              description="Get results in seconds, not hours"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2 text-4xl">{icon}</div>
        <h3 className="mb-2 font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionsPage() {
  return <SubscriptionsPageContent />;
}
