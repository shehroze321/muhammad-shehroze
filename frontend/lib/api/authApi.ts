import { apiSlice } from './apiSlice';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: string;
  freeQuotaUsed: number;
  freeQuotaLimit: number;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  deviceId: string;
  userAgent: string;
  ipAddress?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token?: string;
    requiresEmailVerification?: boolean;
    requiresDeviceVerification?: boolean;
    message?: string;
  };
}

export interface VerifyEmailRequest {
  userId: string;
  otp: string;
}

export interface VerifyDeviceRequest {
  userId: string;
  deviceId: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  userId: string;
  otp: string;
  newPassword: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// Helper function to get or create device ID
const getDeviceId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

// Helper function to get device info
const getDeviceInfo = (): DeviceInfo => {
  return {
    deviceId: getDeviceId(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
  };
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, Omit<RegisterRequest, 'deviceInfo'>>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: {
          ...credentials,
          deviceInfo: getDeviceInfo(),
        },
      }),
      invalidatesTags: ['User'],
    }),

    login: builder.mutation<AuthResponse, Omit<LoginRequest, 'deviceInfo'>>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: {
          ...credentials,
          deviceInfo: getDeviceInfo(),
        },
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Store token in cookies if provided
          if (data.data.token) {
            Cookies.set('auth_token', data.data.token, { expires: 7 }); // 7 days
          }
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Ignore errors, always clear local auth state
        } finally {
          // Clear token and user data
          Cookies.remove('auth_token');
        }
      },
      invalidatesTags: ['User', 'Conversations', 'Messages', 'Subscriptions'],
    }),

    getProfile: builder.query<{ success: boolean; data: User }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation<{ success: boolean; data: User }, { name: string }>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    verifyEmail: builder.mutation<{ success: boolean; data: { success: boolean; message: string } }, VerifyEmailRequest>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    verifyDevice: builder.mutation<{ success: boolean; data: { token: string; message: string } }, VerifyDeviceRequest>({
      query: (data) => ({
        url: '/auth/verify-device',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Store token in cookies
          if (data.data.token) {
            Cookies.set('auth_token', data.data.token, { expires: 7 });
          }
        } catch (error) {
          console.error('Device verification failed:', error);
        }
      },
      invalidatesTags: ['User'],
    }),

    forgotPassword: builder.mutation<{ success: boolean; data: { message: string } }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation<{ success: boolean; data: { message: string } }, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    resendVerification: builder.mutation<{ success: boolean; data: { message: string } }, ResendVerificationRequest>({
      query: (data) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useVerifyEmailMutation,
  useVerifyDeviceMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendVerificationMutation,
} = authApi;

