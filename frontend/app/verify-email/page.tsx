'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyEmailMutation, useResendVerificationMutation } from '@/lib/api/authApi';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { setUser } from '@/lib/store/slices/authSlice';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VerifyEmailPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { pendingUserId, pendingUserEmail, user, pendingPlanSelection } = useAppSelector((state) => state.auth);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const userId = pendingUserId || user?.id;

  useEffect(() => {
    if (!userId) {
      router.push('/register');
    }
  }, [userId, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const otpString = otp.join('');
    if (!otpString || otpString.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!userId) {
      setError('User ID not found. Please register again.');
      return;
    }

    try {
      console.log('Verifying email with:', { userId, otp: otpString });
      const result = await verifyEmail({ userId, otp: otpString }).unwrap();
      
      setSuccess('Email verified successfully!');
      
      // Email verification successful - redirect to login or chat
      setTimeout(() => {
        if (pendingPlanSelection) {
          router.push('/subscriptions');
        } else {
          // Go to chat to check subscription status
          router.push('/chat');
        }
      }, 2000);
    } catch (err: unknown) {
      console.error('Email verification error:', err);
      const errorData = err as { data?: { error?: string | { message?: string } } };
      setError(errorData?.data?.error?.message || errorData?.data?.error || 'Verification failed. Please check your code and try again.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const numValue = value.replace(/\D/g, '');
    
    if (numValue.length > 1) {
      // Handle paste or multiple characters
      const pasted = numValue.slice(0, 6);
      const newOtp = [...otp];
      pasted.split('').forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus on the next empty input or the last one
      const nextIndex = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      setError('');
    } else {
      // Single character input
      const newOtp = [...otp];
      newOtp[index] = numValue;
      setOtp(newOtp);
      
      // Move to next input if value is entered
      if (numValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      setError('');
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    
    const emailToUse = pendingUserEmail || user?.email;
    
    if (!emailToUse) {
      setError('Email address not found. Please register again.');
      return;
    }

    try {
      await resendVerification({ email: emailToUse }).unwrap();
      setSuccess('Verification code sent! Please check your email.');
    } catch (err: unknown) {
      const errorData = err as { data?: { error?: string | { message?: string } } };
      setError(errorData?.data?.error?.message || errorData?.data?.error || 'Failed to resend code. Please try again.');
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-gray-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a 6-digit verification code to your email address
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{typeof error === 'string' ? error : 'An error occurred. Please try again.'}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-900">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 focus:border-purple-500"
                    maxLength={1}
                    disabled={isVerifying}
                    autoComplete="off"
                  />
                ))}
              </div>
              <p className="text-xs text-center text-gray-500">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-brand hover:opacity-90"
              disabled={isVerifying || otp.join('').length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn&apos;t receive the code?
            </p>
            <Button
              variant="link"
              onClick={handleResend}
              disabled={isResending}
              className="text-purple-600"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Code'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

