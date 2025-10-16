'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVerifyCheckoutSessionMutation } from '@/lib/api/subscriptionApi';
import { useAppSelector } from '@/lib/store/hooks';

type VerificationStatus = 'verifying' | 'success' | 'error' | 'no-session';

export default function VerifyPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [verifyCheckoutSession] = useVerifyCheckoutSessionMutation();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams?.get('session_id');

    // Check if user is authenticated
    if (!isAuthenticated) {
      setStatus('error');
      setErrorMessage('You must be logged in to verify payment.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      return;
    }

    // Check if session_id is present
    if (!sessionId) {
      setStatus('no-session');
      setErrorMessage('No payment session found. Please try again.');
      return;
    }

    // Verify the payment
    verifyCheckoutSession({ sessionId })
      .unwrap()
      .then((result) => {
        console.log('Payment verified successfully:', result);
        setStatus('success');
        // Redirect to chat after 2 seconds
        setTimeout(() => {
          router.push('/chat?subscription=success');
        }, 2000);
      })
      .catch((error) => {
        console.error('Payment verification failed:', error);
        setStatus('error');
        setErrorMessage(
          error?.data?.error?.message || 
          'Failed to verify payment. Please contact support if you were charged.'
        );
      });
  }, [searchParams, isAuthenticated, verifyCheckoutSession, router]);

  const handleRetry = () => {
    router.push('/subscriptions');
  };

  const handleContactSupport = () => {
    // You can implement contact support logic here
    window.location.href = 'mailto:support@echowrite.com';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8">
        {/* Verifying */}
        {status === 'verifying' && (
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-purple-600" />
            <h2 className="text-2xl font-bold mb-2">Verifying Your Payment</h2>
            <p className="text-gray-600 mb-4">
              Please wait while we confirm your subscription...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="animate-pulse">●</div>
              <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</div>
              <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</div>
            </div>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="text-center">
            <div className="mb-6 relative">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-green-100 animate-ping opacity-75"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Verified!</h2>
            <p className="text-gray-600 mb-4">
              Your subscription has been activated successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to the chat...
            </p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="text-center">
            <XCircle className="h-16 w-16 mx-auto mb-6 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">Verification Failed</h2>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleRetry}
                className="w-full"
              >
                Go to Subscriptions
              </Button>
              <Button 
                onClick={handleContactSupport}
                variant="outline"
                className="w-full"
              >
                Contact Support
              </Button>
            </div>
          </div>
        )}

        {/* No Session */}
        {status === 'no-session' && (
          <div className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-6 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-2 text-yellow-600">No Payment Session</h2>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
            <Button 
              onClick={handleRetry}
              className="w-full"
            >
              View Subscriptions
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

