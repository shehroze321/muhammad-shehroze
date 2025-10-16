import { apiSlice } from './apiSlice';

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  inputType?: 'text' | 'voice';
  language?: 'en' | 'ur';
  tokens?: number;
  iterations?: {
    generation: string;
    reflection: string;
  }[];
  createdAt: string;
}

export interface ChatMessagesResponse {
  success: boolean;
  data: {
    messages: ChatMessage[];
    conversation: {
      id: string;
      title: string;
    };
  };
}

export interface SendMessageRequest {
  content: string;
  inputType?: 'text' | 'voice';
  language?: 'en' | 'ur';
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    userMessage: ChatMessage;
    aiMessage: ChatMessage;
    quotaRemaining: number;
  };
}

export interface QuotaResponse {
  success: boolean;
  data: {
    quotaRemaining: number;
    quotaLimit: number;
    hasActiveSubscription: boolean;
  };
}

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation<SendMessageResponse, { conversationId: string; message: SendMessageRequest }>({
      query: ({ conversationId, message }) => ({
        url: `/chat/conversations/${conversationId}/messages`,
        method: 'POST',
        body: message,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
        { type: 'Conversations', id: conversationId },
        'Conversations',
        'User', // Invalidate user data to update quota information
      ],
    }),

    getMessages: builder.query<ChatMessagesResponse, string>({
      query: (conversationId) => `/chat/conversations/${conversationId}/messages`,
      providesTags: (result, error, conversationId) => [
        { type: 'Messages', id: conversationId },
      ],
    }),

    getQuota: builder.query<QuotaResponse, void>({
      query: () => '/chat/quota',
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetMessagesQuery,
  useGetQuotaQuery,
} = chatApi;

