'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetPlansQuery, useCreateCheckoutSessionMutation } from '@/lib/api/subscriptionApi';
import { Sparkles, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import Link from 'next/link';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, pendingPlanSelection } = useAppSelector((state) => state.auth);
  
  const planId = searchParams.get('planId') || pendingPlanSelection?.planId;
  const tier = searchParams.get('tier') || pendingPlanSelection?.tier;
  const billing = searchParams.get('billing') || pendingPlanSelection?.billing || 'monthly';

  const { data: plansData } = useGetPlansQuery();
  const plans = plansData?.data || [];
  const selectedPlan = plans.find(plan => plan.id === planId || plan.tier === tier);
  const [createCheckoutSession, { isLoading: isCreatingCheckout }] = useCreateCheckoutSessionMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handlePayment = async () => {
    if (!selectedPlan || !planId) {
      console.error('Missing plan selection');
      return;
    }

    try {
      // Create Stripe checkout session
      const result = await createCheckoutSession({
        planId: planId,
        billingCycle: billing as 'monthly' | 'yearly',
        returnUrl: `${window.location.origin}/chat?subscription=success`,
        refreshUrl: `${window.location.origin}/subscriptions?cancelled=true`,
      }).unwrap();

      // Redirect to Stripe checkout page
      if (result.data.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      }
      } catch (error: unknown) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initialize payment. Please try again.');
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Plan Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              The selected plan could not be found. Please try again.
            </p>
            <Link href="/subscriptions">
              <Button className="w-full">Back to Plans</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const price = billing === 'monthly' ? selectedPlan.pricing.monthly : selectedPlan.pricing.yearly;
  const displayPrice = billing === 'monthly' ? price : price / 12;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link href="/subscriptions" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Plans
            </Link>
            <h1 className="text-3xl font-bold">Complete Your Purchase</h1>
            <p className="text-gray-600 mt-2">You&apos;re almost there! Complete your subscription to {selectedPlan.tier}.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {selectedPlan.tier} Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">${displayPrice.toFixed(2)}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  {billing === 'yearly' && (
                    <p className="text-sm text-green-600 mt-1">
                      Billed yearly (Save ${(selectedPlan.pricing.monthly * 12 - selectedPlan.pricing.yearly).toFixed(0)})
                    </p>
                  )}
                </div>
                
                <div>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600">✓ {feature}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Contact information</h3>
                  <div className="text-sm text-gray-600">
                    <p>Email: <span className="font-medium">{user?.email}</span></p>
                    <p className="text-xs text-gray-500 mt-1">This email will be used for billing and account management.</p>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Payment method</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Lock className="h-3 w-3" />
                      Secure payment
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Total amount</p>
                        <p className="text-2xl font-bold text-gray-900">${price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{billing === 'yearly' ? 'per year' : 'per month'}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-1 mb-2">
                          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
                        </div>
                        <p className="text-xs text-gray-500">We accept Visa, Mastercard & more</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Authorization */}
                <div className="text-xs text-gray-600 space-y-2">
                  <p>
                    You&apos;ll be charged ${price.toFixed(2)} {billing === 'yearly' ? 'yearly' : 'monthly'} until you cancel. 
                    You can cancel any time. By subscribing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>

                <Button 
                  onClick={handlePayment} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                  size="lg"
                  disabled={isCreatingCheckout}
                >
                  {isCreatingCheckout ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Subscribe - $${price.toFixed(2)}`
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  <Link href="/terms" className="underline hover:no-underline">Terms</Link>
                  {' • '}
                  <Link href="/privacy" className="underline hover:no-underline">Privacy</Link>
                  {' • '}
                  <span className="text-gray-400">Powered by Stripe</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
