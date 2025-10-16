'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForgotPasswordMutation } from '@/lib/api/authApi';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState('');
  
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      const result = await forgotPassword({ email }).unwrap();
      console.log('Forgot password result:', result);
      // The API returns { data: { message, userId } }
      if (result.data?.userId) {
        setUserId(result.data.userId);
      } else if (result.userId) {
        // Fallback in case the response structure changes
        setUserId(result.userId);
      }
      setSuccess(true);
    } catch (err: unknown) {
      console.error('Forgot password error:', err);
      let errorMessage = 'Failed to send reset code. Please try again.';
      
      if (err && typeof err === 'object') {
        const error = err as { 
          data?: { 
            message?: string; 
            error?: string | { code?: string; message?: string }; 
          }; 
          status?: number; 
          message?: string;
        };
        
        if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.data?.error) {
          if (typeof error.data.error === 'string') {
            errorMessage = error.data.error;
          } else if (error.data.error.message) {
            errorMessage = error.data.error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        if (error.status === 404) {
          errorMessage = 'Service not available. Please try again later.';
        } else if (error.status && error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      setError(errorMessage);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-gray-50 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset code to your email address
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-green-500 bg-green-50 text-green-900">
              <AlertDescription>
                If an account exists with this email, you will receive a password reset code shortly.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => router.push(`/reset-password?userId=${userId || ''}`)}
              className="w-full bg-gradient-brand hover:opacity-90"
            >
              Continue to Reset Password
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center">
              <Link href="/login">
                <Button variant="link" className="text-sm">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-gray-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a code to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-brand hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  Send Reset Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/login">
              <Button variant="link" className="text-sm">
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

