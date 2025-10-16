import { apiSlice } from './apiSlice';

export interface Conversation {
  id: string;
  userId?: string;
  sessionId?: string;
  title: string;
  isAnonymous?: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  success: boolean;
  data: Conversation;
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface GetConversationsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface UpdateConversationRequest {
  title: string;
}

export const conversationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<ConversationsResponse, GetConversationsParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append('search', params.search);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        
        const queryString = searchParams.toString();
        return `/conversations${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Conversations'],
    }),

    getConversation: builder.query<ConversationResponse, string>({
      query: (id) => `/conversations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Conversations', id }],
    }),

    createConversation: builder.mutation<ConversationResponse, CreateConversationRequest>({
      query: (data) => ({
        url: '/conversations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Conversations'],
    }),

    updateConversation: builder.mutation<ConversationResponse, { id: string; data: UpdateConversationRequest }>({
      query: ({ id, data }) => ({
        url: `/conversations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Conversations', id },
        'Conversations',
      ],
    }),

    deleteConversation: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/conversations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Conversations'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useCreateConversationMutation,
  useUpdateConversationMutation,
  useDeleteConversationMutation,
} = conversationApi;

