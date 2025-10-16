import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const subscriptionPlans = [
  {
    tier: 'Starter',
    name: 'Starter Plan',
    maxMessages: 50,
    monthlyPrice: 20.00,
    yearlyPrice: 192.00, // 20% discount: $20 * 12 * 0.8 = $192
    features: [
      '50 AI-generated posts per month',
      'Multiple social media formats',
      'Basic content templates',
      'Email support',
      'Content history & search',
      'Export to PDF/Word',
      'Basic analytics dashboard',
      'Mobile-responsive interface',
    ],
    isActive: true,
  },
  {
    tier: 'Professional',
    name: 'Professional Plan',
    maxMessages: 200,
    monthlyPrice: 40.00,
    yearlyPrice: 384.00, // 20% discount: $40 * 12 * 0.8 = $384
    features: [
      '200 AI-generated posts per month',
      'Advanced content optimization',
      'Custom brand voice training',
      'Priority email support',
      'Advanced analytics & insights',
      'Bulk content generation',
      'Multi-platform scheduling',
      'Content calendar integration',
      'Team collaboration (up to 3 users)',
      'Custom templates library',
      'Hashtag research & suggestions',
      'Content performance tracking',
    ],
    isActive: true,
  },
  {
    tier: 'Business',
    name: 'Business Plan',
    maxMessages: -1, // Unlimited
    monthlyPrice: 60.00,
    yearlyPrice: 576.00, // 20% discount: $60 * 12 * 0.8 = $576
    features: [
      'Unlimited AI-generated posts',
      'Advanced AI content strategies',
      'Custom AI model fine-tuning',
      '24/7 priority support',
      'Advanced team management',
      'White-label branding options',
      'API access & integrations',
      'Custom workflow automation',
      'Advanced analytics & reporting',
      'Content approval workflows',
      'Multi-language support',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Advanced security features',
    ],
    isActive: true,
  },
];

async function seedSubscriptionPlans() {
  console.log('🌱 Starting subscription plans seeding...');

  try {
    await prisma.subscriptionPlan.deleteMany({});
    console.log('🗑️  Cleared existing subscription plans');

    for (const plan of subscriptionPlans) {
      await prisma.subscriptionPlan.create({
        data: {
          tier: plan.tier,
          name: plan.name,
          maxMessages: plan.maxMessages,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          features: JSON.stringify(plan.features),
          isActive: plan.isActive,
        },
      });
      console.log(`✅ Created ${plan.tier} plan`);
    }

    console.log('🎉 Subscription plans seeding completed successfully!');
    
    const createdPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: 'asc' },
    });
    
    console.log('\n📋 Created Plans:');
    createdPlans.forEach(plan => {
      const monthlySavings = plan.yearlyPrice / 12;
      const savings = plan.monthlyPrice - monthlySavings;
      console.log(`  - ${plan.tier}: $${plan.monthlyPrice}/month, $${plan.yearlyPrice}/year (Save $${savings.toFixed(2)}/month with yearly)`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedSubscriptionPlans();
  } catch (error) {
    console.error('Failed to seed subscription plans:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedSubscriptionPlans };
