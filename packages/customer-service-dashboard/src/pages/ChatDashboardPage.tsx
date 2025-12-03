import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, User, Send, UserPlus, X, Sparkles, Clock, CheckCircle, XCircle, Bot, Users, Inbox, Archive } from 'lucide-react';
import { api } from '../lib/api';
import { useSearchParams } from 'react-router-dom';

interface ChatConversation {
  id: string;
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  status: 'open' | 'in-progress' | 'closed' | 'escalated' | 'queued';
  assigned_to: string | null;
  assigned_staff_first_name: string | null;
  assigned_staff_last_name: string | null;
  started_at: string;
  last_message_at: string;
  message_count: number;
  last_message: string;
  priority?: string;
  sentiment?: string;
  resolution_type?: 'ai_resolved' | 'staff_resolved' | 'inactive_closed';
  queue_entered_at?: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'staff' | 'ai' | 'system';
  sender_id: string | null;
  sender_name: string | null;
  content: string;
  created_at: string;
}

type TabType = 'ai' | 'staff' | 'queued' | 'closed';

const chatApi = {
  listConversations: async (tab: TabType) => {
    const response = await api.get(`/api/chat/conversations?tab=${tab}`);
    return response.data;
  },
  getConversation: async (id: string) => {
    const response = await api.get(`/api/chat/conversation/${id}`);
    return response.data;
  },
  takeoverConversation: async (id: string) => {
    const response = await api.post(`/api/chat/conversation/${id}/takeover`);
    return response.data;
  },
  replyToConversation: async (id: string, message: string) => {
    const response = await api.post(`/api/chat/conversation/${id}/reply`, { message });
    return response.data;
  },
  closeConversation: async (id: string, resolutionType: 'resolved' | 'closed') => {
    const response = await api.post(`/api/chat/conversation/${id}/close`, { resolution_type: resolutionType });
    return response.data;
  },
  pickupFromQueue: async (id: string) => {
    const response = await api.post(`/api/chat/conversation/${id}/pickup`);
    return response.data;
  },
};

// Tab configuration
const tabs: { key: TabType; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'ai', label: 'AI', icon: <Sparkles className="w-4 h-4" />, description: 'Active chats with AI' },
  { key: 'staff', label: 'Staff Live', icon: <Users className="w-4 h-4" />, description: 'Escalated to staff' },
  { key: 'queued', label: 'Queued', icon: <Inbox className="w-4 h-4" />, description: 'Awaiting staff' },
  { key: 'closed', label: 'Closed', icon: <Archive className="w-4 h-4" />, description: 'Resolved & inactive' },
];

