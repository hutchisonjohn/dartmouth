import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi, ticketsApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Mail, Phone, Building2, Users, Plus, Pencil, X } from 'lucide-react';

interface StaffMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  job_title?: string;
  phone?: string;
  department?: string;
  is_active: boolean;
  availability_status: 'online' | 'offline' | 'away';
  avatar_url?: string;
  created_at: string;
}

interface StaffFormData {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  job_title: string;
  phone: string;
  department: string;
  password?: string;
}

const emptyFormData: StaffFormData = {
  email: '',
  first_name: '',
  last_name: '',
  role: 'agent',
  job_title: '',
  phone: '',
  department: 'Customer Service',
  password: ''
};

export default function StaffPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(emptyFormData);
  const [formError, setFormError] = useState('');

  // Fetch all staff members - admin sees all, regular staff sees only themselves
  const { data: staffList, isLoading } = useQuery({
    queryKey: ['staffUsers'],
    queryFn: () => staffApi.list().then(res => {
      const allStaff = res.data.staff as StaffMember[];
      // Non-admin users only see their own profile
      if (!isAdmin && user?.id) {
        return allStaff.filter(s => s.id === user.id);
      }
      return allStaff;
    })
  });

  // Fetch ticket counts per staff
  const { data: ticketsData } = useQuery({
    queryKey: ['tickets', 'all'],
    queryFn: () => ticketsApi.list({ limit: 1000 }).then(res => res.data.tickets)
  });

  // Calculate active tickets per staff member
  const getActiveTicketCount = (staffId: string) => {
    if (!ticketsData) return 0;
    return ticketsData.filter((t: any) => 
      t.assigned_to === staffId && 
      t.status !== 'resolved' && 
      t.status !== 'closed'
    ).length;
  };

  // Update availability mutation
  const updateAvailability = useMutation({
    mutationFn: ({ staffId, status }: { staffId: string; status: 'online' | 'offline' | 'away' }) =>
      staffApi.updateAvailability(staffId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
    }
  });

  // Create staff mutation
  const createStaff = useMutation({
    mutationFn: (data: StaffFormData) => staffApi.create({
      ...data,
      password: data.password || ''
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
      closeModal();
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.error || 'Failed to create staff member');
    }
  });

  // Update staff mutation
  const updateStaff = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffFormData> }) => 
      staffApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffUsers'] });
      closeModal();
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.error || 'Failed to update staff member');
    }
  });

  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Available', badgeClass: 'bg-green-100 text-green-700 border-green-200' },
    offline: { color: 'bg-gray-400', label: 'Offline', badgeClass: 'bg-gray-100 text-gray-600 border-gray-200' },
    away: { color: 'bg-amber-500', label: 'Away', badgeClass: 'bg-amber-100 text-amber-700 border-amber-200' }
  };

  const getRoleTitle = (staff: StaffMember) => {
    if (staff.job_title) return staff.job_title;
    switch (staff.role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Customer Service Manager';
      default: return 'Support Agent';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData(emptyFormData);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (staff: StaffMember) => {
    // Non-admin can only edit themselves
    if (!isAdmin && staff.id !== user?.id) return;
    
    setEditingStaff(staff);
    setFormData({
      email: staff.email,
      first_name: staff.first_name,
      last_name: staff.last_name,
      role: staff.role,
      job_title: staff.job_title || '',
      phone: staff.phone || '',
      department: staff.department || 'Customer Service',
      password: ''
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setFormData(emptyFormData);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email || !formData.first_name) {
      setFormError('Email and First Name are required');
      return;
    }

    if (editingStaff) {
      // Update existing staff
      const updateData: Partial<StaffFormData> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        job_title: formData.job_title,
        phone: formData.phone,
        department: formData.department,
      };
      // Only admin can change role and email
      if (isAdmin) {
        updateData.role = formData.role;
        updateData.email = formData.email;
      }
      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }
      updateStaff.mutate({ id: editingStaff.id, data: updateData });
    } else {
      // Create new staff
      if (!formData.password) {
        setFormError('Password is required for new staff members');
        return;
      }
      createStaff.mutate(formData);
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Manage your support team and their availability' : 'View and edit your profile'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList?.map((staff) => {
          const status = staff.availability_status || 'offline';
          const config = statusConfig[status];
          const activeTickets = getActiveTicketCount(staff.id);
          const isYou = staff.id === user?.id;
          const canEdit = isAdmin || isYou;

          return (
            <div 
              key={staff.id} 
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <Users className="w-6 h-6" />
                      </div>
                      {/* Status dot */}
                      <span 
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${config.color}`}
                      />
                    </div>
                    {/* Name & Role */}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {isYou ? 'You' : `${staff.first_name}`}
                        {staff.last_name && !isYou && ` ${staff.last_name}`}
                      </h3>
                      <p className="text-sm text-gray-500">{getRoleTitle(staff)}</p>
                    </div>
                  </div>
                  {/* Status Badge */}
                  {isAdmin || isYou ? (
                    <select
                      value={status}
                      onChange={(e) => updateAvailability.mutate({ 
                        staffId: staff.id, 
                        status: e.target.value as 'online' | 'offline' | 'away' 
                      })}
                      className={`text-xs font-medium px-3 py-1 rounded-full border cursor-pointer ${config.badgeClass}`}
                    >
                      <option value="online">Available</option>
                      <option value="away">Away</option>
                      <option value="offline">Offline</option>
                    </select>
                  ) : (
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${config.badgeClass}`}>
                      {config.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Details */}
              <div className="px-5 pb-4 space-y-2">
                {/* Email */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{staff.email}</span>
                </div>
                {/* Phone */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{staff.phone || 'Not set'}</span>
                </div>
                {/* Department */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{staff.department || 'Customer Service'}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-500">Active Tickets: </span>
                  <span className={`font-medium ${activeTickets > 0 ? 'text-indigo-600' : 'text-gray-900'}`}>
                    {activeTickets}
                  </span>
                </div>
                {canEdit ? (
                  <button
                    onClick={() => openEditModal(staff)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="text-gray-500">
                    Joined: <span className="font-medium text-gray-700">{formatDate(staff.created_at)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(!staffList || staffList.length === 0) && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
          No team members found
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {formError}
                </div>
              )}

              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(f => ({ ...f, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                  disabled={!!editingStaff && !isAdmin}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                  required
                />
                {editingStaff && !isAdmin && (
                  <p className="text-xs text-gray-500 mt-1">Contact an admin to change your email</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Job Title & Department Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData(f => ({ ...f, job_title: e.target.value }))}
                    placeholder="e.g., Senior Support Agent"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(f => ({ ...f, department: e.target.value }))}
                    placeholder="e.g., Customer Service"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Role (Admin only) */}
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="agent">Support Agent</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingStaff ? 'New Password' : 'Password'} 
                  {!editingStaff && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))}
                  placeholder={editingStaff ? 'Leave blank to keep current password' : 'Enter password'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required={!editingStaff}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createStaff.isPending || updateStaff.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createStaff.isPending || updateStaff.isPending 
                    ? 'Saving...' 
                    : editingStaff ? 'Save Changes' : 'Add Staff Member'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
