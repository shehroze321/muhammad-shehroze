'use client';

import { Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface QuotaWidgetProps {
  type: 'free' | 'subscription' | 'anonymous';
  used: number;
  total: number;
  tier?: string;
}

export function QuotaWidget({ type, used, total, tier }: QuotaWidgetProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  const remaining = total - used;

  const getColor = () => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-gradient-to-r from-purple-600 to-blue-600';
  };

  return (
    <Card className="overflow-hidden border-2">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {type === 'anonymous' && 'Free Conversations'}
            {type === 'free' && 'Free Messages'}
            {type === 'subscription' && `${tier} Plan`}
          </CardTitle>
          <Badge
            variant="outline"
            className={`${getColor()} border-current`}
          >
            {remaining} left
          </Badge>
        </div>
        <CardDescription>
          {type === 'anonymous' && 'No login required'}
          {type === 'free' && 'Resets monthly'}
          {type === 'subscription' && 'Active subscription'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Used</span>
              <span className="font-semibold">
                {used}/{total === -1 ? '∞' : total}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className={`h-full rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {type === 'free' && remaining === 0 && (
            <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950/20">
              <p className="mb-2 text-sm font-semibold text-purple-900 dark:text-purple-100">
                You&apos;ve used all free messages
              </p>
              <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                Upgrade to Continue
              </Button>
            </div>
          )}

          {type === 'anonymous' && remaining <= 1 && (
            <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
              <p className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                Almost out of free chats!
              </p>
              <p className="mb-2 text-xs text-blue-700 dark:text-blue-300">
                Sign up to get 3 more messages per month
              </p>
              <Button size="sm" variant="outline" className="w-full border-blue-500 hover:bg-blue-50">
                Create Free Account
              </Button>
            </div>
          )}

          {type === 'subscription' && (
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Active
                </span>
              </div>
              <span className="text-xs text-green-700 dark:text-green-300">
                Renews Nov 15
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

