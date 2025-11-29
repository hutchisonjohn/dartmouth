import { useState } from 'react'

interface ReassignModalProps {
  isOpen: boolean
  onClose: () => void
  onReassign: (staffId: string, staffName: string) => void
  currentAssignment?: string
}

const staffMembers = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'John Hutchison', role: 'Admin' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Ted Smith', role: 'Agent' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Sam Johnson', role: 'Agent' },
]

export default function ReassignModal({ isOpen, onClose, onReassign, currentAssignment }: ReassignModalProps) {
  const [selectedStaff, setSelectedStaff] = useState<string>('')

  if (!isOpen) return null

  const handleReassign = () => {
    if (!selectedStaff) return
    const staff = staffMembers.find(s => s.id === selectedStaff)
    if (staff) {
      onReassign(staff.id, staff.name)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reassign Ticket</h3>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">
            {currentAssignment 
              ? `Currently assigned to: ${currentAssignment}` 
              : 'This ticket is currently unassigned'}
          </p>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign to:
          </label>

          <div className="space-y-2">
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
                  name="staff"
                  value={staff.id}
                  checked={selectedStaff === staff.id}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                  <p className="text-xs text-gray-500">{staff.role}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReassign}
            disabled={!selectedStaff}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reassign Ticket
          </button>
        </div>
      </div>
    </div>
  )
}

