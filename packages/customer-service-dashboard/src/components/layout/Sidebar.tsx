import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface SidebarProps {
  ticketCounts?: {
    all: number
    myTickets: number
    pending: number
    snoozed: number
    resolved: number
    vip: number
  }
}

export default function Sidebar({ ticketCounts = { all: 0, myTickets: 0, pending: 0, snoozed: 0, resolved: 0, vip: 0 } }: SidebarProps) {
  const location = useLocation()
  const [isAssignedExpanded, setIsAssignedExpanded] = useState(false)

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4">
        {/* Tickets Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-indigo-600 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Tickets
            </h3>
            <ChevronUp className="w-4 h-4 text-gray-400" />
          </div>

          <nav className="space-y-1">
            <Link
              to="/tickets"
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive('/tickets') && !location.search
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>All Tickets</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                isActive('/tickets') && !location.search
                  ? 'bg-indigo-600 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {ticketCounts.all}
              </span>
            </Link>

            <Link
              to="/tickets?filter=my"
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                location.search.includes('filter=my')
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>My Tickets</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                location.search.includes('filter=my')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {ticketCounts.myTickets}
              </span>
            </Link>

            <Link
              to="/tickets?status=pending"
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                location.search.includes('status=pending')
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Pending</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                location.search.includes('status=pending')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {ticketCounts.pending}
              </span>
            </Link>

            {/* Assigned - Collapsible */}
            <button
              onClick={() => setIsAssignedExpanded(!isAssignedExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>Assigned</span>
              {isAssignedExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {isAssignedExpanded && (
              <div className="ml-4 space-y-1">
                <Link
                  to="/tickets?assigned=ted"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Ted Smith
                </Link>
                <Link
                  to="/tickets?assigned=sam"
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Sam Johnson
                </Link>
              </div>
            )}

            <Link
              to="/tickets?status=snoozed"
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                location.search.includes('status=snoozed')
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Snoozed</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                location.search.includes('status=snoozed')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {ticketCounts.snoozed}
              </span>
            </Link>

            <Link
              to="/tickets?status=resolved"
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                location.search.includes('status=resolved')
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Resolved</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                location.search.includes('status=resolved')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {ticketCounts.resolved}
              </span>
            </Link>

            <Link
              to="/tickets?filter=vip"
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                location.search.includes('filter=vip')
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>VIP</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                location.search.includes('vip=true')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                {ticketCounts.vip}
              </span>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}

