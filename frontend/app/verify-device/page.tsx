'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyDeviceMutation } from '@/lib/api/authApi';
import { useAppSelector } from '@/lib/store/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VerifyDevicePage() {
  const router = useRouter();
  const { pendingUserId } = useAppSelector((state) => state.auth);
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [verifyDevice, { isLoading }] = useVerifyDeviceMutation();

  useEffect(() => {
    if (!pendingUserId) {
      router.push('/login');
    }
  }, [pendingUserId, router]);

  const getDeviceId = (): string => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('device_id') || '';
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!pendingUserId) {
      setError('Session expired. Please login again.');
      return;
    }

    const deviceId = getDeviceId();
    if (!deviceId) {
      setError('Device ID not found. Please try again.');
      return;
    }

    try {
      await verifyDevice({ userId: pendingUserId, deviceId, otp }).unwrap();
      setSuccess('Device verified successfully!');
      setTimeout(() => {
        router.push('/chat');
      }, 2000);
    } catch (err: unknown) {
      const errorData = err as { data?: { error?: string } };
      setError(errorData?.data?.error || 'Verification failed. Please check your code and try again.');
    }
  };

  if (!pendingUserId) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-gray-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify New Device</CardTitle>
          <CardDescription>
            We&apos;ve detected a login from a new device. Please enter the verification code sent to your email.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  setError('');
                }}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
                disabled={isLoading}
              />
              <p className="text-xs text-center text-gray-500">
                Check your email for the verification code
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-brand hover:opacity-90"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Device
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

