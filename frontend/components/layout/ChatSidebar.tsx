'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, MessageSquare, Edit2, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import Link from 'next/link';
import { useGetConversationsQuery, useDeleteConversationMutation, useUpdateConversationMutation, Conversation } from '@/lib/api/conversationApi';
import { useAppSelector } from '@/lib/store/hooks';
import { useGetUserSubscriptionsQuery } from '@/lib/api/subscriptionApi';

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  activeConversationId?: string | null;
}

export function ChatSidebar({
  onNewChat,
  onSelectChat,
  activeConversationId,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Get user subscriptions to check if they have premium
  const { data: subscriptionsData } = useGetUserSubscriptionsQuery(undefined, {
    skip: !isAuthenticated,
  });
  
  const hasActiveSubscription = subscriptionsData?.data?.subscriptions?.some(
    (sub) => sub.isActive
  );
  
  const { data: conversationsData, isLoading, refetch } = useGetConversationsQuery(
    { search: searchTerm, page, limit: 20 },
    {
      skip: !isAuthenticated,
    }
  );
  
  const [deleteConversation] = useDeleteConversationMutation();
  const [updateConversation] = useUpdateConversationMutation();

  // Update conversations list when data changes
  useEffect(() => {
    if (conversationsData?.data) {
      console.log('ChatSidebar - Received conversations data:', {
        searchTerm,
        page,
        conversations: conversationsData.data.conversations,
        total: conversationsData.data.total,
        hasMore: conversationsData.data.hasMore
      });
      
      if (page === 1) {
        // For page 1, always replace conversations (handles search reset)
        setAllConversations(conversationsData.data.conversations);
      } else {
        // For subsequent pages, append to existing conversations
        setAllConversations(prev => [...prev, ...conversationsData.data.conversations]);
      }
      setHasMore(conversationsData.data.hasMore);
      setIsLoadingMore(false);
    }
  }, [conversationsData, page]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoadingMore]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const groupedConversations = groupByDate(allConversations);
  
  // Debug grouped conversations
  console.log('ChatSidebar - Grouped conversations:', {
    searchTerm,
    allConversations: allConversations.length,
    groupedConversations,
    hasActiveSubscription
  });

  const handleDelete = (conversation: Conversation) => {
    setConversationToDelete(conversation);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteConversation(conversationToDelete.id).unwrap();
      setDeleteModalOpen(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      // You could add a toast notification here instead of alert
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setConversationToDelete(null);
  };

  const handleRename = async (id: string, newTitle: string) => {
    try {
      // Optimistically update the local state to prevent reordering
      setAllConversations(prev => 
        prev.map(conv => 
          conv.id === id ? { ...conv, title: newTitle } : conv
        )
      );
      
      await updateConversation({ id, data: { title: newTitle } }).unwrap();
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      alert('Failed to rename conversation');
      // Revert on error
      refetch();
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b p-3">
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-brand hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div 
        className="sidebar-scroll flex-1 overflow-y-auto px-2 min-h-0"
        onScroll={handleScroll}
        style={{ maxHeight: 'calc(100vh - 160px)' }}
      >
        {isLoading && page === 1 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : allConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {searchTerm ? 'Try a different search term' : 'Start a new chat!'}
            </p>
          </div>
        ) : (
          Object.entries(groupedConversations)
            .filter(([, convs]) => convs.length > 0)
            .map(([group, convs]) => (
              <div key={group} className="mb-4">
                <h3 className="mb-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {group}
                </h3>
                {convs.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onSelect={onSelectChat}
                    onDelete={handleDelete}
                    onRename={handleRename}
                  />
                ))}
              </div>
            ))
        )}
        
        {/* Loading More Indicator */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="ml-2 text-sm text-gray-500">Loading more...</span>
          </div>
        )}
        
        {/* Bottom padding for better scrolling */}
        <div className="h-4"></div>
      </div>

      {/* Upgrade Prompt - Only show if user doesn't have active subscription */}
      {!hasActiveSubscription && (
        <div className="border-t p-3">
          <div className="rounded-lg bg-gradient-brand p-3 text-white">
            <div className="mb-2 flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              <p className="text-sm font-semibold">
                {!isAuthenticated ? 'Sign Up for More' : 'Upgrade to Pro'}
              </p>
            </div>
            <p className="mb-2 text-xs opacity-90">
              {!isAuthenticated ? 'Get unlimited conversations' : 'Get 100 messages/month'}
            </p>
            <Link href={!isAuthenticated ? '/register' : '/subscriptions'}>
              <Button size="sm" className="w-full bg-white text-purple-600 hover:bg-gray-100">
                {!isAuthenticated ? 'Sign Up Free' : 'Upgrade Now'}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete chat?"
        isLoading={isDeleting}
      />
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (conversation: Conversation) => void;
  onRename: (id: string, title: string) => void;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: ConversationItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(conversation.title);
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle.trim() !== conversation.title) {
      onRename(conversation.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(conversation.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(conversation);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      className={`group relative mb-1 flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors ${
        isActive
          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      onClick={() => !isEditing && onSelect(conversation.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0" />
      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className="w-full bg-transparent text-sm font-medium outline-none border-none focus:ring-0"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <p className="truncate text-sm font-medium">{conversation.title}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(conversation.updatedAt)}
        </p>
      </div>

      {isHovered && !isEditing && (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleEdit}
            className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Rename"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={handleDelete}
            className={`rounded p-1 transition-colors ${
              showDeleteConfirm 
                ? 'bg-red-100 text-red-600 dark:bg-red-950/30' 
                : 'hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30'
            }`}
            title={showDeleteConfirm ? "Click again to delete" : "Delete"}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}

      {isEditing && (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleSave}
            className="rounded p-1 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-950/30"
            title="Save (Enter)"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={handleCancel}
            className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Cancel (Escape)"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function groupByDate(conversations: Conversation[]) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    'Last 7 Days': [],
    Older: [],
  };

  conversations.forEach((conv) => {
    const date = new Date(conv.updatedAt);
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      groups.Today.push(conv);
    } else if (diffDays === 1) {
      groups.Yesterday.push(conv);
    } else if (diffDays <= 7) {
      groups['Last 7 Days'].push(conv);
    } else {
      groups.Older.push(conv);
    }
  });

  return groups;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
