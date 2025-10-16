const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestUser() {
  try {
    console.log('🔄 Seeding test user...');

    // Test user credentials
    const testEmail = 'test@echowrite.com';
    const testPassword = 'Test123!@#';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    let testUser;

    if (existingUser) {
      console.log('✅ Test user already exists');
      testUser = existingUser;
    } else {
      // Create test user
      testUser = await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          name: 'Test User (Premium)',
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          freeQuotaUsed: 0,
          freeQuotaLimit: 3,
        },
      });
      console.log('✅ Test user created:', testEmail);
    }

    // Get or create Business (Premium) plan
    let premiumPlan = await prisma.subscriptionPlan.findFirst({
      where: { tier: 'Business' },
    });

    if (!premiumPlan) {
      premiumPlan = await prisma.subscriptionPlan.create({
        data: {
          tier: 'Business',
          name: 'Business Plan',
          maxMessages: -1, // Unlimited
          monthlyPrice: 60.0,
          yearlyPrice: 576.0,
          features: [
            'Unlimited AI-generated posts',
            'Advanced AI models',
            'Priority support',
            'Custom brand voice',
            'Team collaboration',
            'Analytics & insights',
            'API access',
            'White-label option',
          ],
          isActive: true,
        },
      });
      console.log('✅ Premium plan created');
    }

    // Check if test user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: testUser.id,
        status: 'active',
      },
    });

    if (existingSubscription) {
      console.log('✅ Test user already has active subscription');
    } else {
      // Delete any old subscriptions
      await prisma.subscription.deleteMany({
        where: { userId: testUser.id },
      });

      // Create premium subscription for test user (1 year validity)
      const subscription = await prisma.subscription.create({
        data: {
          userId: testUser.id,
          planId: premiumPlan.id,
          status: 'active',
          billingCycle: 'yearly',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          messagesUsed: 0,
          stripeSubscriptionId: 'test_sub_' + Date.now(),
        },
      });
      console.log('✅ Premium subscription created for test user');
    }

    console.log('\n🎉 Test User Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('💎 Plan: Business (Premium) - Unlimited Messages');
    console.log('✅ Email Verified: Yes');
    console.log('📅 Subscription Valid Until:', new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error seeding test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestUser()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

