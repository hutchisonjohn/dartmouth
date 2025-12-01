import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
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
  snoozed: 'bg-purple-50 text-purple-700 ring-purple-600/20',
}

const priorityColors = {
  low: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  normal: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  high: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  critical: 'bg-red-50 text-red-700 ring-red-600/20',
  urgent: 'bg-red-100 text-red-800 ring-red-700/30',
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
  const location = useLocation()
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortColumn, setSortColumn] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
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
    } else if (filter === 'unassigned') {
      setAssignmentFilter('unassigned')
      setVipFilter(false)
    } else if (filter === 'all-escalated') {
      setAssignmentFilter('all-escalated')
      setVipFilter(false)
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
    queryKey: ['tickets-all'], // Fetch all tickets once, filter client-side
    queryFn: async () => {
      const params: any = { limit: 1000 } // Get all tickets
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
  
  // STEP 1: Apply backend status filter (from API)
  // This is already filtered by the API if statusFilter is not 'all'
  
  // STEP 2: Apply sidebar navigation filters (these override everything else)
  // Check if we're on a specific sidebar link
  const isOpenFilter = location.search.includes('status=open')
  const isResolvedFilter = location.search.includes('status=resolved')
  const isSnoozedFilter = location.search.includes('status=snoozed')
  const isVipFilter = location.search.includes('filter=vip')
  const isMyTicketsFilter = location.search.includes('filter=my')
  const isUnassignedFilter = location.search.includes('filter=unassigned')
  const isAllEscalatedFilter = location.search.includes('filter=all-escalated')
  const isSamFilter = location.search.includes('assigned=sam')
  const isTedFilter = location.search.includes('assigned=ted')
  
  if (isOpenFilter) {
    // Open: Assigned, in-progress tickets only
    tickets = tickets.filter((t: any) => 
      (t.status === 'open' || t.status === 'in-progress') && 
      t.assigned_to && 
      t.assigned_to !== null
    )
  } else if (isResolvedFilter) {
    // Resolved: Only resolved/closed tickets
    tickets = tickets.filter((t: any) => 
      t.status === 'resolved' || t.status === 'closed'
    )
  } else if (isSnoozedFilter) {
    // Snoozed: Only snoozed tickets
    tickets = tickets.filter((t: any) => t.status === 'snoozed')
  } else if (isVipFilter) {
    // VIP: VIP tickets, exclude resolved
    tickets = tickets.filter((t: any) => 
      t.vip === 1 &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    )
  } else if (isMyTicketsFilter) {
    // My Tickets: Assigned to current user OR escalated to me, exclude resolved/closed (INCLUDE snoozed)
    const currentUserId = '00000000-0000-0000-0000-000000000001' // John's ID
    tickets = tickets.filter((t: any) => 
      (t.assigned_to === currentUserId || t.is_escalated_to_me === 1) &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    )
  } else if (isUnassignedFilter) {
    // Unassigned: No assignment, exclude resolved
    tickets = tickets.filter((t: any) => 
      (!t.assigned_to || t.assigned_to === null) &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    )
  } else if (isAllEscalatedFilter) {
    // All Escalated: Show all tickets with active escalations (admin/manager only)
    tickets = tickets.filter((t: any) => t.has_escalation === 1)
  } else if (isSamFilter) {
    // Sam's tickets: Include open, in-progress, AND snoozed (exclude resolved, closed)
    console.log('Sam filter - all tickets:', tickets.map((t: any) => ({ id: t.ticket_number, assigned: t.assigned_to, status: t.status })))
    tickets = tickets.filter((t: any) => 
      t.assigned_to === '00000000-0000-0000-0000-000000000003' &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    )
    console.log('Sam filter - filtered tickets:', tickets.length)
  } else if (isTedFilter) {
    // Ted's tickets: Include open, in-progress, AND snoozed (exclude resolved, closed)
    console.log('Ted filter - all tickets:', tickets.map((t: any) => ({ id: t.ticket_number, assigned: t.assigned_to, status: t.status })))
    tickets = tickets.filter((t: any) => 
      t.assigned_to === '00000000-0000-0000-0000-000000000002' &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    )
    console.log('Ted filter - filtered tickets:', tickets.length)
  } else {
    // All Tickets (default): Exclude resolved/closed
    tickets = tickets.filter((t: any) => 
      t.status !== 'resolved' && 
      t.status !== 'closed'
    )
  }
  
  // STEP 3: Apply top filter bar filters (only if no sidebar filter is active)
  if (!isOpenFilter && !isResolvedFilter && !isSnoozedFilter && !isVipFilter && 
      !isMyTicketsFilter && !isUnassignedFilter && !isAllEscalatedFilter && !isSamFilter && !isTedFilter) {
    
    if (sentimentFilter !== 'all') {
      tickets = tickets.filter((t: any) => t.sentiment === sentimentFilter)
    }
    if (channelFilter !== 'all') {
      tickets = tickets.filter((t: any) => t.channel === channelFilter)
    }
  }

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to ascending
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Sort tickets based on selected column and direction
  tickets = tickets.sort((a: any, b: any) => {
    // First priority: Escalated tickets first (unless sorting by a specific column)
    if (a.has_escalation === 1 && b.has_escalation !== 1) return -1
    if (a.has_escalation !== 1 && b.has_escalation === 1) return 1
    
    // Second priority: Snoozed tickets last
    if (a.status === 'snoozed' && b.status !== 'snoozed') return 1
    if (a.status !== 'snoozed' && b.status === 'snoozed') return -1
    
    // Third priority: Sort by selected column
    let aValue = a[sortColumn]
    let bValue = b[sortColumn]
    
    // Handle special cases
    if (sortColumn === 'created_at') {
      aValue = new Date(a.created_at).getTime()
      bValue = new Date(b.created_at).getTime()
    } else if (sortColumn === 'customer_name') {
      aValue = a.customer_name?.toLowerCase() || ''
      bValue = b.customer_name?.toLowerCase() || ''
    } else if (sortColumn === 'subject') {
      aValue = a.subject?.toLowerCase() || ''
      bValue = b.subject?.toLowerCase() || ''
    } else if (sortColumn === 'assigned_to') {
      aValue = staffNames[a.assigned_to] || 'Unassigned'
      bValue = staffNames[b.assigned_to] || 'Unassigned'
    }
    
    // Apply sort direction
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })

  // Get queue title based on current filter
  const getQueueTitle = () => {
    if (isMyTicketsFilter) return 'My Tickets'
    if (isOpenFilter) return 'Open'
    if (isUnassignedFilter) return 'Unassigned'
    if (isAllEscalatedFilter) return '⚠️ All Escalated Tickets'
    if (isSnoozedFilter) return 'Snoozed'
    if (isVipFilter) return 'VIP'
    if (isResolvedFilter) return 'Resolved'
    if (isSamFilter) return 'Sam Johnson'
    if (isTedFilter) return 'Ted Smith'
    return 'All Tickets'
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900 flex items-center gap-3">
            {getQueueTitle()}
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
              {tickets.length}
            </span>
          </h1>
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
          <option value="00000000-0000-0000-0000-000000000001">My Tickets</option>
          <option value="vip">VIP Tickets</option>
          <option value="00000000-0000-0000-0000-000000000003">Sam Johnson</option>
          <option value="00000000-0000-0000-0000-000000000002">Ted Smith</option>
          <option value="unassigned">Unassigned</option>
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
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('ticket_number')}>
                    <div className="flex items-center gap-1">
                      Ticket #
                      {sortColumn === 'ticket_number' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-1">
                      Created
                      {sortColumn === 'created_at' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('customer_name')}>
                    <div className="flex items-center gap-1">
                      Customer
                      {sortColumn === 'customer_name' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('subject')}>
                    <div className="flex items-center gap-1">
                      Subject
                      {sortColumn === 'subject' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('priority')}>
                    <div className="flex items-center gap-1">
                      Priority
                      {sortColumn === 'priority' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortColumn === 'status' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('assigned_to')}>
                    <div className="flex items-center gap-1">
                      Assignment
                      {sortColumn === 'assigned_to' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50" onClick={() => handleSort('sentiment')}>
                    <div className="flex items-center gap-1">
                      Sentiment
                      {sortColumn === 'sentiment' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
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
                    
                    const rowBgClass = ticket.has_escalation === 1 
                      ? 'bg-orange-50' 
                      : ticket.status === 'snoozed' 
                        ? 'bg-purple-100' 
                        : ''
                    
                    return (
                    <tr key={ticket.ticket_id} className={rowBgClass}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium">
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
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-900 hover:text-indigo-600 font-medium">{ticket.customer_name}</span>
                              {ticket.vip === 1 && (
                                <span className="text-yellow-500" title="VIP Customer">⭐</span>
                              )}
                              {/* Show Shopify icon for customers with purchase history - temporary mock based on VIP or specific emails */}
                              {(ticket.vip === 1 || ticket.customer_email.includes('sarah') || ticket.customer_email.includes('john')) && (
                                <span title="Shopify Customer - Has Purchase History">
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                </span>
                              )}
                            </div>
                            <div className="text-gray-500 hover:text-indigo-500 text-xs">{ticket.customer_email}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {ticket.subject || ticket.description || 'No subject'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${priorityColors[ticket.priority as keyof typeof priorityColors] || priorityColors.normal}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="relative inline-block">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[ticket.status as keyof typeof statusColors] || statusColors.open}`}>
                            {ticket.status}
                          </span>
                          {ticket.is_escalated_to_me === 1 && (
                            <span className="absolute -top-2 -right-2 text-sm leading-none" title="Escalated - You've been asked for help">
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {ticket.assigned_to ? (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {staffNames[ticket.assigned_to] || ticket.assigned_to}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-300">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${sentimentColors[ticket.sentiment as keyof typeof sentimentColors] || sentimentColors.neutral}`}>
                          {sentimentIcons[ticket.sentiment as keyof typeof sentimentIcons] || '😐'} {ticket.sentiment || 'neutral'}
                        </span>
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


