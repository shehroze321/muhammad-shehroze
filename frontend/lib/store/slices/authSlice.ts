import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../api/authApi';
import Cookies from 'js-cookie';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresEmailVerification: boolean;
  requiresDeviceVerification: boolean;
  pendingUserId: string | null;
  pendingUserEmail: string | null;
  pendingPlanSelection: {
    planId: string | null;
    tier: string | null;
    billing: string | null;
  } | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!Cookies.get('auth_token'),
  isLoading: false,
  requiresEmailVerification: false,
  requiresDeviceVerification: false,
  pendingUserId: null,
  pendingUserEmail: null,
  pendingPlanSelection: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setRequiresEmailVerification: (state, action: PayloadAction<{ required: boolean; userId?: string; email?: string }>) => {
      state.requiresEmailVerification = action.payload.required;
      state.pendingUserId = action.payload.userId || null;
      state.pendingUserEmail = action.payload.email || null;
    },
    setRequiresDeviceVerification: (state, action: PayloadAction<{ required: boolean; userId?: string }>) => {
      state.requiresDeviceVerification = action.payload.required;
      state.pendingUserId = action.payload.userId || null;
    },
    setPendingPlanSelection: (state, action: PayloadAction<{ planId: string; tier: string; billing: string } | null>) => {
      state.pendingPlanSelection = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.requiresEmailVerification = false;
      state.requiresDeviceVerification = false;
      state.pendingUserId = null;
      state.pendingUserEmail = null;
      state.pendingPlanSelection = null;
      Cookies.remove('auth_token');
    },
  },
});

export const {
  setUser,
  setLoading,
  setRequiresEmailVerification,
  setRequiresDeviceVerification,
  setPendingPlanSelection,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;

