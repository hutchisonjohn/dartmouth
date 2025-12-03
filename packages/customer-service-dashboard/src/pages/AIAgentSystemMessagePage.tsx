import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, RefreshCw, AlertCircle, CheckCircle, Sparkles, Info } from 'lucide-react';
import { systemMessageApi } from '../lib/api';

interface SystemMessageConfig {
  role: string;
  personality: string;
  responsibilities: string;
  dos: string;
  donts: string;
  tone: string;
  custom_instructions: string;
}

const defaultConfig: SystemMessageConfig = {
  role: `You are McCarthy AI, a friendly and professional customer service assistant for Amazing Transfers, an Australian company specializing in DTF (Direct to Film) and UV DTF transfers for custom printing.`,
  personality: `- Warm, helpful, and professional
- Use Australian English (colour, metre, etc.)
- Friendly but not overly casual
- Patient and understanding
- Knowledgeable about DTF printing`,
  responsibilities: `- Answer questions about products, ordering, and policies
- Help customers with order inquiries
- Provide application instructions for DTF and UV DTF transfers
- Explain shipping, returns, and refund policies
- Assist with artwork requirements and file formats
- Escalate complex issues to human staff when needed`,
  dos: `- Always be polite and respectful
- Provide accurate information from the knowledge base
- Acknowledge customer frustrations with empathy
- Offer to escalate to human staff when you can't help
- Use the customer's name when known
- Confirm understanding before providing solutions`,
  donts: `- Never make up information or guess at policies
- Don't provide specific pricing (direct to website)
- Don't promise things you can't guarantee
- Never argue with customers
- Don't share internal business information
- Don't use American spelling (use colour not color)`,
  tone: `Professional yet friendly. Think of a knowledgeable colleague who genuinely wants to help. Not robotic, but not overly casual either. Match the customer's energy level.`,
  custom_instructions: ``,
};

