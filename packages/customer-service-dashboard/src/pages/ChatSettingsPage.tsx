import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../lib/api';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface BusinessHour {
  day_of_week: number;
  day_name: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
}

interface ChatSettings {
  is_enabled: boolean;
  primary_color: string;
  secondary_color: string;
  button_text: string;
  welcome_message: string;
  offline_message: string;
  timezone: string;
  show_business_hours: boolean;
  require_email_when_offline: boolean;
}

export default function ChatSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'widget' | 'hours'>('widget');
  
  // Widget settings state
  const [settings, setSettings] = useState<ChatSettings>({
    is_enabled: true,
    primary_color: '#1e40af',
    secondary_color: '#ffffff',
    button_text: 'Chat with us',
    welcome_message: 'Hi! How can we help you today?',
    offline_message: 'Our team is currently offline. Please leave a message.',
    timezone: 'Australia/Sydney',
    show_business_hours: true,
    require_email_when_offline: true
  });

  // Business hours state
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(
    DAY_NAMES.map((name, index) => ({
      day_of_week: index,
      day_name: name,
      is_open: index >= 1 && index <= 5, // Mon-Fri
      open_time: '09:00',
      close_time: '17:00'
    }))
  );

  // Fetch settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['chatSettings'],
    queryFn: () => chatApi.getSettings().then(res => res.data.settings)
  });

  // Fetch business hours
  const { data: hoursData, isLoading: hoursLoading } = useQuery({
    queryKey: ['businessHours'],
    queryFn: () => chatApi.getBusinessHours().then(res => res.data.businessHours)
  });

  // Update local state when data loads
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  useEffect(() => {
    if (hoursData) {
      setBusinessHours(hoursData);
    }
  }, [hoursData]);

  // Save settings mutation
  const saveSettings = useMutation({
    mutationFn: () => chatApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSettings'] });
      alert('Settings saved successfully!');
    },
    onError: (error: any) => {
      alert(`Failed to save settings: ${error.message}`);
    }
  });

  // Save business hours mutation
  const saveBusinessHours = useMutation({
    mutationFn: () => chatApi.updateBusinessHours(businessHours.map(h => ({
      day_of_week: h.day_of_week,
      is_open: h.is_open,
      open_time: h.is_open ? h.open_time : null,
      close_time: h.is_open ? h.close_time : null
    }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessHours'] });
      alert('Business hours saved successfully!');
    },
    onError: (error: any) => {
      alert(`Failed to save business hours: ${error.message}`);
    }
  });

  const updateHour = (dayIndex: number, field: keyof BusinessHour, value: any) => {
    setBusinessHours(prev => prev.map(h => 
      h.day_of_week === dayIndex ? { ...h, [field]: value } : h
    ));
  };

  if (settingsLoading || hoursLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chat Settings</h1>
        <p className="text-gray-600 mt-1">Configure your live chat widget and business hours</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('widget')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'widget'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Widget Settings
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hours'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Business Hours
          </button>
        </nav>
      </div>

      {/* Widget Settings Tab */}
      {activeTab === 'widget' && (
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings(s => ({ ...s, primary_color: e.target.value }))}
                    className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => setSettings(s => ({ ...s, primary_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings(s => ({ ...s, secondary_color: e.target.value }))}
                    className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings(s => ({ ...s, secondary_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings(s => ({ ...s, timezone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
                <option value="Australia/Melbourne">Australia/Melbourne</option>
                <option value="Australia/Brisbane">Australia/Brisbane</option>
                <option value="Australia/Perth">Australia/Perth</option>
                <option value="Pacific/Auckland">New Zealand (NZST/NZDT)</option>
                <option value="America/New_York">US Eastern</option>
                <option value="America/Los_Angeles">US Pacific</option>
                <option value="Europe/London">UK (GMT/BST)</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Show Business Hours</h3>
                  <p className="text-sm text-gray-500">Display your business hours in the widget</p>
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
                  <p className="text-sm text-gray-500">Require visitors to enter email when offline</p>
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

            {/* Preview */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Preview</h3>
              <div className="flex justify-end">
                <div 
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full shadow-lg cursor-pointer"
                  style={{ backgroundColor: settings.primary_color, color: settings.secondary_color }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                  <span className="font-medium">{settings.button_text}</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => saveSettings.mutate()}
                disabled={saveSettings.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saveSettings.isPending ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Hours Tab */}
      {activeTab === 'hours' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            {businessHours.map((hour) => (
              <div key={hour.day_of_week} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                <div className="w-28">
                  <span className="font-medium text-gray-900">{hour.day_name}</span>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hour.is_open}
                    onChange={(e) => updateHour(hour.day_of_week, 'is_open', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Open</span>
                </label>

                {hour.is_open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={hour.open_time || '09:00'}
                      onChange={(e) => updateHour(hour.day_of_week, 'open_time', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={hour.close_time || '17:00'}
                      onChange={(e) => updateHour(hour.day_of_week, 'close_time', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Closed</span>
                )}
              </div>
            ))}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setBusinessHours(prev => prev.map(h => ({
                  ...h,
                  is_open: h.day_of_week >= 1 && h.day_of_week <= 5,
                  open_time: '09:00',
                  close_time: '17:00'
                })))}
                className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                Set Mon-Fri 9-5
              </button>
              <button
                onClick={() => setBusinessHours(prev => prev.map(h => ({
                  ...h,
                  is_open: true,
                  open_time: '00:00',
                  close_time: '23:59'
                })))}
                className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                24/7
              </button>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => saveBusinessHours.mutate()}
                disabled={saveBusinessHours.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {saveBusinessHours.isPending ? 'Saving...' : 'Save Business Hours'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

