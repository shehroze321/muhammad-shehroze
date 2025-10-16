'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLoginMutation } from '@/lib/api/authApi';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setRequiresEmailVerification, setRequiresDeviceVerification, setUser, setPendingPlanSelection } from '@/lib/store/slices/authSlice';
import { Alert, AlertDescription } from '@/components/ui/alert';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated, pendingPlanSelection } = useAppSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  
  const [login, { isLoading }] = useLoginMutation();

  // Get plan selection from query params
  const planId = searchParams.get('planId');
  const tier = searchParams.get('tier');
  const billing = searchParams.get('billing');

  // Store plan selection from query params
  useEffect(() => {
    if (planId && tier && billing) {
      dispatch(setPendingPlanSelection({ planId, tier, billing }));
    }
  }, [planId, tier, billing, dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Go to chat to check subscription status
      router.push('/chat');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await login({ email, password }).unwrap();
      
      // Immediately set the user state if we have user data and token
      if (result.data.user && result.data.token) {
        dispatch(setUser(result.data.user));
      }
      
      // Check if email verification is required (either explicitly or if user's email is not verified)
      if (result.data.requiresEmailVerification || !result.data.user.isEmailVerified) {
        dispatch(setRequiresEmailVerification({ 
          required: true, 
          userId: result.data.user.id,
          email: result.data.user.email 
        }));
        router.push('/verify-email');
      } else if (result.data.requiresDeviceVerification) {
        dispatch(setRequiresDeviceVerification({ required: true, userId: result.data.user.id }));
        router.push('/verify-device');
      } else if (result.data.token) {
        // User is fully authenticated, redirect based on plan selection or subscription status
        if (pendingPlanSelection) {
          router.push('/subscriptions');
        } else {
          // Check if user has active subscription, if yes go to chat, otherwise subscriptions
          // We'll let the chat page handle the subscription check
          router.push('/chat');
        }
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      // Extract error message from different possible error structures
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (err && typeof err === 'object') {
        const error = err as { data?: { message?: string; error?: string }; status?: number; message?: string };
        
        // Check for RTK Query error structure
        if (error.data?.message) {
          errorMessage = error.data.message;
        } else if (error.data?.error) {
          errorMessage = error.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Handle specific error codes
        if (error.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.status === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (error.status && error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      setErrors({ general: errorMessage });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-gray-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Login to continue creating amazing content</CardDescription>
        </CardHeader>

        <CardContent>
          {errors.general && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-brand hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4">
            <Link href="/forgot-password">
              <Button variant="link" className="w-full text-sm">
                Forgot password?
              </Button>
            </Link>
          </div>
        </CardContent>

        <CardFooter className="flex-col space-y-4 border-t pt-6">
          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link 
              href={planId && tier && billing ? `/register?planId=${planId}&tier=${tier}&billing=${billing}` : '/register'} 
              className="font-semibold text-purple-600 hover:underline"
            >
              Sign up for free
            </Link>
          </div>

          <div className="text-center">
            <Link href="/chat">
              <Button variant="outline" size="sm">
                Continue as Guest
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

