import { useState } from 'react'

interface SnoozeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (duration: string, customDate?: string) => void
  onRemoveSnooze?: () => void
  ticketNumber: string
  isSnoozed?: boolean
}

const snoozeOptions = [
  {
    id: '30-mins',
    title: '30 Minutes',
    description: 'Quick snooze - resume in 30 mins',
    value: '30m'
  },
  {
    id: 'later-today',
    title: 'Later Today',
    description: 'Resume in 3 hours',
    value: '3h'
  },
  {
    id: 'tomorrow',
    title: 'Tomorrow',
    description: 'Next business day at 9:00 AM',
    value: '1d'
  },
  {
    id: 'this-week',
    title: 'This Week',
    description: 'Friday at 9:00 AM',
    value: 'friday'
  },
  {
    id: 'next-week',
    title: 'Next Week',
    description: 'Following Monday at 9:00 AM',
    value: '1w'
  },
  {
    id: 'custom',
    title: 'Custom Date & Time',
    description: 'Pick specific date and time',
    value: 'custom'
  }
]

export default function SnoozeModal({ isOpen, onClose, onConfirm, onRemoveSnooze, ticketNumber, isSnoozed }: SnoozeModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [customDateTime, setCustomDateTime] = useState<string>('')

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!selectedOption) return
    
    if (selectedOption === 'custom' && !customDateTime) {
      alert('Please select a custom date and time')
      return
    }

    const option = snoozeOptions.find(opt => opt.id === selectedOption)
    if (option) {
      onConfirm(option.value, selectedOption === 'custom' ? customDateTime : undefined)
    }
    
    // Reset form
    setSelectedOption('')
    setCustomDateTime('')
    onClose()
  }

  const handleCancel = () => {
    setSelectedOption('')
    setCustomDateTime('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Snooze Ticket #{ticketNumber}</h3>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <p className="text-sm text-gray-600 mb-4">
            Temporarily hide this ticket and automatically resume it later.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Snooze until:
            </label>
            <div className="space-y-2">
              {snoozeOptions.map((option) => (
                <div key={option.id}>
                  <label
                    className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOption === option.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="snooze"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{option.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </label>

                  {/* Custom Date/Time Picker */}
                  {option.id === 'custom' && selectedOption === 'custom' && (
                    <div className="mt-2 ml-7 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Select Date & Time:
                      </label>
                      <input
                        type="datetime-local"
                        value={customDateTime}
                        onChange={(e) => setCustomDateTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-between gap-3 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={!selectedOption || (selectedOption === 'custom' && !customDateTime)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Snooze Ticket
            </button>
            {isSnoozed && onRemoveSnooze && (
              <button
                onClick={() => {
                  onRemoveSnooze()
                  handleCancel()
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Remove Snooze
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

