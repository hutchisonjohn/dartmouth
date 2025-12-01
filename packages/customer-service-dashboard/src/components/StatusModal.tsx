import { useState } from 'react'
import { X } from 'lucide-react'

interface StatusModalProps {
  currentStatus: string
  onClose: () => void
  onSave: (status: string) => Promise<void>
}

const statuses = ['open', 'pending', 'in-progress', 'resolved', 'closed', 'escalated']

export default function StatusModal({ currentStatus, onClose, onSave }: StatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(selectedStatus)
      onClose()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Change Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {statuses.map((status) => (
            <label key={status} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value={status}
                checked={selectedStatus === status}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-indigo-600"
              />
              <span className="capitalize">{status}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

