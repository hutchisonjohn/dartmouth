/**
 * Agent Regional Overrides Page
 * 
 * Allows individual AI agents to override tenant-level regional settings.
 * NULL = inherit from tenant, SET = use agent-specific value
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Save, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { api } from '../lib/api';

interface AgentOverrides {
  agent_id: string;
  timezone: string | null;
  language: string | null;
  measurement_system: string | null;
  currency: string | null;
  currency_symbol: string | null;
  date_format: string | null;
  time_format: string | null;
}

interface TenantSettings {
  timezone: string;
  language: string;
  measurement_system: string;
  currency: string;
  currency_symbol: string;
  date_format: string;
  time_format: string;
}

interface SettingsOptions {
  languages: { code: string; name: string }[];
  currencies: { code: string; symbol: string; name: string }[];
  timezones: string[];
  measurementSystems: { value: string; label: string }[];
  dateFormats: { value: string; label: string }[];
  timeFormats: { value: string; label: string }[];
}

export default function AgentRegionalOverridesPage() {
  const queryClient = useQueryClient();
  const [overrides, setOverrides] = useState<AgentOverrides>({
    agent_id: 'ai-agent-001',
    timezone: null,
    language: null,
    measurement_system: null,
    currency: null,
    currency_symbol: null,
    date_format: null,
    time_format: null
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Fetch tenant settings (defaults)
  const { data: tenantSettings } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: async () => {
      const response = await api.get('/api/tenant/settings');
      return response.data as TenantSettings;
    }
  });

  // Fetch available options
  const { data: options } = useQuery({
    queryKey: ['tenant-settings-options'],
    queryFn: async () => {
      const response = await api.get('/api/tenant/settings/options');
      return response.data as SettingsOptions;
    }
  });

  // Fetch current agent overrides
  const { data: agentData, isLoading } = useQuery({
    queryKey: ['agent-overrides', 'ai-agent-001'],
    queryFn: async () => {
      const response = await api.get('/api/ai-agent/regional-overrides');
      return response.data as AgentOverrides;
    }
  });

  useEffect(() => {
    if (agentData) {
      setOverrides(agentData);
    }
  }, [agentData]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: AgentOverrides) => {
      const response = await api.put('/api/ai-agent/regional-overrides', data);
      return response.data;
    },
    onSuccess: () => {
      setSaveStatus('success');
      queryClient.invalidateQueries({ queryKey: ['agent-overrides'] });
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: () => {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(overrides);
  };

  const handleReset = () => {
    setOverrides({
      agent_id: 'ai-agent-001',
      timezone: null,
      language: null,
      measurement_system: null,
      currency: null,
      currency_symbol: null,
      date_format: null,
      time_format: null
    });
  };

  const getEffectiveValue = (field: keyof AgentOverrides, tenantValue: string | undefined) => {
    const overrideValue = overrides[field];
    if (overrideValue !== null && overrideValue !== undefined) {
      return overrideValue;
    }
    return tenantValue || 'Not set';
  };

  // Override select component
  const OverrideSelect = ({ 
    label, 
    field, 
    options: selectOptions, 
    tenantValue,
    description
  }: { 
    label: string; 
    field: keyof AgentOverrides; 
    options: { value: string; label: string }[];
    tenantValue?: string;
    description?: string;
  }) => {
    const isOverridden = overrides[field] !== null;
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-900">{label}</label>
          {isOverridden && (
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
              Overridden
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-gray-500 mb-2">{description}</p>
        )}
        
        <select
          value={overrides[field] || ''}
          onChange={(e) => {
            const value = e.target.value === '' ? null : e.target.value;
            setOverrides(prev => ({ ...prev, [field]: value }));
            
            // Auto-update currency symbol when currency changes
            if (field === 'currency' && value && options) {
              const currency = options.currencies.find(c => c.code === value);
              if (currency) {
                setOverrides(prev => ({ ...prev, currency_symbol: currency.symbol }));
              }
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            isOverridden ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300'
          }`}
        >
          <option value="">Inherit from tenant ({tenantValue || 'default'})</option>
          {selectOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        <div className="mt-2 text-xs text-gray-500">
          Effective value: <span className="font-medium text-gray-700">{getEffectiveValue(field, tenantValue)}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-indigo-600" />
          Agent Regional Overrides
        </h1>
        <p className="text-gray-600 mt-1">
          Override tenant-level regional settings for this specific AI agent. Leave empty to inherit from tenant defaults.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          How Overrides Work
        </h3>
        <p className="text-sm text-blue-800">
          By default, this agent uses the settings from <strong>Settings → Dartmouth OS</strong> (tenant-level). 
          If you need this agent to behave differently (e.g., serve a different region), you can override specific settings here.
          Set a value to override, or leave empty to inherit from tenant.
        </p>
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Overrides saved successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-medium">Failed to save overrides. Please try again.</span>
        </div>
      )}

      {/* Override Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <OverrideSelect
          label="Timezone"
          field="timezone"
          options={options?.timezones.map(tz => ({ value: tz, label: tz })) || []}
          tenantValue={tenantSettings?.timezone}
          description="Override the timezone for this agent's date/time formatting"
        />

        <OverrideSelect
          label="Language"
          field="language"
          options={options?.languages.map(l => ({ value: l.code, label: l.name })) || []}
          tenantValue={tenantSettings?.language}
          description="Override spelling, terminology, and greetings"
        />

        <OverrideSelect
          label="Measurement System"
          field="measurement_system"
          options={options?.measurementSystems || []}
          tenantValue={tenantSettings?.measurement_system}
          description="Override metric/imperial units"
        />

        <OverrideSelect
          label="Currency"
          field="currency"
          options={options?.currencies.map(c => ({ value: c.code, label: `${c.code} (${c.symbol}) - ${c.name}` })) || []}
          tenantValue={tenantSettings?.currency}
          description="Override currency code and symbol"
        />

        <OverrideSelect
          label="Date Format"
          field="date_format"
          options={options?.dateFormats || []}
          tenantValue={tenantSettings?.date_format}
          description="Override how dates are displayed"
        />

        <OverrideSelect
          label="Time Format"
          field="time_format"
          options={options?.timeFormats || []}
          tenantValue={tenantSettings?.time_format}
          description="Override 12h/24h time format"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Clear All Overrides
        </button>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saveMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Overrides
            </>
          )}
        </button>
      </div>

      {/* Effective Settings Summary */}
      {tenantSettings && (
        <div className="mt-8 bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Effective Settings for This Agent</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Timezone:</span>
              <p className="font-medium">{getEffectiveValue('timezone', tenantSettings.timezone)}</p>
            </div>
            <div>
              <span className="text-gray-500">Language:</span>
              <p className="font-medium">{getEffectiveValue('language', tenantSettings.language)}</p>
            </div>
            <div>
              <span className="text-gray-500">Measurement:</span>
              <p className="font-medium">{getEffectiveValue('measurement_system', tenantSettings.measurement_system)}</p>
            </div>
            <div>
              <span className="text-gray-500">Currency:</span>
              <p className="font-medium">{getEffectiveValue('currency', tenantSettings.currency)} ({getEffectiveValue('currency_symbol', tenantSettings.currency_symbol)})</p>
            </div>
            <div>
              <span className="text-gray-500">Date Format:</span>
              <p className="font-medium">{getEffectiveValue('date_format', tenantSettings.date_format)}</p>
            </div>
            <div>
              <span className="text-gray-500">Time Format:</span>
              <p className="font-medium">{getEffectiveValue('time_format', tenantSettings.time_format)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

