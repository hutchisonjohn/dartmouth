import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../lib/api';
import { Check, Copy, Settings, Code } from 'lucide-react';

interface ChatSettings {
  is_enabled: boolean;
  primary_color: string;
  secondary_color: string;
  button_text: string;
  welcome_message: string;
  offline_message: string;
  show_business_hours: boolean;
  require_email_when_offline: boolean;
}

type TabType = 'widget' | 'embed';

export default function AIAgentWidgetPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('widget');
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [settings, setSettings] = useState<ChatSettings>({
    is_enabled: true,
    primary_color: '#4F46E5',
    secondary_color: '#FFFFFF',
    button_text: 'Chat with us',
    welcome_message: "Hi! 👋 I'm McCarthy AI. How can I help you today?",
    offline_message: "We're currently offline. Please leave a message and we'll get back to you!",
    show_business_hours: true,
    require_email_when_offline: true,
  });

  // Fetch settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['chatSettings'],
    queryFn: () => chatApi.getSettings().then(res => res.data),
  });

  // Fetch embed code
  const { data: embedData } = useQuery({
    queryKey: ['embedCode'],
    queryFn: () => chatApi.getEmbedCode().then(res => res.data),
  });

  useEffect(() => {
    if (settingsData?.settings) {
      setSettings({
        is_enabled: settingsData.settings.is_enabled ?? true,
        primary_color: settingsData.settings.primary_color || '#4F46E5',
        secondary_color: settingsData.settings.secondary_color || '#FFFFFF',
        button_text: settingsData.settings.button_text || 'Chat with us',
        welcome_message: settingsData.settings.welcome_message || "Hi! 👋 I'm McCarthy AI. How can I help you today?",
        offline_message: settingsData.settings.offline_message || "We're currently offline. Please leave a message!",
        show_business_hours: settingsData.settings.show_business_hours ?? true,
        require_email_when_offline: settingsData.settings.require_email_when_offline ?? true,
      });
    }
  }, [settingsData]);

  const saveSettings = useMutation({
    mutationFn: () => chatApi.updateSettings(settings),
    onSuccess: () => {
      setSaveStatus('success');
      queryClient.invalidateQueries({ queryKey: ['chatSettings'] });
      queryClient.invalidateQueries({ queryKey: ['embedCode'] });
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: (error: any) => {
      setSaveStatus('error');
      setErrorMessage(error.message || 'Failed to save settings');
      setTimeout(() => setSaveStatus('idle'), 5000);
    },
  });

  const handleCopy = () => {
    if (embedData?.embedCode) {
      navigator.clipboard.writeText(embedData.embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Chat Widget</h1>
        <p className="text-gray-600 mt-1">Configure and embed the McCarthy AI chat widget on your website</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('widget')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'widget'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            Widget Settings
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'embed'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Code className="w-4 h-4" />
            Embed Code
          </button>
        </nav>
      </div>

      {/* Widget Settings Tab */}
      {activeTab === 'widget' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Enable Chat Widget</h3>
                  <p className="text-sm text-gray-500">Show the chat widget on your website</p>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, is_enabled: !s.is_enabled }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.is_enabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.is_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-6">
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Color</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={settings.primary_color}
                        onChange={(e) => setSettings(s => ({ ...s, primary_color: e.target.value }))}
                        className="sr-only"
                      />
                      <div 
                        className="w-10 h-10 rounded-lg border-2 border-gray-400 shadow-sm cursor-pointer"
                        style={{ backgroundColor: settings.primary_color }}
                      />
                    </label>
                    <input
                      type="text"
                      value={settings.primary_color}
                      onChange={(e) => setSettings(s => ({ ...s, primary_color: e.target.value }))}
                      className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={settings.secondary_color}
                        onChange={(e) => setSettings(s => ({ ...s, secondary_color: e.target.value }))}
                        className="sr-only"
                      />
                      <div 
                        className="w-10 h-10 rounded-lg border-2 border-gray-400 shadow-sm cursor-pointer"
                        style={{ backgroundColor: settings.secondary_color }}
                      />
                    </label>
                    <input
                      type="text"
                      value={settings.secondary_color}
                      onChange={(e) => setSettings(s => ({ ...s, secondary_color: e.target.value }))}
                      className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={settings.button_text}
                  onChange={(e) => setSettings(s => ({ ...s, button_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Chat with us"
                />
              </div>

              {/* Welcome Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                <textarea
                  value={settings.welcome_message}
                  onChange={(e) => setSettings(s => ({ ...s, welcome_message: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Hi! How can we help you today?"
                />
                <p className="text-xs text-gray-500 mt-1">First message shown when chat opens</p>
              </div>

              {/* Offline Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offline Message</label>
                <textarea
                  value={settings.offline_message}
                  onChange={(e) => setSettings(s => ({ ...s, offline_message: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Our team is currently offline..."
                />
                <p className="text-xs text-gray-500 mt-1">Shown when no staff are online</p>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Show Business Hours</h3>
                    <p className="text-sm text-gray-500">Display hours in the widget</p>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, show_business_hours: !s.show_business_hours }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.show_business_hours ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.show_business_hours ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Require Email When Offline</h3>
                    <p className="text-sm text-gray-500">Collect email for follow-up</p>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, require_email_when_offline: !s.require_email_when_offline }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.require_email_when_offline ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.require_email_when_offline ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                {saveStatus === 'success' && (
                  <span className="text-green-600 flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4" /> Saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-red-600 text-sm">{errorMessage || 'Failed to save'}</span>
                )}
                <button
                  onClick={() => saveSettings.mutate()}
                  disabled={saveSettings.isPending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  {saveSettings.isPending ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Preview</h3>
            
            {/* Mock website background */}
            <div className="bg-white rounded-lg shadow-inner h-96 relative overflow-hidden">
              <div className="absolute inset-0 p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-24 bg-gray-100 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              
              {/* Chat Button Preview */}
              <div className="absolute bottom-4 right-4">
                <div 
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full shadow-lg cursor-pointer transform hover:scale-105 transition-transform"
                  style={{ backgroundColor: settings.primary_color, color: settings.secondary_color }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
                    <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z"/>
                  </svg>
                  <span className="font-medium">{settings.button_text}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embed Code Tab */}
      {activeTab === 'embed' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Embed Code</h3>
            <p className="text-sm text-gray-600 mb-4">
              Copy and paste this code into your website, just before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag.
            </p>
            <div className="relative bg-gray-800 rounded-lg p-4 text-sm font-mono text-green-400 overflow-x-auto">
              <pre className="whitespace-pre-wrap">{embedData?.embedCode || 'Loading...'}</pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Widget Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p><span className="font-medium">Enabled:</span> {settings.is_enabled ? 'Yes' : 'No'}</p>
                <p className="flex items-center gap-2"><span className="font-medium">Button Color:</span> <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: settings.primary_color }}></span> {settings.primary_color}</p>
                <p className="flex items-center gap-2"><span className="font-medium">Text Color:</span> <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: settings.secondary_color }}></span> {settings.secondary_color}</p>
                <p><span className="font-medium">Button Text:</span> "{settings.button_text}"</p>
              </div>
              <div>
                <p><span className="font-medium">Welcome Message:</span> "{settings.welcome_message}"</p>
                <p><span className="font-medium">Offline Message:</span> "{settings.offline_message}"</p>
                <p><span className="font-medium">Show Business Hours:</span> {settings.show_business_hours ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Testing Checklist</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Ensure the widget appears on your website</li>
              <li>Test starting a new chat when online</li>
              <li>Verify custom colors and messages are applied</li>
              <li>Check responsiveness on mobile devices</li>
              <li>Test the AI responses</li>
              <li>Test escalation to human staff</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

