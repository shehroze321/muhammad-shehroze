'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatSidebar } from '@/components/layout/ChatSidebar';
import { Header } from '@/components/layout/Header';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAppSelector } from '@/lib/store/hooks';
import { useCreateSessionMutation, useGetSessionQuery } from '@/lib/api/sessionApi';
import { useGetConversationsQuery, useCreateConversationMutation } from '@/lib/api/conversationApi';
import { useSendMessageMutation, useGetMessagesQuery } from '@/lib/api/chatApi';
import { useGetUserSubscriptionsQuery } from '@/lib/api/subscriptionApi';

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarInitialized, setSidebarInitialized] = useState(false);
  const [userManuallyToggled, setUserManuallyToggled] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated && !sidebarInitialized) {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
      setSidebarInitialized(true);
    }
  }, [mounted, isAuthenticated, sidebarInitialized]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    if (mounted && isAuthenticated && sidebarInitialized) {
      const handleResize = () => {
        // Only auto-adjust if user hasn't manually toggled
        if (!userManuallyToggled) {
          if (window.innerWidth >= 768) {
            setSidebarOpen(true);
          } else {
            setSidebarOpen(false);
          }
        } else {
          // If user manually toggled, only close on mobile if currently open
          if (window.innerWidth < 768 && sidebarOpen) {
            setSidebarOpen(false);
          }
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mounted, isAuthenticated, sidebarInitialized, userManuallyToggled, sidebarOpen]);

  // Session management for anonymous users
  const [createSession, { isLoading: isCreatingSession }] = useCreateSessionMutation();
  
  // Only query session data when we have a valid sessionId, are not authenticated, and component is mounted
  const shouldQuerySession = mounted && !isAuthenticated && sessionId && sessionId.trim() !== '';
  const { data: sessionData } = useGetSessionQuery(sessionId || '', {
    skip: !shouldQuerySession || !sessionId,
  });

  // Conversation management - only for authenticated users and when mounted
  const { data: conversationsData, isLoading: isLoadingConversations } = useGetConversationsQuery(undefined, {
    skip: !isAuthenticated || !mounted,
  });
  const [createConversation] = useCreateConversationMutation();

  // Subscription management - only for authenticated users and when mounted
  const { data: subscriptionsData, refetch: refetchSubscriptions, isLoading: isLoadingSubscriptions } = useGetUserSubscriptionsQuery(undefined, {
    skip: !isAuthenticated || !mounted,
  });

  // Check if user has active subscription
  const hasActiveSubscription = subscriptionsData?.data?.subscriptions?.some(
    (sub) => sub.isActive
  );

  // Debug subscription data
  console.log('Chat Page - Subscription Debug:', {
    isAuthenticated,
    isLoadingSubscriptions,
    subscriptionsData,
    hasActiveSubscription,
    subscriptions: subscriptionsData?.data?.subscriptions,
    user: user ? {
      id: user.id,
      email: user.email,
      freeQuotaLimit: user.freeQuotaLimit,
      freeQuotaUsed: user.freeQuotaUsed
    } : null
  });

  // Refetch subscription data when returning from successful payment
  useEffect(() => {
    const subscriptionSuccess = searchParams?.get('subscription');
    if (subscriptionSuccess === 'success' && isAuthenticated && mounted) {
      console.log('Refreshing subscription data after successful payment...');
      refetchSubscriptions();
      // Clean up the URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('subscription');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, isAuthenticated, mounted, refetchSubscriptions]);

  // Message management
  const { data: messagesData, isLoading: isLoadingMessages } = useGetMessagesQuery(
    activeConversationId || '',
    { skip: !activeConversationId }
  );
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  // Initialize session for anonymous users
  useEffect(() => {
    if (!isAuthenticated) {
      const storedSessionId = localStorage.getItem('session_id');
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        createSession()
          .unwrap()
          .then((result) => {
            setSessionId(result.data.id);
          })
          .catch((error) => {
            console.error('Failed to create session:', error);
          });
      }
    }
  }, [isAuthenticated, createSession]);

  // Handle conversation ID from URL
  useEffect(() => {
    const conversationId = searchParams?.get('conversation');
    if (conversationId && conversationId !== activeConversationId) {
      // Check if the conversation exists in the user's conversations
      const conversations = conversationsData?.data?.conversations || [];
      const conversationExists = conversations.some(conv => conv.id === conversationId);
      
      if (conversationExists) {
        setActiveConversationId(conversationId);
      } else if (conversations.length > 0) {
        // If the conversation doesn't exist, redirect to the first available conversation
        const firstConversationId = conversations[0].id;
        setActiveConversationId(firstConversationId);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('conversation', firstConversationId);
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [searchParams, activeConversationId, conversationsData]);

  // Auto-select first conversation if no conversation in URL
  useEffect(() => {
    const conversationId = searchParams?.get('conversation');
    if (!conversationId && conversationsData?.data?.conversations && conversationsData.data.conversations.length > 0 && !activeConversationId) {
      const firstConversationId = conversationsData.data.conversations[0].id;
      setActiveConversationId(firstConversationId);
      // Update URL to include the conversation ID
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('conversation', firstConversationId);
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [conversationsData, activeConversationId, searchParams]);

  const handleNewChat = async () => {
    try {
      const result = await createConversation({ title: 'New Conversation' }).unwrap();
      setActiveConversationId(result.data.id);
      
      // Update URL to include the new conversation ID
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('conversation', result.data.id);
      window.history.pushState({}, '', newUrl.toString());
    } catch (error: unknown) {
      console.error('Failed to create conversation:', error);
      
      // Check if quota exceeded
      const errorData = error as { data?: { error?: string } };
      if (errorData?.data?.error?.includes('quota') || errorData?.data?.error?.includes('limit')) {
        if (!isAuthenticated) {
          alert('You have reached your free conversation limit. Please sign up to continue!');
          router.push('/register');
        } else {
          alert('You have reached your message limit. Please upgrade your subscription!');
          router.push('/subscriptions');
        }
      }
    }
  };

  const handleSendMessage = async (content: string, inputType: string) => {
    // Check if trial has expired before sending message
    if (isAuthenticated && isFreeTrialExpired() && !hasActiveSubscription) {
      setShowTrialExpiredModal(true);
      return;
    }

    if (!activeConversationId) {
      // Create a new conversation first
      try {
        const result = await createConversation({ title: content.slice(0, 50) }).unwrap();
        setActiveConversationId(result.data.id);
        
        // Update URL to include the new conversation ID
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('conversation', result.data.id);
        window.history.pushState({}, '', newUrl.toString());
        
        // Then send the message
        await sendMessage({
          conversationId: result.data.id,
          message: {
            content,
            inputType: inputType as 'text' | 'voice',
          },
        }).unwrap();
      } catch (error: unknown) {
        console.error('Failed to send message:', error);
        handleQuotaError(error);
      }
    } else {
      try {
        await sendMessage({
          conversationId: activeConversationId,
          message: {
            content,
            inputType: inputType as 'text' | 'voice',
          },
        }).unwrap();
      } catch (error: unknown) {
        console.error('Failed to send message:', error);
        handleQuotaError(error);
      }
    }
  };

  const handleQuotaError = (error: unknown) => {
    const errorData = error as { data?: { error?: string } };
    if (errorData?.data?.error?.includes('quota') || errorData?.data?.error?.includes('limit')) {
      if (!isAuthenticated) {
        alert('You have used all 3 free conversations. Please sign up to continue!');
        router.push('/register');
      } else {
        alert('You have reached your message limit. Please upgrade your subscription!');
        router.push('/subscriptions');
      }
    }
  };

  // const conversations = Array.isArray(conversationsData?.data?.conversations) ? conversationsData.data.conversations : [];
  const messages = Array.isArray(messagesData?.data?.messages) ? messagesData.data.messages : [];
  // const currentConversation = conversations.find((c) => c.id === activeConversationId);

  // Calculate quota
  const getQuotaInfo = () => {
    if (isAuthenticated && user) {
      // Check if user has an active subscription
      const subscriptions = subscriptionsData?.data?.subscriptions || [];
      const activeSubscription = subscriptions.find(sub => sub.isActive);
      
      if (activeSubscription) {
        // User has active subscription, use subscription limits
        return {
          remaining: activeSubscription.remaining,
          total: activeSubscription.maxMessages,
        };
      } else {
        // No active subscription, use free quota
        return {
          remaining: user.freeQuotaLimit - user.freeQuotaUsed,
          total: user.freeQuotaLimit,
        };
      }
    } else if (sessionData?.data) {
      return {
        remaining: sessionData.data.conversationsLimit - sessionData.data.conversationsUsed,
        total: sessionData.data.conversationsLimit,
      };
    }
    return { remaining: 3, total: 3 };
  };

  const quotaInfo = getQuotaInfo();
  
  // Debug quota info
  console.log('Chat Page - Quota Info:', {
    isAuthenticated,
    user: user ? {
      id: user.id,
      freeQuotaUsed: user.freeQuotaUsed,
      freeQuotaLimit: user.freeQuotaLimit
    } : null,
    quotaInfo,
    hasActiveSubscription
  });

  // Check if authenticated user's free trial has expired
  const isFreeTrialExpired = () => {
    if (isAuthenticated && user) {
      // If subscription data is still loading, don't show expired modal yet
      if (subscriptionsData === undefined || isLoadingSubscriptions) {
        console.log('Subscription data still loading, not showing expired modal');
        return false;
      }
      
      // Check if user has an active subscription
      const subscriptions = subscriptionsData?.data?.subscriptions || [];
      const activeSubscription = subscriptions.find(sub => sub.isActive);
      
      console.log('Checking subscription status:', {
        subscriptions,
        activeSubscription,
        hasActiveSubscription: !!activeSubscription
      });
      
      // If user has an active subscription, trial is not expired
      if (activeSubscription) {
        console.log('User has active subscription, trial not expired');
        return false;
      }
      
      // If no active subscription, check free quota
      const freeQuotaRemaining = user.freeQuotaLimit - user.freeQuotaUsed;
      console.log('No active subscription, checking free quota:', {
        freeQuotaLimit: user.freeQuotaLimit,
        freeQuotaUsed: user.freeQuotaUsed,
        freeQuotaRemaining
      });
      return freeQuotaRemaining <= 0;
    }
    return false;
  };

  // Debug trial expired status
  console.log('Trial Expired Status:', {
    isFreeTrialExpired: isFreeTrialExpired(),
    hasActiveSubscription,
    isLoadingSubscriptions
  });

  const handleTrialExpiredRedirect = () => {
    console.log('Trial expired redirect triggered - this should not happen for premium users!');
    console.log('Current subscription data:', subscriptionsData);
    console.log('Has active subscription:', hasActiveSubscription);
    setShowTrialExpiredModal(false);
    router.push('/subscriptions');
  };

  const handleCloseTrialExpiredModal = () => {
    setShowTrialExpiredModal(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    
    // Update URL to include the selected conversation ID
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('conversation', conversationId);
    window.history.pushState({}, '', newUrl.toString());
  };

  if (!mounted) {
    return (
      <div className="chat-container flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-1 flex-col">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand mx-auto">
                <Sparkles className="h-10 w-10 text-white animate-pulse" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gradient-brand">
                EchoWrite
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span className="text-gray-600 dark:text-gray-300">Loading your workspace...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar Overlay */}
      {mounted && isAuthenticated && sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50 h-full w-64">
            <ChatSidebar
              onNewChat={handleNewChat}
              onSelectChat={(id) => {
                handleSelectConversation(id);
                setSidebarOpen(false); // Close sidebar on mobile after selection
              }}
              activeConversationId={activeConversationId}
            />
          </div>
        </div>
      )}

       {/* Desktop Sidebar - Always render but control visibility */}
       {mounted && isAuthenticated && (
         <div className={`${sidebarOpen ? 'hidden md:block' : 'hidden'}`}>
           <ChatSidebar
             onNewChat={handleNewChat}
             onSelectChat={handleSelectConversation}
             activeConversationId={activeConversationId}
           />
         </div>
       )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        <Header
          onToggleSidebar={mounted && isAuthenticated ? () => {
            setUserManuallyToggled(true);
            setSidebarOpen(!sidebarOpen);
          } : undefined}
          sidebarOpen={sidebarOpen}
          quotaRemaining={quotaInfo.remaining}
          quotaTotal={quotaInfo.total}
          hasActiveSubscription={hasActiveSubscription}
        />

        {/* Background Content */}
        <div className="flex flex-1 flex-col">

          {/* Messages Area */}
          <div className="chat-messages flex-1 overflow-y-auto p-4 min-h-0" style={{ maxHeight: 'calc(100vh - 180px)' }}>
            <div className="mx-auto max-w-3xl">
              {isLoadingConversations || isCreatingSession ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <EmptyState onExampleClick={(text) => handleSendMessage(text, 'text')} />
              ) : (
                <div className="space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))
                  )}
                </div>
              )}

              {isSending && (
                <div className="flex items-center gap-3 text-gray-500 mt-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">AI is crafting your perfect post...</span>
                </div>
              )}
              
              {/* Bottom padding for better scrolling */}
              <div className="h-8"></div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t bg-white dark:bg-gray-900 pb-4">
            <div className="mx-auto max-w-3xl px-4 pt-4">
              <ChatInput onSend={handleSendMessage} disabled={isSending} />
            </div>
          </div>
        </div>

        {/* Free Trial Expired Modal Overlay */}
        {showTrialExpiredModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border max-w-md w-full mx-4 p-6 text-center">
              <div className="mb-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Free Trial Expired
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You&apos;ve used all your free messages. Choose a plan to continue creating amazing content with AI.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleCloseTrialExpiredModal} 
                  className="flex-1"
                >
                  Close
                </Button>
                <Button onClick={handleTrialExpiredRedirect} className="flex-1">
                  View Subscription Plans
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onExampleClick }: { onExampleClick: (text: string) => void }) {
  const examples = [
    'Create a LinkedIn post about AI automation',
    'Write a Twitter thread about tech trends',
    'Generate an Instagram caption for product launch',
  ];

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand">
        <Sparkles className="h-10 w-10 text-white" />
      </div>
      <h2 className="mb-2 text-3xl font-bold text-gradient-brand">
        EchoWrite
      </h2>
      <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
        Create engaging social media posts with AI. Get 3 iterations of refinement for the perfect
        content every time.
      </p>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Try an example:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {examples.map((example, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => onExampleClick(example)}
              className="hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20"
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <ChatPageContent />
    </ProtectedRoute>
  );
}
