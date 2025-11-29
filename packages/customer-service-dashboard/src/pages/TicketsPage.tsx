import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ticketsApi } from '../lib/api'
import { formatDistanceToNow } from 'date-fns'
import { Mail } from 'lucide-react'
import PlatformSelect from '../components/PlatformSelect'

const statusColors = {
  open: 'bg-green-50 text-green-700 ring-green-600/20',
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  'in-progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  resolved: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  closed: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  escalated: 'bg-red-50 text-red-700 ring-red-600/20',
  snoozed: 'bg-purple-50 text-purple-700 ring-purple-600/20',
}

const priorityColors = {
  low: 'text-gray-600',
  normal: 'text-blue-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
  urgent: 'text-red-700',
}

const sentimentColors = {
  positive: 'bg-green-50 text-green-700 ring-green-600/20',
  neutral: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  negative: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  angry: 'bg-red-50 text-red-700 ring-red-600/20',
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

export default function TicketsPage() {
  const [searchParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sentimentFilter, setSentimentFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [assignmentFilter, setAssignmentFilter] = useState('all')
  const [vipFilter, setVipFilter] = useState(false)

  // Handle URL params for filtering
  useEffect(() => {
    const filter = searchParams.get('filter')
    const assigned = searchParams.get('assigned')
    const status = searchParams.get('status')
    
    // Handle "My Tickets" from sidebar
    if (filter === 'my') {
      setAssignmentFilter('00000000-0000-0000-0000-000000000001') // John's ID
      setVipFilter(false)
    } else if (filter === 'vip') {
      setAssignmentFilter('vip')
      setVipFilter(true)
    } else if (assigned === 'ted') {
      setAssignmentFilter('00000000-0000-0000-0000-000000000002')
      setVipFilter(false)
    } else if (assigned === 'sam') {
      setAssignmentFilter('00000000-0000-0000-0000-000000000003')
      setVipFilter(false)
    } else if (assigned) {
      setAssignmentFilter(assigned)
      setVipFilter(false)
    } else if (!filter) {
      // Reset to 'all' if no filter
      setAssignmentFilter('all')
      setVipFilter(false)
    }
    
    if (status) {
      setStatusFilter(status)
    }
  }, [searchParams])

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', statusFilter, priorityFilter],
    queryFn: async () => {
      const params: any = { limit: 100 }
      if (statusFilter !== 'all') params.status = statusFilter
      if (priorityFilter !== 'all') params.priority = priorityFilter
      const response = await ticketsApi.list(params)
      return response.data.tickets
    },
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tickets...</div>
      </div>
    )
  }

  let tickets = data || []
  
  // Client-side filtering for sentiment, channel, assignment, and VIP
  if (sentimentFilter !== 'all') {
    tickets = tickets.filter((t: any) => t.sentiment === sentimentFilter)
  }
  if (channelFilter !== 'all') {
    tickets = tickets.filter((t: any) => t.channel === channelFilter)
  }
  if (vipFilter) {
    // Filter for VIP tickets only
    tickets = tickets.filter((t: any) => t.vip === 1)
  } else if (assignmentFilter !== 'all' && assignmentFilter !== 'vip') {
    // Filter by staff assignment
    tickets = tickets.filter((t: any) => t.assigned_to === assignmentFilter)
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Tickets</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all customer service tickets including their status, priority, and assignment.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="block w-full rounded-lg border-2 border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white"
        >
          <option value="all">All Platforms</option>
          <option value="email">📧 Email</option>
          <option value="live-chat">💬 Live Chat</option>
          <option value="whatsapp">📱 WhatsApp</option>
          <option value="instagram">📷 Instagram</option>
          <option value="facebook">👥 Facebook</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full rounded-lg border-2 border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="snoozed">Snoozed</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="block w-full rounded-lg border-2 border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
          className="block w-full rounded-lg border-2 border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white"
        >
          <option value="all">All Sentiments</option>
          <option value="positive">😊 Positive</option>
          <option value="neutral">😐 Neutral</option>
          <option value="negative">😟 Negative</option>
          <option value="angry">😡 Angry</option>
        </select>

        <select 
          value={assignmentFilter}
          onChange={(e) => {
            const value = e.target.value
            setAssignmentFilter(value)
            setVipFilter(value === 'vip')
          }}
          className="block w-full rounded-lg border-2 border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white"
        >
          <option value="all">All Tickets</option>
          <option value="vip">⭐ VIP Tickets</option>
          <option value="00000000-0000-0000-0000-000000000001">My Tickets</option>
          <option value="00000000-0000-0000-0000-000000000002">Ted Smith</option>
          <option value="00000000-0000-0000-0000-000000000003">Sam Johnson</option>
        </select>

        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="block w-full rounded-lg border-2 border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Ticket #
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Customer
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Subject
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Priority
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Assignment
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Sentiment
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-sm text-gray-500">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket: any) => {
                    // Build URL with filter context
                    const params = new URLSearchParams()
                    if (vipFilter) {
                      params.set('filter', 'vip')
                    } else if (assignmentFilter !== 'all' && assignmentFilter !== 'vip') {
                      params.set('from', assignmentFilter)
                    }
                    const ticketUrl = params.toString() 
                      ? `/tickets/${ticket.ticket_id}?${params.toString()}`
                      : `/tickets/${ticket.ticket_id}`
                    
                    return (
                    <tr key={ticket.ticket_id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                        <Link 
                          to={ticketUrl}
                          className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4 text-gray-400" />
                          {ticket.ticket_number}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div>{new Date(ticket.created_at).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Link 
                          to={`/tickets?customer=${encodeURIComponent(ticket.customer_email)}`}
                          className="block hover:bg-gray-50 -m-2 p-2 rounded transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-gray-900 hover:text-indigo-600 font-medium">{ticket.customer_name}</div>
                              <div className="text-gray-500 hover:text-indigo-500 text-xs">{ticket.customer_email}</div>
                            </div>
                            {ticket.vip === 1 && (
                              <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                ⭐ VIP
                              </span>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {ticket.subject || ticket.description || 'No subject'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={priorityColors[ticket.priority as keyof typeof priorityColors] || priorityColors.normal}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[ticket.status as keyof typeof statusColors] || statusColors.open}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {ticket.assigned_to ? (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {staffNames[ticket.assigned_to] || ticket.assigned_to}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${sentimentColors[ticket.sentiment as keyof typeof sentimentColors] || sentimentColors.neutral}`}>
                          {sentimentIcons[ticket.sentiment as keyof typeof sentimentIcons] || '😐'} {ticket.sentiment || 'neutral'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <Link to={ticketUrl} className="text-primary-600 hover:text-primary-900">
                          View<span className="sr-only">, {ticket.ticket_number}</span>
                        </Link>
                      </td>
                    </tr>
                  )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