export default function AIAgentSystemMessagePage() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<SystemMessageConfig>(defaultConfig);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Fetch config
  const { data, isLoading } = useQuery({
    queryKey: ['ai-system-message'],
    queryFn: () => systemMessageApi.getConfig().then(res => res.data),
  });

  useEffect(() => {
    if (data?.config) {
      setConfig({
        role: data.config.role || defaultConfig.role,
        personality: data.config.personality || defaultConfig.personality,
        responsibilities: data.config.responsibilities || defaultConfig.responsibilities,
        dos: data.config.dos || defaultConfig.dos,
        donts: data.config.donts || defaultConfig.donts,
        tone: data.config.tone || defaultConfig.tone,
        custom_instructions: data.config.custom_instructions || '',
      });
    }
  }, [data]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: () => systemMessageApi.updateConfig(config),
    onSuccess: () => {
      setSaveStatus('success');
      queryClient.invalidateQueries({ queryKey: ['ai-system-message'] });
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: (error: any) => {
      setSaveStatus('error');
      setErrorMessage(error.response?.data?.error || error.message || 'Failed to save');
      setTimeout(() => setSaveStatus('idle'), 5000);
    },
  });

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: () => systemMessageApi.resetToDefault(),
    onSuccess: () => {
      setConfig(defaultConfig);
      queryClient.invalidateQueries({ queryKey: ['ai-system-message'] });
    },
  });

  const generatePreview = () => {
    return `# System Message for McCarthy AI

## Role
${config.role}

## Personality
${config.personality}

## Responsibilities
${config.responsibilities}

## Do's
${config.dos}

## Don'ts
${config.donts}

## Tone
${config.tone}

${config.custom_instructions ? `## Custom Instructions
${config.custom_instructions}` : ''}
`;
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
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          AI System Message
        </h1>
        <p className="text-gray-600 mt-1">
          Configure the AI Agent's personality, role, and behavior guidelines. This defines how McCarthy AI interacts with customers.
        </p>
      </div>

      {/* What is a System Message? */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          What is a System Message?
        </h3>
        <p className="text-sm text-indigo-800">
          The <strong>System Message</strong> (also called a system prompt) defines the AI's identity, personality, and behavioral guidelines. 
          It's the foundation that shapes how the AI responds to customers - its tone, what it can/can't do, and how it handles different situations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Form */}
        <div className="space-y-6">
          {/* Role */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Role Definition
              <span className="text-gray-500 font-normal ml-2">Who is the AI?</span>
            </label>
            <textarea
              value={config.role}
              onChange={(e) => setConfig({ ...config, role: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="You are McCarthy AI, a customer service assistant..."
            />
          </div>

          {/* Personality */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Personality Traits
              <span className="text-gray-500 font-normal ml-2">How should the AI behave?</span>
            </label>
            <textarea
              value={config.personality}
              onChange={(e) => setConfig({ ...config, personality: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="- Friendly and professional&#10;- Patient and understanding..."
            />
          </div>

          {/* Responsibilities */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Responsibilities
              <span className="text-gray-500 font-normal ml-2">What should the AI do?</span>
            </label>
            <textarea
              value={config.responsibilities}
              onChange={(e) => setConfig({ ...config, responsibilities: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="- Answer product questions&#10;- Help with orders..."
            />
          </div>

          {/* Do's */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Do's ✅
              <span className="text-gray-500 font-normal ml-2">Best practices to follow</span>
            </label>
            <textarea
              value={config.dos}
              onChange={(e) => setConfig({ ...config, dos: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="- Always be polite&#10;- Provide accurate information..."
            />
          </div>

          {/* Don'ts */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Don'ts ❌
              <span className="text-gray-500 font-normal ml-2">Things to avoid</span>
            </label>
            <textarea
              value={config.donts}
              onChange={(e) => setConfig({ ...config, donts: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="- Never make up information&#10;- Don't promise things..."
            />
          </div>

          {/* Tone */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tone of Voice
              <span className="text-gray-500 font-normal ml-2">How should responses sound?</span>
            </label>
            <textarea
              value={config.tone}
              onChange={(e) => setConfig({ ...config, tone: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Professional yet friendly..."
            />
          </div>

          {/* Custom Instructions */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Custom Instructions
              <span className="text-gray-500 font-normal ml-2">Any additional guidelines</span>
            </label>
            <textarea
              value={config.custom_instructions}
              onChange={(e) => setConfig({ ...config, custom_instructions: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add any specific instructions, business rules, or special handling..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Use this for business-specific rules, special promotions, or temporary instructions.
            </p>
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              {saveStatus === 'success' && (
                <span className="text-green-600 flex items-center gap-1 text-sm">
                  <CheckCircle className="w-4 h-4" /> Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-red-600 flex items-center gap-1 text-sm">
                  <AlertCircle className="w-4 h-4" /> {errorMessage}
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </button>
              
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                {showPreview ? 'Hide Preview' : 'Show Full Preview'}
              </button>
              
              <button
                onClick={() => {
                  if (confirm('Reset to default configuration? This will overwrite your current settings.')) {
                    resetMutation.mutate();
                  }
                }}
                disabled={resetMutation.isPending}
                className="w-full px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${resetMutation.isPending ? 'animate-spin' : ''}`} />
                Reset to Default
              </button>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Full System Message Preview</h3>
              <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-green-400 overflow-auto max-h-96">
                <pre className="whitespace-pre-wrap">{generatePreview()}</pre>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">💡 Tips for Better AI Responses</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Be specific about what the AI should and shouldn't do</li>
              <li>• Include examples of ideal responses in custom instructions</li>
              <li>• Update regularly based on common customer issues</li>
              <li>• Use bullet points for clarity</li>
              <li>• Test changes with sample conversations</li>
            </ul>
          </div>

          {/* Character Count */}
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration Size</h4>
            <div className="text-2xl font-bold text-indigo-600">
              {generatePreview().length.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 ml-2">characters</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: Keep under 4,000 characters for optimal performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