export default function ChatDashboardPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('ai');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);

  // Check for conversation or ticket param in URL (from ticket list click)
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    const ticketId = searchParams.get('ticket');
    
    if (conversationId) {
      setSelectedConversation(conversationId);
      // Remove from URL after setting
      searchParams.delete('conversation');
      setSearchParams(searchParams, { replace: true });
    } else if (ticketId) {
      // Fetch conversation by ticket ID
      api.get(`/api/chat/conversation/by-ticket/${ticketId}`)
        .then(res => {
          if (res.data.conversation) {
            setSelectedConversation(res.data.conversation.id);
            // Determine which tab based on conversation status
            const conv = res.data.conversation;
            if (conv.status === 'closed' || conv.resolution_type) {
              setActiveTab('closed');
            } else if (conv.status === 'queued' || conv.status === 'escalated') {
              setActiveTab('queued');
            } else if (conv.assigned_to === 'ai-agent-001') {
              setActiveTab('ai');
            } else {
              setActiveTab('staff');
            }
          }
        })
        .catch(err => console.error('Failed to find conversation for ticket:', err));
      // Remove from URL after setting
      searchParams.delete('ticket');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Fetch conversations for active tab
  const { data: conversationsData, isLoading: loadingConversations } = useQuery({
    queryKey: ['chat-conversations', activeTab],
    queryFn: () => chatApi.listConversations(activeTab),
    refetchInterval: 5000,
  });

  // Fetch all tab counts
  const { data: tabCounts } = useQuery({
    queryKey: ['chat-tab-counts'],
    queryFn: async () => {
      const [ai, staff, queued, closed] = await Promise.all([
        api.get('/api/chat/conversations?tab=ai&count_only=true'),
        api.get('/api/chat/conversations?tab=staff&count_only=true'),
        api.get('/api/chat/conversations?tab=queued&count_only=true'),
        api.get('/api/chat/conversations?tab=closed&count_only=true'),
      ]);
      return {
        ai: ai.data.count || 0,
        staff: staff.data.count || 0,
        queued: queued.data.count || 0,
        closed: closed.data.count || 0,
      };
    },
    refetchInterval: 10000,
  });

  // Fetch selected conversation details
  const { data: conversationData, isLoading: loadingConversation } = useQuery({
    queryKey: ['chat-conversation', selectedConversation],
    queryFn: () => chatApi.getConversation(selectedConversation!),
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  // Takeover mutation
  const takeoverMutation = useMutation({
    mutationFn: (id: string) => chatApi.takeoverConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversation'] });
      queryClient.invalidateQueries({ queryKey: ['chat-tab-counts'] });
    },
  });

  // Pickup from queue mutation
  const pickupMutation = useMutation({
    mutationFn: (id: string) => chatApi.pickupFromQueue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversation'] });
      queryClient.invalidateQueries({ queryKey: ['chat-tab-counts'] });
      setActiveTab('staff'); // Switch to staff tab after pickup
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => 
      chatApi.replyToConversation(id, message),
    onSuccess: () => {
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-conversation'] });
    },
  });

  // Close mutation
  const closeMutation = useMutation({
    mutationFn: ({ id, resolutionType }: { id: string; resolutionType: 'resolved' | 'closed' }) => 
      chatApi.closeConversation(id, resolutionType),
    onSuccess: () => {
      setSelectedConversation(null);
      setShowCloseModal(false);
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-tab-counts'] });
    },
  });

  const conversations: ChatConversation[] = conversationsData?.conversations || [];
  const messages: ChatMessage[] = conversationData?.messages || [];
  const currentConversation = conversationData?.conversation;

  const handleSendReply = () => {
    if (!selectedConversation || !replyMessage.trim()) return;
    replyMutation.mutate({ id: selectedConversation, message: replyMessage.trim() });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
  };

  const getQueueWaitTime = (queueEnteredAt?: string) => {
    if (!queueEnteredAt) return null;
    const entered = new Date(queueEnteredAt);
    const now = new Date();
    const diffMs = now.getTime() - entered.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min';
    return `${diffMins} mins`;
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'urgent':
      case 'critical':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{priority}</span>;
      case 'high':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">high</span>;
      default:
        return null;
    }
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case 'angry':
        return <span className="text-xs">😡</span>;
      case 'negative':
        return <span className="text-xs">😟</span>;
      case 'positive':
        return <span className="text-xs">😊</span>;
      default:
        return null;
    }
  };

  const getResolutionBadge = (resolutionType?: string) => {
    switch (resolutionType) {
      case 'ai_resolved':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> AI Resolved</span>;
      case 'staff_resolved':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Staff Resolved</span>;
      case 'inactive_closed':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><XCircle className="w-3 h-3" /> Inactive</span>;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversation List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Header with Tabs */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Live Chats
          </h2>
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSelectedConversation(null);
                }}
                className={`flex-1 flex flex-col items-center px-2 py-2 text-xs rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={tab.description}
              >
                {tab.icon}
                <span className="mt-1">{tab.label}</span>
                {tabCounts && tabCounts[tab.key] > 0 && (
                  <span className={`mt-0.5 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {tabCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="text-gray-300 mb-2">
                {activeTab === 'ai' && <Bot className="w-8 h-8 mx-auto" />}
                {activeTab === 'staff' && <Users className="w-8 h-8 mx-auto" />}
                {activeTab === 'queued' && <Inbox className="w-8 h-8 mx-auto" />}
                {activeTab === 'closed' && <Archive className="w-8 h-8 mx-auto" />}
              </div>
              No {tabs.find(t => t.key === activeTab)?.label.toLowerCase()} chats
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conv.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{conv.customer_name}</p>
                      <p className="text-xs text-gray-500">{conv.customer_email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTime(conv.last_message_at)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600 truncate">
                  {conv.last_message || 'No messages yet'}
                </p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {/* Priority & Sentiment */}
                  {getPriorityBadge(conv.priority)}
                  {getSentimentBadge(conv.sentiment)}
                  
                  {/* Tab-specific badges */}
                  {activeTab === 'ai' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Handling
                    </span>
                  )}
                  {activeTab === 'staff' && conv.assigned_staff_first_name && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      👤 {conv.assigned_staff_first_name}
                    </span>
                  )}
                  {activeTab === 'queued' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getQueueWaitTime(conv.queue_entered_at) || 'Waiting'}
                    </span>
                  )}
                  {activeTab === 'closed' && getResolutionBadge(conv.resolution_type)}
                  
                  <span className="text-xs text-gray-400">
                    {conv.message_count} msgs
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Select a conversation to view</p>
            </div>
          </div>
        ) : loadingConversation ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Loading conversation...
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentConversation?.customer_name}</p>
                  <p className="text-sm text-gray-500">{currentConversation?.customer_email}</p>
                </div>
                {getPriorityBadge(currentConversation?.priority)}
                {getSentimentBadge(currentConversation?.sentiment)}
              </div>
              <div className="flex items-center gap-2">
                {/* Queued tab - Pickup button */}
                {activeTab === 'queued' && (
                  <button
                    onClick={() => pickupMutation.mutate(selectedConversation)}
                    disabled={pickupMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    Pick Up
                  </button>
                )}
                
                {/* AI tab - Takeover button */}
                {activeTab === 'ai' && currentConversation?.assigned_to === 'ai-agent-001' && (
                  <button
                    onClick={() => takeoverMutation.mutate(selectedConversation)}
                    disabled={takeoverMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    Take Over
                  </button>
                )}
                
                {/* Close button (for AI and Staff tabs) */}
                {(activeTab === 'ai' || activeTab === 'staff') && currentConversation?.status !== 'closed' && (
                  <button
                    onClick={() => setShowCloseModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                    Close Chat
                  </button>
                )}
              </div>
            </div>

            {/* Messages - Threaded style like email */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse">
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isCustomer = msg.sender_type === 'customer';
                  const isSystem = msg.sender_type === 'system';
                  const isAI = msg.sender_type === 'ai';
                  
                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center">
                        <span className="inline-block px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={msg.id} className={`p-4 rounded-lg ${
                      isCustomer ? 'bg-gray-100' : isAI ? 'bg-purple-50' : 'bg-blue-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isCustomer ? 'bg-gray-300' : isAI ? 'bg-purple-200' : 'bg-blue-200'
                        }`}>
                          {isCustomer ? (
                            <User className="w-3 h-3 text-gray-600" />
                          ) : isAI ? (
                            <Sparkles className="w-3 h-3 text-purple-600" />
                          ) : (
                            <User className="w-3 h-3 text-blue-600" />
                          )}
                        </div>
                        <span className="font-medium text-sm text-gray-900">
                          {msg.sender_name || (isCustomer ? 'Customer' : isAI ? 'McCarthy AI' : 'Staff')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(msg.created_at)} {formatTime(msg.created_at)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap ml-8">
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reply Input - Only for staff tab or after takeover */}
            {(activeTab === 'staff' || (activeTab === 'ai' && currentConversation?.assigned_to !== 'ai-agent-001')) && 
             currentConversation?.status !== 'closed' && (
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder="Type your reply..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={2}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim() || replyMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Close Chat Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Close Chat</h3>
            <p className="text-sm text-gray-600 mb-4">How would you like to close this chat?</p>
            
            <div className="space-y-3">
              <button
                onClick={() => closeMutation.mutate({ 
                  id: selectedConversation!, 
                  resolutionType: 'resolved' 
                })}
                disabled={closeMutation.isPending}
                className="w-full flex items-center gap-3 p-3 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors"
              >
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Mark as Resolved</p>
                  <p className="text-xs text-gray-500">Customer's issue was solved</p>
                </div>
              </button>
              
              <button
                onClick={() => closeMutation.mutate({ 
                  id: selectedConversation!, 
                  resolutionType: 'closed' 
                })}
                disabled={closeMutation.isPending}
                className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Close as Inactive</p>
                  <p className="text-xs text-gray-500">Customer stopped responding</p>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setShowCloseModal(false)}
              className="w-full mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
