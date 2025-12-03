import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../lib/api';

interface StaffMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  availability_status: 'online' | 'offline' | 'away';
}

export default function StaffPerformancePage() {
  // Fetch all staff members
  const { data: staffList, isLoading } = useQuery({
    queryKey: ['staffUsers'],
    queryFn: () => staffApi.list().then(res => res.data.staff as StaffMember[])
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Performance</h1>
        <p className="text-gray-600 mt-1">Track team productivity and response metrics</p>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Performance Analytics Coming Soon</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          We're building detailed performance metrics including response times, ticket resolution rates, 
          customer satisfaction scores, and more.
        </p>

        {/* Preview of what's coming */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-sm text-gray-500">Avg Response Time</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-sm text-gray-500">Tickets Resolved</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-sm text-gray-500">Satisfaction Score</div>
          </div>
        </div>

        {/* Staff List Preview */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Team Members ({staffList?.length || 0})</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {staffList?.map((staff) => (
              <div 
                key={staff.id}
                className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-medium">
                  {staff.first_name?.[0]}{staff.last_name?.[0]}
                </div>
                <span className="text-sm text-gray-700">{staff.first_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

