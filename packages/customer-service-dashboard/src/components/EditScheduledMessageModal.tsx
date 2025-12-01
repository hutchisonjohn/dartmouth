import { useState, useEffect } from 'react'

interface EditScheduledMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newContent: string, scheduledDate: string, scheduledTime: string) => void
  onRemove?: () => void
  message: any
}

export default function EditScheduledMessageModal({ isOpen, onClose, onConfirm, onRemove, message }: EditScheduledMessageModalProps) {
  const [content, setContent] = useState<string>('')
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [scheduledHour, setScheduledHour] = useState<string>('09')
  const [scheduledMinute, setScheduledMinute] = useState<string>('00')

  useEffect(() => {
    if (isOpen && message) {
      setContent(message.content)
      const date = new Date(message.scheduled_for)
      setScheduledDate(date.toISOString().split('T')[0])
      setScheduledHour(date.getHours().toString().padStart(2, '0'))
      setScheduledMinute(date.getMinutes().toString().padStart(2, '0'))
    }
  }, [isOpen, message])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!content.trim()) {
      alert('Message content cannot be empty')
      return
    }
    if (!scheduledDate) {
      alert('Please select a date')
      return
    }

    const scheduledTime = `${scheduledHour}:${scheduledMinute}`
    onConfirm(content, scheduledDate, scheduledTime)
    onClose()
  }

  const handleCancel = () => {
    setContent('')
    setScheduledDate('')
    setScheduledHour('09')
    setScheduledMinute('00')
    onClose()
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Edit Scheduled Message</h3>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">
            Edit the message content and scheduled time for this reply.
          </p>

          <div className="space-y-4">
            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                placeholder="Enter your message..."
              />
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Time Input - Hour and Minute Dropdowns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Time
              </label>
              <div className="flex gap-2">
                <select
                  value={scheduledHour}
                  onChange={(e) => setScheduledHour(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0')
                    return <option key={hour} value={hour}>{hour}</option>
                  })}
                </select>
                <span className="flex items-center text-gray-500 font-semibold">:</span>
                <select
                  value={scheduledMinute}
                  onChange={(e) => setScheduledMinute(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const minute = i.toString().padStart(2, '0')
                    return <option key={minute} value={minute}>{minute}</option>
                  })}
                </select>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This message will be sent automatically at the scheduled time.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-between gap-3 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={!content.trim() || !scheduledDate}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
            {onRemove && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to remove this scheduled message? It will not be sent.')) {
                    onRemove()
                    handleCancel()
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

