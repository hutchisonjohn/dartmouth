import { useState, useEffect } from 'react'

interface ScheduleReplyModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (scheduledDate: string, scheduledTime: string) => void
}

export default function ScheduleReplyModal({ isOpen, onClose, onConfirm }: ScheduleReplyModalProps) {
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [scheduledHour, setScheduledHour] = useState<string>('09')
  const [scheduledMinute, setScheduledMinute] = useState<string>('00')

  // Get today's date in YYYY-MM-DD format (in local timezone)
  const getTodayDate = () => {
    const today = new Date()
    // Use local date parts to avoid timezone issues
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Get current hour (rounded up to next hour)
  const getNextHour = () => {
    const now = new Date()
    const nextHour = now.getHours() + 1
    return nextHour >= 24 ? '09' : nextHour.toString().padStart(2, '0')
  }

  // Set default to today at next hour when opening
  useEffect(() => {
    if (isOpen) {
      setScheduledDate(getTodayDate())
      setScheduledHour(getNextHour())
      setScheduledMinute('00')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!scheduledDate || !scheduledHour || !scheduledMinute) {
      alert('Please select date and time')
      return
    }

    const scheduledTime = `${scheduledHour}:${scheduledMinute}`
    onConfirm(scheduledDate, scheduledTime)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  // Get today's date in YYYY-MM-DD format for min attribute (local timezone)
  const todayForMin = getTodayDate()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Schedule Reply</h3>
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
            Schedule when this message will be sent to the customer. Scheduled messages are only visible to staff until the scheduled time.
          </p>

          <div className="space-y-4">
            {/* Date Input - Calendar Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={todayForMin}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Time Input - Hour and Minute Dropdowns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
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
                <strong>Note:</strong> This message will be sent automatically at the scheduled time during business hours (9 AM - 6 PM).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!scheduledDate}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Schedule Reply
          </button>
        </div>
      </div>
    </div>
  )
}

