import { useQuery } from '@tanstack/react-query'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ticketsApi } from '../lib/api'
import { formatDistanceToNow } from 'date-fns'
import { User, Package, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import StatusModal from '../components/StatusModal'

const statusColors = {
  open: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-gray-100 text-gray-800 border-gray-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
  escalated: 'bg-red-100 text-red-800 border-red-200',
}

const priorityColors = {
  low: 'text-gray-600',
  normal: 'text-blue-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
  urgent: 'text-red-700',
}

const sentimentIcons = {
  positive: '😊',
  neutral: '😐',
  negative: '😟',
  angry: '😡',
}

const staffNames: Record<string, string> = {
  '00000000-0000-0000-0000-000000000001': 'John Hutchison',
  '00000000-0000-0000-0000-000000000002': 'Ted Smith',
  '00000000-0000-0000-0000-000000000003': 'Sam Johnson',
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [showShopify, setShowShopify] = useState(false)
  const [staffResponse, setStaffResponse] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [showInternalNotes, setShowInternalNotes] = useState(true)
  const [showResponseArea, setShowResponseArea] = useState(true)
  const [internalNote, setInternalNote] = useState('')

  const { data: ticketData, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const response = await ticketsApi.get(id!)
      return response.data
    },
    enabled: !!id,
  })

  // Fetch all tickets for navigation
  const { data: allTicketsData } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await ticketsApi.list()
      return response.data
    },
  })

  const ticket = ticketData?.ticket
  const messages = ticketData?.messages || []
  const notes = ticketData?.notes || []
  let allTickets = allTicketsData?.tickets || []
  
  // Get the current filter from URL params
  const filter = searchParams.get('filter')
  const fromAssignment = searchParams.get('from')
  
  // Filter tickets based on the context the user came from
  if (filter === 'my' || fromAssignment === 'my') {
    // Show only my tickets (John's tickets)
    allTickets = allTickets.filter((t: any) => t.assigned_to === '00000000-0000-0000-0000-000000000001')
  } else if (filter === 'vip' || fromAssignment === 'vip') {
    // Show only VIP tickets
    allTickets = allTickets.filter((t: any) => t.vip === 1)
  } else if (fromAssignment) {
    // Show only tickets assigned to specific staff member
    allTickets = allTickets.filter((t: any) => t.assigned_to === fromAssignment)
  }
  
  // Find current ticket index in filtered list
  const currentIndex = allTickets.findIndex((t: any) => t.ticket_id === id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex < allTickets.length - 1
  
  const handlePrevious = () => {
    if (hasPrevious) {
      const params = new URLSearchParams(searchParams)
      navigate(`/tickets/${allTickets[currentIndex - 1].ticket_id}?${params.toString()}`)
    }
  }
  
  const handleNext = () => {
    if (hasNext) {
      const params = new URLSearchParams(searchParams)
      navigate(`/tickets/${allTickets[currentIndex + 1].ticket_id}?${params.toString()}`)
    }
  }

  const handleSendReply = async () => {
    if (!staffResponse.trim() || !ticket) return
    
    setIsSending(true)
    try {
      console.log('Sending reply to ticket:', ticket.ticket_id)
      const response = await ticketsApi.reply(ticket.ticket_id, staffResponse)
      console.log('Reply sent successfully:', response)
      setStaffResponse('')
      // Refresh ticket data to show new message
      window.location.reload()
    } catch (error: any) {
      console.error('Failed to send reply:', error)
      console.error('Error details:', error.response?.data || error.message)
      alert(`Failed to send reply: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleAddNote = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || !internalNote.trim() || !ticket) return
    e.preventDefault()
    
    try {
      console.log('Adding note to ticket:', ticket.ticket_id)
      await ticketsApi.addNote(ticket.ticket_id, internalNote)
      setInternalNote('')
      window.location.reload()
    } catch (error: any) {
      console.error('Failed to add note:', error)
      alert(`Failed to add note: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return
    await ticketsApi.updateStatus(ticket.ticket_id, newStatus)
    window.location.reload()
  }

  // Keyboard shortcut: Ctrl+I (Cmd+I on Mac) to toggle Internal Notes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        setShowInternalNotes(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading ticket...</div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Ticket not found</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <Link to="/tickets" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-gray-900">{ticket.ticket_number}</h1>
                {ticket.vip === 1 && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs border border-yellow-200 font-medium">
                    ⭐ VIP
                  </span>
                )}
                <button
                  onClick={() => setShowStatusModal(true)}
                  className={`px-2 py-0.5 rounded-lg text-xs border font-medium hover:opacity-80 ${statusColors[ticket.status as keyof typeof statusColors] || statusColors.open}`}
                >
                  {ticket.status}
                </button>
                <span className={`text-xs font-medium ${priorityColors[ticket.priority as keyof typeof priorityColors] || priorityColors.normal}`}>
                  {ticket.priority}
                </span>
                <span className="text-xs">
                  {sentimentIcons[ticket.sentiment as keyof typeof sentimentIcons] || '😐'} {ticket.sentiment || 'neutral'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{ticket.subject}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              {ticket.assigned_to ? staffNames[ticket.assigned_to] || ticket.assigned_to : 'Unassigned'}
            </button>
            <button 
              onClick={() => setShowReassignModal(true)}
              className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reassign</span>
            </button>
            <button className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Escalate</span>
            </button>
            <button className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Snooze</span>
            </button>
            <select 
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
            </select>
            <span className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
              ticket.priority === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
              ticket.priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-300' :
              ticket.priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-300' :
              ticket.priority === 'normal' ? 'bg-blue-100 text-blue-800 border-blue-300' :
              'bg-gray-100 text-gray-800 border-gray-300'
            }`}>
              {ticket.priority} Priority
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCustomerDetails(!showCustomerDetails)}
              className="h-7 text-xs px-2 py-1 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-1"
            >
              <User className="w-3 h-3" />
              <span>Customer Info</span>
            </button>
            <button
              onClick={() => setShowOrders(!showOrders)}
              className="h-7 text-xs px-2 py-1 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-1"
            >
              <Package className="w-3 h-3" />
              <span>Order History</span>
            </button>
            <button
              onClick={() => setShowShopify(!showShopify)}
              className={`h-7 text-xs px-2 py-1 border rounded-lg hover:opacity-80 transition-colors flex items-center justify-center space-x-1 font-medium ${
                showShopify 
                  ? 'bg-green-600 text-white border-green-700' 
                  : 'bg-white text-green-700 border-green-300'
              }`}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Shopify</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="h-7 text-xs px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleNext}
              disabled={!hasNext}
              className="h-7 text-xs px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Messages and Response Container */}
        <div className="flex flex-col flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {/* Customer Details Panel */}
          {showCustomerDetails && (
            <div className="p-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
              <div className="bg-white rounded-lg p-3 text-xs">
                <h4 className="font-semibold text-gray-800 mb-2">Customer Profile</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{ticket.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">VIP:</span>
                    <span className="ml-2 font-medium text-amber-600">{ticket.vip ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 font-medium">{ticket.customer_email}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order History Panel */}
          {showOrders && (
            <div className="p-3 bg-green-50 border-b border-green-100 flex-shrink-0">
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-semibold text-gray-800 mb-2 text-xs">Order History</h4>
                <p className="text-xs text-gray-500">Order history will be loaded from Shopify</p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ maxHeight: '500px', minHeight: '300px' }}>
            {/* Initial Message */}
            <div className="flex justify-start">
              <div className="max-w-sm rounded-lg p-3 bg-white border border-gray-200">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium">{ticket.customer_name}</span>
                  <span className="text-xs opacity-60">{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>

            {/* Additional Messages */}
            {messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.sender_type === 'customer' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-sm rounded-lg p-3 ${
                  msg.sender_type === 'customer' 
                    ? 'bg-white border border-gray-200' 
                    : 'bg-indigo-100 border border-indigo-200'
                }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium">
                    {msg.sender_type === 'customer' 
                      ? (msg.sender_name || 'Customer')
                      : (msg.sender_name ? msg.sender_name.split(' ')[0] : 'John')  // First name for staff
                    }
                  </span>
                  <span className="text-xs opacity-60">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Response Area */}
          <div className="border-t border-gray-200 bg-white flex-shrink-0">
            <div className="p-2 bg-gray-100 border-b border-gray-200 flex items-center justify-center">
              <button
                onClick={() => setShowResponseArea(!showResponseArea)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Toggle Response Area"
              >
                {showResponseArea ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </button>
            </div>
            
            {showResponseArea && (
              <div className="p-4">
                <div className="mb-2">
                  <textarea
                    value={staffResponse}
                    onChange={(e) => setStaffResponse(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                    rows={4}
                  />
                </div>
                <div className="space-y-3">
                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      Attach File
                    </button>
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      📋 All Templates
                    </button>
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      🔔 @order-status
                    </button>
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      🚚 @tracking
                    </button>
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      💰 @vip-wallet
                    </button>
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      🎨 @artwork
                    </button>
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      📊 @quote
                    </button>
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      📦 Products
                    </button>
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">
                      🧾 Generate Invoice
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-x-2">
                    <button 
                      onClick={handleSendReply}
                      disabled={!staffResponse.trim() || isSending}
                      className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {isSending ? 'Sending...' : 'Send Reply'}
                    </button>
                    <button className="px-4 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule Reply
                    </button>
                    <button className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Resolve & Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Internal Notes Section */}
          <div className="border-t border-gray-200 bg-yellow-50 flex-shrink-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">Internal Note (Staff Only)</h3>
                <button
                  onClick={() => setShowInternalNotes(!showInternalNotes)}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
                  title="Toggle Internal Notes (Ctrl+I or Cmd+I)"
                >
                  {showInternalNotes ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span>Hide</span>
                      <span className="text-gray-400 ml-1">(Ctrl+I)</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span>Show</span>
                      <span className="text-gray-400 ml-1">(Ctrl+I)</span>
                    </>
                  )}
                </button>
              </div>
              
              {showInternalNotes && (
                <>
                  {/* Existing Notes */}
                  {notes && notes.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {notes.map((note: any) => (
                        <div key={note.id} className="bg-yellow-100 rounded-lg p-3 border border-yellow-200">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-800">{note.first_name || 'Staff'}</span>
                              <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-sm text-gray-700">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Note Input */}
                  <div>
                    <textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      onKeyDown={handleAddNote}
                      placeholder="Add internal notes for other staff members... (Press Enter to save)"
                      className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 resize-none bg-white"
                      rows={2}
                    />
                    <button className="mt-2 text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      Attach File
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shopify Right Sidebar - Slides in from right */}
      <div className={`bg-white border-l border-gray-200 transition-all duration-300 ease-in-out overflow-y-auto ${
        showShopify ? 'w-96' : 'w-0'
      }`}>
        {showShopify && (
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                <h2 className="text-base font-semibold text-gray-900">Shopify</h2>
              </div>
              <button 
                onClick={() => setShowShopify(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Customer Section */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">CUSTOMER</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{ticket.customer_name || 'Sarah Chen'}</p>
                  <p className="text-xs text-gray-500">{ticket.customer_email || 'sarah@example.com'}</p>
                  <p className="text-xs text-gray-500">+1 (555) 123-4567</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Total Spent:</span>
                    <span className="font-semibold text-indigo-600">$2,847.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Total Orders:</span>
                    <span className="font-semibold text-gray-900">8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Section */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">ORDER</h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order #5421</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
                      Fulfilled
                    </span>
                    <span className="text-xs text-gray-500">Total: <span className="font-semibold text-gray-900">$342.50</span></span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">Oct 20, 2024</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Fulfillment:</span>
                    <span className="text-green-600 font-medium">Fulfilled</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Payment:</span>
                    <span className="text-green-600 font-medium">Paid</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fulfillment & Tracking Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">FULFILLMENT & TRACKING</h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tracking:</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">1234567890123</p>
                  <p className="text-xs text-gray-500 mt-1">Carrier: <span className="text-gray-900">FedEx</span></p>
                </div>
                <div className="pt-2 border-t border-gray-200 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Shipped:</span>
                    <span className="text-gray-900">Oct 25, 2024 10:30 AM</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Est. Delivery:</span>
                    <span className="font-semibold text-gray-900">Oct 28, 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showStatusModal && (
        <StatusModal
          currentStatus={ticket.status}
          onClose={() => setShowStatusModal(false)}
          onSave={handleStatusChange}
        />
      )}
    </div>
  )
}
