import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '../lib/api'

interface ReassignModalProps {
  isOpen: boolean
  onClose: () => void
  onReassign: (staffId: string | null, staffName: string) => void
  currentAssignment?: string
  // For bulk mode
  bulkMode?: boolean
  selectedTickets?: Array<{ ticket_id: string; ticket_number: string; subject: string }>
}

const staffMembersBase = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'John Hutchison', role: 'Admin', online: true },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Ted Smith', role: 'Agent', online: false },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Sam Johnson', role: 'Agent', online: false },
]

export default function ReassignModal({ isOpen, onClose, onReassign, currentAssignment, bulkMode, selectedTickets }: ReassignModalProps) {
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [staffMembers, setStaffMembers] = useState(staffMembersBase.map(s => ({ ...s, openTickets: 0 })))

  // Fetch all tickets to calculate open counts
  const { data: tickets } = useQuery({
    queryKey: ['tickets-for-reassign'],
    queryFn: async () => {
      const response = await ticketsApi.list({ limit: 1000 })
      return response.data?.tickets || []
    },
    enabled: isOpen
  })

  useEffect(() => {
    if (tickets) {
      // Calculate open ticket counts for each staff member
      const staffWithCounts = staffMembersBase.map(staff => {
        const openCount = tickets.filter((t: any) => 
          t.assigned_to === staff.id && 
          (t.status === 'open' || t.status === 'in-progress')
        ).length
        return { ...staff, openTickets: openCount }
      })
      setStaffMembers(staffWithCounts)
    }
  }, [tickets])

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStaff('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const onlineStaff = staffMembers.filter(s => s.online)
  const isOnlyStaffOnline = onlineStaff.length === 1

  const handleReassign = () => {
    if (!selectedStaff) return
    
    if (selectedStaff === 'unassigned') {
      onReassign(null, 'Unassigned')
    } else {
      const staff = staffMembers.find(s => s.id === selectedStaff)
      if (staff) {
        onReassign(staff.id, staff.name)
      }
    }
    onClose()
  }

  const ticketCount = bulkMode && selectedTickets ? selectedTickets.length : 1

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {bulkMode ? `Reassign ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}` : 'Reassign Ticket'}
          </h3>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {bulkMode && selectedTickets && selectedTickets.length > 0 ? (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Reassign the following ticket{ticketCount > 1 ? 's' : ''} to another staff member:
              </p>
              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                <ul className="space-y-1">
                  {selectedTickets.map((ticket) => (
                    <li key={ticket.ticket_id} className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900">{ticket.ticket_number}</span>
                      <span className="text-gray-500 truncate">- {ticket.subject}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mb-4">
              Reassign ticket #{currentAssignment || 'Unassigned'} to another staff member:
            </p>
          )}

          {isOnlyStaffOnline && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ℹ️ You're the only staff member online
              </p>
            </div>
          )}

          <div className="space-y-2">
            {staffMembers.map((staff) => (
              <label
                key={staff.id}
                className={`flex items-center p-3 border rounded-lg transition-colors cursor-pointer hover:bg-gray-50 ${
                  selectedStaff === staff.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="staff"
                  value={staff.id}
                  checked={selectedStaff === staff.id}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 flex-shrink-0 mr-3"
                />
                <div className={`w-2 h-2 rounded-full mr-3 ${staff.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{staff.name}</p>
                  <p className="text-xs text-gray-500">{staff.online ? 'Online' : 'Offline'}</p>
                </div>
                <div className="text-right min-w-[60px]">
                  <p className="text-xs text-gray-500">{staff.openTickets} open</p>
                </div>
              </label>
            ))}

            {/* Unassigned option */}
            <label
              className={`flex items-center p-3 border rounded-lg transition-colors cursor-pointer hover:bg-gray-50 ${
                selectedStaff === 'unassigned'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="staff"
                value="unassigned"
                checked={selectedStaff === 'unassigned'}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 flex-shrink-0 mr-3"
              />
              <div className="w-2 h-2 rounded-full mr-3 bg-gray-300" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Unassigned</p>
                <p className="text-xs text-gray-500">Remove assignment</p>
              </div>
            </label>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3 border-t border-gray-200 flex-shrink-0">
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
            {bulkMode ? `Reassign ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}` : 'Reassign Ticket'}
          </button>
        </div>
      </div>
    </div>
  )
}
