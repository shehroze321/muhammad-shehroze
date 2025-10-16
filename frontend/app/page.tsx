'use client';

import Link from 'next/link';
import { Sparkles, MessageSquare, Zap, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { useAppSelector } from '@/lib/store/hooks';
import { useGetUserSubscriptionsQuery } from '@/lib/api/subscriptionApi';

export default function LandingPage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const { data: subscriptionsData } = useGetUserSubscriptionsQuery(undefined, {
    skip: !isAuthenticated,
  });
  
  const hasActiveSubscription = subscriptionsData?.data?.subscriptions?.some(
    (sub) => sub.isActive
  );
  const getQuotaInfo = () => {
    if (isAuthenticated && user) {
      const subscriptions = subscriptionsData?.data?.subscriptions || [];
      const activeSubscription = subscriptions.find(sub => sub.isActive);
      
      if (activeSubscription) {
        return {
          remaining: activeSubscription.remaining,
          total: activeSubscription.maxMessages,
        };
      } else {
        return {
          remaining: user.freeQuotaLimit - user.freeQuotaUsed,
          total: user.freeQuotaLimit,
        };
      }
    }
    return { remaining: 3, total: 3 };
  };

  const quotaInfo = getQuotaInfo();
  const features = [
    {
      icon: Sparkles,
      title: '3-Iteration AI Refinement',
      description: 'Each post goes through generate → critique → improve cycle for perfection',
    },
    {
      icon: MessageSquare,
      title: 'ChatGPT-Like Interface',
      description: 'Familiar conversation interface with full history and search',
    },
    {
      icon: Zap,
      title: 'Multi-Language Support',
      description: 'Create posts in English and Urdu with voice or text input',
    },
    {
      icon: Shield,
      title: 'Flexible Pricing',
      description: '3 free messages, then choose from Basic, Pro, or Enterprise',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-blue-50">
      <Header 
        quotaRemaining={quotaInfo.remaining}
        quotaTotal={quotaInfo.total}
        hasActiveSubscription={hasActiveSubscription || false}
      />
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4 bg-gradient-brand border-0 text-white">
          Powered by OpenAI GPT-4
        </Badge>

        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Create Viral Social Posts
          <br />
          <span className="text-gradient-brand">
            with AI in Seconds
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          Transform your ideas into engaging social media posts with AI. Get 3 iterations of
          refinement to ensure every post is perfect, engaging, and ready to go viral.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/chat">
            <Button size="lg" className="bg-gradient-brand hover:opacity-90">
              Try for Free (No Login Required)
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/subscriptions">
            <Button size="lg" variant="outline">
              View Pricing
            </Button>
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Get 3 free conversations • No credit card required
        </p>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Why Choose EchoWrite?</h2>
          <p className="text-gray-600">
            Everything you need to create perfect social media content
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <Card key={idx} className="border-2 transition-all hover:border-purple-400 hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-brand">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
          <p className="text-gray-600">
            Three simple steps to perfect social posts
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Input Your Idea',
                description: 'Type or speak your post idea in English or Urdu',
              },
              {
                step: '2',
                title: 'AI Refines It',
                description: '3 iterations of generation and critique for quality',
              },
              {
                step: '3',
                title: 'Copy & Post',
                description: 'Get the perfect post ready to share on any platform',
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Create Viral Content?</h2>
            <p className="mb-8 text-gray-600">
              Join thousands of creators using AI to amplify their social media presence
            </p>
            <Link href="/chat">
              <Button size="lg" className="bg-gradient-brand hover:opacity-90">
                Start Creating for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 EchoWrite. Built for assessment. Powered by OpenAI.</p>
        </div>
      </footer>
    </div>
  );
}