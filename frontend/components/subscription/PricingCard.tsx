'use client';

import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SubscriptionPlan } from '@/types';

interface PricingCardProps {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  isLoading?: boolean;
  onSelectPlan?: (planId: string, tier: string) => void;
}

export function PricingCard({ plan, billingCycle, isPopular, isCurrentPlan, isLoading, onSelectPlan }: PricingCardProps) {
  const price = billingCycle === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;
  const displayPrice = billingCycle === 'monthly' ? price : price / 12;

  const getIcon = () => {
    switch (plan.tier) {
      case 'Basic':
        return <Sparkles className="h-6 w-6" />;
      case 'Pro':
        return <Zap className="h-6 w-6" />;
      case 'Enterprise':
        return <Crown className="h-6 w-6" />;
    }
  };

  const getGradient = () => {
    switch (plan.tier) {
      case 'Basic':
        return 'from-gray-600 to-gray-800';
      case 'Pro':
        return 'from-purple-600 to-blue-600';
      case 'Enterprise':
        return 'from-amber-600 to-orange-600';
    }
  };

  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-2xl ${
        isPopular ? 'border-2 border-purple-500 scale-105' : ''
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-bl-lg rounded-tr-lg bg-gradient-to-r from-purple-600 to-blue-600 border-0">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${getGradient()} text-white`}>
          {getIcon()}
        </div>
        <CardTitle className="text-2xl">{plan.tier}</CardTitle>
        <CardDescription>
          {plan.maxMessages === -1 ? 'Unlimited' : plan.maxMessages} posts per month
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">${displayPrice.toFixed(2)}</span>
            <span className="text-gray-500">/month</span>
          </div>
          {billingCycle === 'yearly' && (
            <p className="mt-1 text-sm text-green-600">
              Save ${(plan.pricing.monthly * 12 - plan.pricing.yearly).toFixed(0)} per year
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className="h-5 w-5 flex-shrink-0 text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className={`w-full ${
            isPopular
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              : ''
          }`}
          variant={isPopular ? 'default' : 'outline'}
          onClick={() => onSelectPlan && onSelectPlan(plan.id, plan.tier)}
          disabled={isCurrentPlan || isLoading}
        >
          {isLoading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : 'Get Started'}
        </Button>
      </CardFooter>
    </Card>
  );
}

