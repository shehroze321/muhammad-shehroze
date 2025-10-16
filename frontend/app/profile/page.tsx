'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, User, Mail, Calendar, Edit2, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAppSelector } from '@/lib/store/hooks';
import { useGetProfileQuery, useUpdateProfileMutation, useLogoutMutation } from '@/lib/api/authApi';
import { useGetUserSubscriptionsQuery } from '@/lib/api/subscriptionApi';
import { Alert, AlertDescription } from '@/components/ui/alert';

function ProfilePageContent() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');

  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery();
  const { data: subscriptionsData } = useGetUserSubscriptionsQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [logout] = useLogoutMutation();

  const profile = user?.isEmailVerified !== undefined ? user : (profileData?.data || user);
  const subscriptions = subscriptionsData?.data?.subscriptions || [];
  const activeSubscription = subscriptions.find(sub => sub.isActive);

  const handleUpdate = async () => {
    setError('');
    
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      await updateProfile({ name }).unwrap();
      setIsEditing(false);
    } catch (err: unknown) {
      const errorData = err as { data?: { error?: string } };
      setError(errorData?.data?.error || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setName(profile?.name || '');
    setIsEditing(false);
    setError('');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoadingProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient-brand">
              EchoWrite
            </span>
          </Link>
          <Link href="/chat">
            <Button variant="outline">Back to Chat</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isUpdating}
                  />
                  <Button 
                    size="sm" 
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="bg-gradient-brand"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{profile?.name}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{profile?.email}</span>
                </div>
                {profile?.isEmailVerified ? (
                  <Badge className="bg-green-500">Verified</Badge>
                ) : (
                  <Badge variant="destructive">Not Verified</Badge>
                )}
              </div>
            </div>

            {/* Joined Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Member Since</label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{new Date(profile?.createdAt || '').toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Your current plan and usage</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSubscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{activeSubscription.tier} Plan</h3>
                    <p className="text-sm text-gray-600">
                      {activeSubscription.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'} billing
                    </p>
                  </div>
                  <Badge className={
                    activeSubscription.isActive ? 'bg-green-500' : 'bg-red-500'
                  }>
                    {activeSubscription.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Messages Used</span>
                    <span className="font-medium">
                      {activeSubscription.usedMessages} / {activeSubscription.maxMessages === -1 ? '∞' : activeSubscription.maxMessages}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-brand h-2 rounded-full transition-all"
                      style={{ 
                        width: activeSubscription.maxMessages === -1 
                          ? '100%' 
                          : `${(activeSubscription.usedMessages / activeSubscription.maxMessages) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                <Link href="/subscriptions">
                  <Button className="w-full bg-gradient-brand hover:opacity-90">
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">No active subscription</p>
                <p className="text-sm text-gray-500 mb-4">
                  Free Messages: {(profile?.freeQuotaLimit || 0) - (profile?.freeQuotaUsed || 0)} / {profile?.freeQuotaLimit || 0} remaining
                </p>
                <Link href="/subscriptions">
                  <Button className="bg-gradient-brand hover:opacity-90">
                    View Plans
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}

