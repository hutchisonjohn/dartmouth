/**
 * Dartmouth OS Settings Page
 * 
 * Configure tenant-level settings including:
 * - Business information
 * - Regional settings (timezone, language, measurement, currency)
 * - Date/time formats
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface TenantSettings {
  tenant_id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  business_website: string;
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

export default function DartmouthOSSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TenantSettings>({
    tenant_id: '',
    business_name: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    business_website: '',
    timezone: 'Australia/Brisbane',
    language: 'en-AU',
    measurement_system: 'metric',
    currency: 'AUD',
    currency_symbol: '$',
    date_format: 'DD/MM/YYYY',
    time_format: '12h'
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: async () => {
      const response = await api.get('/api/tenant/settings');
      return response.data as TenantSettings;
    }
  });

  // Fetch available options
  const { data: options, isLoading: optionsLoading } = useQuery({
    queryKey: ['tenant-settings-options'],
    queryFn: async () => {
      const response = await api.get('/api/tenant/settings/options');
      return response.data as SettingsOptions;
    }
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: TenantSettings) => {
      const response = await api.put('/api/tenant/settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleChange = (field: keyof TenantSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-update currency symbol when currency changes
    if (field === 'currency' && options) {
      const currency = options.currencies.find(c => c.code === value);
      if (currency) {
        setFormData(prev => ({ ...prev, currency_symbol: currency.symbol }));
      }
    }
  };

  if (settingsLoading || optionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dartmouth OS Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your tenant-level settings. These settings are inherited by all AI agents unless overridden.
        </p>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-800 font-medium">Settings saved successfully!</span>
        </div>
      )}

      {saveMutation.isError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-red-800 font-medium">Failed to save settings. Please try again.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Business Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your Business Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Email
              </label>
              <input
                type="email"
                value={formData.business_email || ''}
                onChange={(e) => handleChange('business_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="support@yourbusiness.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Phone
              </label>
              <input
                type="tel"
                value={formData.business_phone || ''}
                onChange={(e) => handleChange('business_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+61 7 1234 5678"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Website
              </label>
              <input
                type="url"
                value={formData.business_website || ''}
                onChange={(e) => handleChange('business_website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://yourbusiness.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <textarea
                value={formData.business_address || ''}
                onChange={(e) => handleChange('business_address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="123 Business St, Brisbane QLD 4000, Australia"
              />
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Regional Settings
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            These settings affect how the AI communicates with customers - spelling, terminology, date/time formats, and currency.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {options?.timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {options?.languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Affects spelling (colour vs color), terminology, and greetings
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Measurement System
              </label>
              <select
                value={formData.measurement_system}
                onChange={(e) => handleChange('measurement_system', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {options?.measurementSystems.map(ms => (
                  <option key={ms.value} value={ms.value}>{ms.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {options?.currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol}) - {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Date & Time Formats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Date & Time Formats
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                value={formData.date_format}
                onChange={(e) => handleChange('date_format', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {options?.dateFormats.map(df => (
                  <option key={df.value} value={df.value}>{df.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Format
              </label>
              <select
                value={formData.time_format}
                onChange={(e) => handleChange('time_format', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {options?.timeFormats.map(tf => (
                  <option key={tf.value} value={tf.value}>{tf.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            This is how the AI will format responses based on your settings:
          </p>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2 text-sm">
            <p>
              <span className="font-medium text-gray-700">Language:</span>{' '}
              <span className="text-gray-600">
                {formData.language === 'en-AU' && "G'day! How can I help you today, mate?"}
                {formData.language === 'en-GB' && "Hello! How may I assist you today?"}
                {formData.language === 'en-US' && "Hi there! How can I help you today?"}
                {formData.language === 'en-CA' && "Hello! How can I help you today?"}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Spelling:</span>{' '}
              <span className="text-gray-600">
                {formData.language === 'en-AU' || formData.language === 'en-GB' ? 'colour, centre, organisation' : 'color, center, organization'}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Date:</span>{' '}
              <span className="text-gray-600">
                {formData.date_format === 'DD/MM/YYYY' && '04/12/2025'}
                {formData.date_format === 'MM/DD/YYYY' && '12/04/2025'}
                {formData.date_format === 'YYYY-MM-DD' && '2025-12-04'}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Time:</span>{' '}
              <span className="text-gray-600">
                {formData.time_format === '12h' ? '2:30 PM' : '14:30'}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Currency:</span>{' '}
              <span className="text-gray-600">{formData.currency_symbol}149.99 {formData.currency}</span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Measurements:</span>{' '}
              <span className="text-gray-600">
                {formData.measurement_system === 'metric' ? '30 cm, 2.5 kg, 25°C' : '12 in, 5.5 lb, 77°F'}
              </span>
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => settings && setFormData(settings)}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saveMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

