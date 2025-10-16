import cron from 'node-cron';
import { UserRepository } from '../modules/users/infrastructure/UserRepository';
import { SessionRepository } from '../modules/sessions/infrastructure/SessionRepository';
import { SubscriptionRepository } from '../modules/subscriptions/infrastructure/SubscriptionRepository';
import { SubscriptionPlanRepository } from '../modules/subscriptions/infrastructure/SubscriptionPlanRepository';
import { SubscriptionService } from '../modules/subscriptions/application/SubscriptionService';
import { SubscriptionPlanService } from '../modules/subscriptions/application/SubscriptionPlanService';

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const subscriptionRepository = new SubscriptionRepository();
const subscriptionPlanRepository = new SubscriptionPlanRepository();
const subscriptionPlanService = new SubscriptionPlanService(subscriptionPlanRepository);
const subscriptionService = new SubscriptionService(subscriptionRepository, subscriptionPlanService);

export const resetFreeQuotaJob = cron.schedule('0 0 1 * *', async () => {
  try {
    console.log('Running monthly quota reset job...');

    const users = await userRepository.findUsersNeedingQuotaReset();

    for (const user of users) {
      await userRepository.resetFreeQuota(user.id);
      console.log(`Reset quota for user: ${user.email}`);
    }

    console.log(`Quota reset complete. ${users.length} users processed.`);
  } catch (error) {
    console.error('Error in quota reset job:', error);
  }
});

export const cleanupExpiredSessionsJob = cron.schedule('0 2 * * *', async () => {
  try {
    console.log('Running expired sessions cleanup job...');

    const deleted = await sessionRepository.deleteExpiredSessions();

    console.log(`Cleanup complete. ${deleted} expired sessions removed.`);
  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
});

export const subscriptionRenewalJob = cron.schedule('0 3 * * *', async () => {
  try {
    console.log('Running subscription auto-renewal job...');

    const result = await subscriptionService.processAutoRenewals();

    console.log(
      `Renewal complete. ${result.renewed} renewed, ${result.failed} failed.`
    );
  } catch (error) {
    console.error('Error in renewal job:', error);
  }
});

export const startCronJobs = () => {
  console.log('Starting cron jobs...');
  resetFreeQuotaJob.start();
  cleanupExpiredSessionsJob.start();
  subscriptionRenewalJob.start();
  console.log('Cron jobs started successfully');
  console.log('   - Monthly quota reset (1st of month, midnight)');
  console.log('   - Session cleanup (daily, 2 AM)');
  console.log('   - Subscription renewal (daily, 3 AM)');
};

export const stopCronJobs = () => {
  resetFreeQuotaJob.stop();
  cleanupExpiredSessionsJob.stop();
  subscriptionRenewalJob.stop();
  console.log('Cron jobs stopped');
};

