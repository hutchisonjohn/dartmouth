import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Code, Copy, Check, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';

interface EmbedCodeResponse {
  embedCode: string;
  settings: {
    primary_color?: string;
    secondary_color?: string;
    text_color?: string;
    button_text?: string;
    welcome_message?: string;
    offline_message?: string;
    is_enabled?: boolean;
  };
  instructions: string[];
}

export default function ChatEmbedCodePage() {
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat-embed-code'],
    queryFn: async () => {
      const response = await api.get('/api/chat/embed-code');
      return response.data as EmbedCodeResponse;
    }
  });

  const handleCopy = async () => {
    if (data?.embedCode) {
      await navigator.clipboard.writeText(data.embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load embed code. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Code className="w-7 h-7 text-indigo-600" />
          Chat Widget Embed Code
        </h1>
        <p className="mt-2 text-gray-600">
          Add the McCarthy AI chat widget to your website with a simple code snippet.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-indigo-900 mb-3">Installation Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-indigo-800">
          {data?.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>

      {/* Embed Code */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="font-medium text-gray-700">Embed Code</span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              copied 
                ? 'bg-green-100 text-green-700' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Code
              </>
            )}
          </button>
        </div>
        <div className="p-4 bg-gray-900 overflow-x-auto">
          <pre className="text-sm text-gray-100 whitespace-pre-wrap font-mono">
            {data?.embedCode}
          </pre>
        </div>
      </div>

      {/* Current Settings Preview */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Widget Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Primary Color</label>
            <div className="flex items-center gap-2 mt-1">
              <div 
                className="w-6 h-6 rounded border border-gray-200"
                style={{ backgroundColor: data?.settings.primary_color || '#4F46E5' }}
              />
              <span className="font-mono text-sm">{data?.settings.primary_color || '#4F46E5'}</span>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Button Text</label>
            <p className="font-medium text-gray-900 mt-1">{data?.settings.button_text || 'Chat with us'}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-500">Welcome Message</label>
            <p className="font-medium text-gray-900 mt-1">{data?.settings.welcome_message || "Hi! 👋 I'm McCarthy AI. How can I help you today?"}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-500">Offline Message</label>
            <p className="font-medium text-gray-900 mt-1">{data?.settings.offline_message || "We're currently offline. Please leave a message!"}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a 
            href="/settings/chat-widget" 
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Customize Widget Settings
          </a>
        </div>
      </div>

      {/* Test Widget */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-amber-900 mb-2">Test Your Widget</h2>
        <p className="text-amber-800 mb-4">
          After adding the embed code to your website, test the widget to ensure it's working correctly:
        </p>
        <ul className="list-disc list-inside space-y-1 text-amber-800">
          <li>Check that the chat bubble appears in the bottom-right corner</li>
          <li>Click the bubble to open the chat window</li>
          <li>Enter your name and email to start a conversation</li>
          <li>Send a test message and verify you receive an AI response</li>
          <li>Check the Chat Dashboard to see the conversation appear</li>
        </ul>
      </div>
    </div>
  );
}

