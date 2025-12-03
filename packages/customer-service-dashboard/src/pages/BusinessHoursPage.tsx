import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../lib/api';

// Display order: Monday first, Sunday last
const DAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface BusinessHour {
  day_of_week: number;
  day_name: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
}

export default function BusinessHoursPage() {
  const queryClient = useQueryClient();
  
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(
    DAY_NAMES.map((name, index) => ({
      day_of_week: index,
      day_name: name,
      is_open: index >= 1 && index <= 5,
      open_time: '09:00',
      close_time: '17:00'
    }))
  );

  const [timezone, setTimezone] = useState('Australia/Sydney');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch business hours
  const { data: hoursData, isLoading } = useQuery({
    queryKey: ['businessHours'],
    queryFn: () => chatApi.getBusinessHours().then(res => res.data.businessHours)
  });

  // Fetch settings for timezone
  const { data: settingsData } = useQuery({
    queryKey: ['chatSettings'],
    queryFn: () => chatApi.getSettings().then(res => res.data.settings)
  });

  useEffect(() => {
    if (hoursData) {
      setBusinessHours(hoursData);
    }
  }, [hoursData]);

  useEffect(() => {
    if (settingsData?.timezone) {
      setTimezone(settingsData.timezone);
    }
  }, [settingsData]);

  // Save business hours mutation
  const saveBusinessHours = useMutation({
    mutationFn: async () => {
      await chatApi.updateBusinessHours(businessHours.map(h => ({
        day_of_week: h.day_of_week,
        is_open: h.is_open,
        open_time: h.is_open ? h.open_time : null,
        close_time: h.is_open ? h.close_time : null
      })));
      await chatApi.updateSettings({ timezone });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessHours'] });
      queryClient.invalidateQueries({ queryKey: ['chatSettings'] });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000); // Auto-hide after 3 seconds
    },
    onError: (error: any) => {
      setSaveStatus('error');
      setErrorMessage(error.message);
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  });

  const updateHour = (dayIndex: number, field: keyof BusinessHour, value: any) => {
    setBusinessHours(prev => prev.map(h => 
      h.day_of_week === dayIndex ? { ...h, [field]: value } : h
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Hours</h1>
        <p className="text-gray-600 mt-1">Set your operating hours for live chat availability</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Timezone */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
            <option value="Australia/Melbourne">Australia/Melbourne</option>
            <option value="Australia/Brisbane">Australia/Brisbane</option>
            <option value="Australia/Perth">Australia/Perth (AWST)</option>
            <option value="Pacific/Auckland">New Zealand (NZST/NZDT)</option>
            <option value="America/New_York">US Eastern (EST/EDT)</option>
            <option value="America/Los_Angeles">US Pacific (PST/PDT)</option>
            <option value="Europe/London">UK (GMT/BST)</option>
          </select>
        </div>

        {/* Hours Grid - Monday first, Sunday last */}
        <div className="space-y-3">
          {DAY_DISPLAY_ORDER.map((dayIndex) => {
            const hour = businessHours.find(h => h.day_of_week === dayIndex) || {
              day_of_week: dayIndex,
              day_name: DAY_NAMES[dayIndex],
              is_open: false,
              open_time: '09:00',
              close_time: '17:00'
            };
            return (
            <div key={hour.day_of_week} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="w-28">
                <span className="font-medium text-gray-900">{hour.day_name}</span>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer min-w-[80px]">
                <input
                  type="checkbox"
                  checked={hour.is_open}
                  onChange={(e) => updateHour(hour.day_of_week, 'is_open', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">{hour.is_open ? 'Open' : 'Closed'}</span>
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
                <span className="text-sm text-gray-400 italic flex-1">Closed all day</span>
              )}
            </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-6 mt-4 border-t border-gray-200">
          <button
            onClick={() => setBusinessHours(prev => prev.map(h => ({
              ...h,
              is_open: h.day_of_week >= 1 && h.day_of_week <= 5,
              open_time: '09:00',
              close_time: '17:00'
            })))}
            className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200"
          >
            Mon-Fri 9am-5pm
          </button>
          <button
            onClick={() => setBusinessHours(prev => prev.map(h => ({
              ...h,
              is_open: h.day_of_week >= 1 && h.day_of_week <= 6,
              open_time: '08:00',
              close_time: '18:00'
            })))}
            className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200"
          >
            Mon-Sat 8am-6pm
          </button>
          <button
            onClick={() => setBusinessHours(prev => prev.map(h => ({
              ...h,
              is_open: true,
              open_time: '00:00',
              close_time: '23:59'
            })))}
            className="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200"
          >
            24/7
          </button>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
          {saveStatus === 'success' && (
            <span className="text-green-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600 text-sm">{errorMessage || 'Failed to save'}</span>
          )}
          <button
            onClick={() => saveBusinessHours.mutate()}
            disabled={saveBusinessHours.isPending}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {saveBusinessHours.isPending ? 'Saving...' : 'Save Business Hours'}
          </button>
        </div>
      </div>
    </div>
  );
}

