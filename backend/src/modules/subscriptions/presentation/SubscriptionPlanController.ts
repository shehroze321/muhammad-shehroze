import { Response, NextFunction } from 'express';
import { SubscriptionPlanService } from '../application/SubscriptionPlanService';
import { successResponse } from '../../../shared/utils';
import { AuthRequest } from '../../../shared/types';

export class SubscriptionPlanController {
  constructor(private subscriptionPlanService: SubscriptionPlanService) {}

  getAllPlans = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const plans = await this.subscriptionPlanService.getAllPlans();
      
      const formattedPlans = plans.map(plan => ({
        id: plan.id,
        tier: plan.tier,
        name: plan.name,
        maxMessages: plan.maxMessages,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        features: plan.features,
        isActive: plan.isActive,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      }));

      res.status(200).json(successResponse(formattedPlans));
    } catch (error) {
      next(error);
    }
  };

  createPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { tier, name, maxMessages, monthlyPrice, yearlyPrice, features, isActive } = req.body;

      const plan = await this.subscriptionPlanService.createPlan({
        tier,
        name,
        maxMessages,
        monthlyPrice,
        yearlyPrice,
        features,
        isActive,
      });

      res.status(201).json(
        successResponse({
          id: plan.id,
          tier: plan.tier,
          name: plan.name,
          maxMessages: plan.maxMessages,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          features: plan.features,
          isActive: plan.isActive,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        }, 'Subscription plan created successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  getPlanById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const plan = await this.subscriptionPlanService.getPlanById(id);

      res.status(200).json(
        successResponse({
          id: plan.id,
          tier: plan.tier,
          name: plan.name,
          maxMessages: plan.maxMessages,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          features: plan.features,
          isActive: plan.isActive,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  updatePlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const plan = await this.subscriptionPlanService.updatePlan(id, updateData);

      res.status(200).json(
        successResponse({
          id: plan.id,
          tier: plan.tier,
          name: plan.name,
          maxMessages: plan.maxMessages,
          monthlyPrice: plan.monthlyPrice,
          yearlyPrice: plan.yearlyPrice,
          features: plan.features,
          isActive: plan.isActive,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        }, 'Subscription plan updated successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  deletePlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.subscriptionPlanService.deletePlan(id);

      res.status(200).json(
        successResponse(null, 'Subscription plan deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  };

  togglePlanStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const plan = await this.subscriptionPlanService.togglePlanStatus(id);

      res.status(200).json(
        successResponse({
          id: plan.id,
          tier: plan.tier,
          name: plan.name,
          isActive: plan.isActive,
        }, `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`)
      );
    } catch (error) {
      next(error);
    }
  };
}
