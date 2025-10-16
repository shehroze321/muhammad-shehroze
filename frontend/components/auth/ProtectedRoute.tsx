'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // Show loading state while checking auth
  if (isLoading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If user needs email verification, redirect to verification page (only for authenticated users)
  // But allow access to profile page even if email verification status is unclear
  if (requireAuth && isAuthenticated && user && user.isEmailVerified === false && typeof window !== 'undefined' && window.location.pathname !== '/verify-email' && window.location.pathname !== '/profile') {
    console.log('ProtectedRoute - Redirecting to verify email:', {
      isAuthenticated,
      userEmail: user.email,
      isEmailVerified: user.isEmailVerified,
      currentPath: window.location.pathname
    });
    router.push('/verify-email');
    return null;
  }

  return <>{children}</>;
}

