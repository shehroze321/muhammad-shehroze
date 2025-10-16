import { ApiResponse } from '../types';

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
};

export const errorResponse = (
  code: string,
  message: string,
  details?: any
): ApiResponse => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
};

export const generateConversationTitle = (message: string, maxLength = 50): string => {
  const title = message.trim().slice(0, maxLength);
  return title.length < message.trim().length ? `${title}...` : title;
};

export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const groupConversationsByDate = (conversations: any[]) => {
  const now = new Date();
  const groups: Record<string, any[]> = {
    Today: [],
    Yesterday: [],
    'Last 7 Days': [],
    'Last 30 Days': [],
    Older: [],
  };

  conversations.forEach((conv) => {
    const date = new Date(conv.updatedAt);
    const daysDiff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) groups['Today'].push(conv);
    else if (daysDiff === 1) groups['Yesterday'].push(conv);
    else if (daysDiff <= 7) groups['Last 7 Days'].push(conv);
    else if (daysDiff <= 30) groups['Last 30 Days'].push(conv);
    else groups['Older'].push(conv);
  });

  return groups;
};

export const getStartOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getEndOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

export const getFirstDayOfNextMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
};

export const calculateExpiryDate = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

