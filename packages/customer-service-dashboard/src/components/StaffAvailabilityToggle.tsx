import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

type AvailabilityStatus = 'online' | 'offline' | 'away';

const statusConfig = {
  online: {
    color: 'bg-green-500',
    ringColor: 'ring-green-500',
    label: 'Online',
    description: 'Available for chats'
  },
  away: {
    color: 'bg-yellow-500',
    ringColor: 'ring-yellow-500',
    label: 'Away',
    description: 'Temporarily unavailable'
  },
  offline: {
    color: 'bg-gray-400',
    ringColor: 'ring-gray-400',
    label: 'Offline',
    description: 'Not available'
  }
};

export default function StaffAvailabilityToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: staffData } = useQuery({
    queryKey: ['currentStaff'],
    queryFn: () => staffApi.me().then(res => res.data.staff),
    enabled: !!user,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const updateAvailability = useMutation({
    mutationFn: (status: AvailabilityStatus) => 
      staffApi.updateAvailability(user?.id || '', status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentStaff'] });
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
      setIsOpen(false);
    }
  });

  const currentStatus = (staffData?.availability_status as AvailabilityStatus) || 'offline';
  const config = statusConfig[currentStatus];

  return (
    <div className="relative">
      {/* Status Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full"
      >
        <div className="relative">
          <div className={`w-3 h-3 rounded-full ${config.color}`} />
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} animate-ping opacity-75`} 
               style={{ display: currentStatus === 'online' ? 'block' : 'none' }} />
        </div>
        <span className="text-sm font-medium text-gray-700">{config.label}</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Menu */}
          <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <p className="text-xs text-gray-500 px-2 py-1 font-medium">Set your status</p>
              
              {(Object.keys(statusConfig) as AvailabilityStatus[]).map((status) => {
                const statusInfo = statusConfig[status];
                const isActive = status === currentStatus;
                
                return (
                  <button
                    key={status}
                    onClick={() => updateAvailability.mutate(status)}
                    disabled={updateAvailability.isPending}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${statusInfo.color}`} />
                    <div>
                      <p className="text-sm font-medium">{statusInfo.label}</p>
                      <p className="text-xs text-gray-500">{statusInfo.description}</p>
                    </div>
                    {isActive && (
                      <svg className="w-4 h-4 ml-auto text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

