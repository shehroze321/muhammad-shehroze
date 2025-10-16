import { Conversation, Message, SubscriptionPlan } from '@/types';

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'AI Agents Taking Over Content Creation',
    messageCount: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Social Media Marketing Strategy 2025',
    messageCount: 3,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    title: 'Tech Trends and Innovation',
    messageCount: 8,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
  },
  {
    id: '4',
    title: 'Entrepreneurship Tips',
    messageCount: 2,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: '5',
    title: 'Product Launch Announcement',
    messageCount: 4,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
  },
];

// Mock Messages for a conversation
export const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Create a Twitter post about AI agents taking over content creation',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: '2',
    role: 'assistant',
    content:
      "🤖 AI agents are revolutionizing content creation! They're not replacing creators—they're amplifying human creativity. Imagine having a 24/7 creative partner that never sleeps. The future is collaborative intelligence. #AIContent #FutureOfWork",
    tokens: 450,
    iterations: [
      {
        generation:
          'AI is changing content creation. Content creators now have AI assistants to help them. The future is here.',
        reflection:
          'The post is too generic and lacks specifics. Add more engaging hooks, use emojis, and make it more compelling. The message about collaboration should be clearer.',
      },
      {
        generation:
          "AI agents are helping content creators work smarter. They're becoming valuable partners in the creative process, handling repetitive tasks while humans focus on strategy. The future of content is human + AI.",
        reflection:
          'Better! But needs more punch. Add statistics or specific examples. Use stronger language and emoji to grab attention. Make the CTA clearer.',
      },
      {
        generation:
          "🤖 AI agents are revolutionizing content creation! They're not replacing creators—they're amplifying human creativity. Imagine having a 24/7 creative partner that never sleeps. The future is collaborative intelligence. #AIContent #FutureOfWork",
        reflection:
          'Excellent! Strong hook with emoji, clear value proposition, vivid imagery, and relevant hashtags. Ready to post!',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
  },
  {
    id: '3',
    role: 'user',
    content: 'Make it more focused on the benefits for businesses',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '4',
    role: 'assistant',
    content:
      "📊 Businesses using AI agents for content see 10x productivity gains. Cut creation time from hours to minutes. Scale your content output without scaling your team. Your competitors are already using AI—are you? #ContentMarketing #AIForBusiness",
    tokens: 380,
    iterations: [
      {
        generation:
          'AI agents help businesses create content faster. Companies can produce more content with less time and resources. This improves business efficiency.',
        reflection:
          'Too bland and corporate. Add specific numbers, create urgency, and make it more compelling for business decision-makers.',
      },
      {
        generation:
          'Businesses are seeing 10x improvements in content production with AI agents. Less time, less cost, more output. AI content tools are becoming essential for modern marketing teams.',
        reflection:
          'Good data point! But needs more emotional appeal and urgency. Add a competitive angle and stronger CTA.',
      },
      {
        generation:
          "📊 Businesses using AI agents for content see 10x productivity gains. Cut creation time from hours to minutes. Scale your content output without scaling your team. Your competitors are already using AI—are you? #ContentMarketing #AIForBusiness",
        reflection:
          'Perfect! Statistics, clear benefits, competitive urgency, and strong CTA. Business-focused and action-oriented.',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
];

// Subscription Plans
export const mockPlans: SubscriptionPlan[] = [
  {
    tier: 'Basic',
    maxMessages: 10,
    pricing: {
      monthly: 9.99,
      yearly: 99.0,
    },
    features: [
      '10 AI-powered posts per month',
      'Email support',
      'Basic analytics',
      'Export to text',
    ],
  },
  {
    tier: 'Pro',
    maxMessages: 100,
    pricing: {
      monthly: 29.99,
      yearly: 299.0,
    },
    features: [
      '100 AI-powered posts per month',
      'Priority support',
      'Advanced analytics',
      'Export to all formats',
      'Voice input support',
      'Multi-language support',
    ],
  },
  {
    tier: 'Enterprise',
    maxMessages: -1,
    pricing: {
      monthly: 99.99,
      yearly: 999.0,
    },
    features: [
      'Unlimited AI-powered posts',
      '24/7 dedicated support',
      'Custom AI model training',
      'API access',
      'Team collaboration',
      'White-label option',
      'Advanced security',
    ],
  },
];

