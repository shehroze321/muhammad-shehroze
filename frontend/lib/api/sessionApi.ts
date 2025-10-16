import { apiSlice } from './apiSlice';

export interface AnonymousSession {
  id: string;
  conversationsUsed: number;
  conversationsLimit: number;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
}

export interface SessionResponse {
  success: boolean;
  data: AnonymousSession;
}

export const sessionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createSession: builder.mutation<SessionResponse, void>({
      query: () => ({
        url: '/sessions',
        method: 'POST',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Store session ID in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('session_id', data.data.id);
          }
        } catch (error) {
          console.error('Failed to create session:', error);
        }
      },
    }),

    getSession: builder.query<SessionResponse, string>({
      query: (sessionId) => `/sessions/${sessionId}`,
    }),

    claimSession: builder.mutation<SessionResponse, string>({
      query: (sessionId) => ({
        url: `/sessions/${sessionId}/claim`,
        method: 'POST',
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          // Clear session ID from localStorage after claiming
          if (typeof window !== 'undefined') {
            localStorage.removeItem('session_id');
          }
        } catch (error) {
          console.error('Failed to claim session:', error);
        }
      },
      invalidatesTags: ['Conversations', 'Messages'],
    }),
  }),
});

export const {
  useCreateSessionMutation,
  useGetSessionQuery,
  useClaimSessionMutation,
} = sessionApi;

