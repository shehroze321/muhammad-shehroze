import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api`,
  prepareHeaders: (headers) => {
    // Get token from cookies
    const token = Cookies.get('auth_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // Get session ID from localStorage (for anonymous users)
    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('session_id') : null;
    if (sessionId && !token) {
      headers.set('X-Session-Id', sessionId);
    }

    return headers;
  },
  credentials: 'include',
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  // If we get a 401, clear the auth state
  if (result.error && result.error.status === 401) {
    // Clear token
    Cookies.remove('auth_token');
    
    // Redirect to login if not already there
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Conversations', 'Messages', 'Subscriptions'],
  endpoints: () => ({}),
});

