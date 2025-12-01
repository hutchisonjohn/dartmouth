import { useState } from 'react'

interface EscalateModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (level: string, staffIds: string[], reason: string) => void
  ticketNumber: string
}

const staffMembers = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'John Hutchison', role: 'Admin', online: true },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Ted Smith', role: 'Team Lead', online: false },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Sam Johnson', role: 'Manager', online: false },
]

export default function EscalateModal({ isOpen, onClose, onConfirm, ticketNumber }: EscalateModalProps) {
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [reason, setReason] = useState<string>('')

  if (!isOpen) return null

  const handleStaffSelect = (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId)
    
    if (staff) {
      setSelectedStaff(staffId)
      const firstName = staff.name.split(' ')[0]
      // Replace any existing @mention with the new one
      setReason(prev => {
        // Remove any existing @mentions
        const withoutMentions = prev.replace(/@\w+\s*/g, '').trim()
        return withoutMentions ? `@${firstName} ${withoutMentions}` : `@${firstName} `
      })
    }
  }

  const handleConfirm = () => {
    if (!selectedStaff || !reason.trim()) return
    onConfirm('escalation', [selectedStaff], reason)
    // Reset form
    setSelectedStaff('')
    setReason('')
    onClose()
  }

  const handleCancel = () => {
    setSelectedStaff('')
    setReason('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Escalate Ticket #{ticketNumber}</h3>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 mb-4">
            Request assistance from other staff members to help resolve this ticket.
          </p>

          {/* Staff Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Notify Staff Members: <span className="text-gray-500 font-normal">(Select one or more)</span>
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {staffMembers.map((staff) => (
                <label
                  key={staff.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStaff === staff.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="escalate-staff"
                    value={staff.id}
                    checked={selectedStaff === staff.id}
                    onChange={() => handleStaffSelect(staff.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 flex-shrink-0 mr-3"
                  />
                  <div className={`w-2 h-2 rounded-full mr-3 ${staff.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                    <p className="text-xs text-gray-500">{staff.role} • {staff.online ? 'Online' : 'Offline'}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedStaff ? '1' : '0'} staff member selected
            </p>
          </div>

          {/* Message/Reason */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message: <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="@mention message asking for help or advice on this ticket..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be sent as an @mention linked to this ticket
            </p>
          </div>

          {/* Info Note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">Note:</p>
                <p className="text-xs text-blue-700 mt-1">
                  Selected staff will receive an alert notification and this will appear in their @mentions with higher priority (at the top, in a different color).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedStaff || !reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Escalation
          </button>
        </div>
      </div>
    </div>
  )
}
