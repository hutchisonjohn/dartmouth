import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface SidebarProps {
  ticketCounts?: {
    all: number
    myTickets: number
    pending: number
    unassigned: number
    snoozed: number
    resolved: number
    escalated: number
    escalatedToMe: number
    vip: number
    sam: number
    ted: number
  }
  isCollapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ 
  ticketCounts = { all: 0, myTickets: 0, pending: 0, unassigned: 0, snoozed: 0, resolved: 0, escalated: 0, escalatedToMe: 0, vip: 0, sam: 0, ted: 0 },
  isCollapsed,
  onToggle
}: SidebarProps) {
  const location = useLocation()
  const [isTicketsExpanded, setIsTicketsExpanded] = useState(true)
  const [isAssignedExpanded, setIsAssignedExpanded] = useState(false)
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(true)

  const isActive = (path: string) => location.pathname === path

  return (
    <div className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Fixed Hamburger Button - Always Visible */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <button
          onClick={onToggle}
          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title={isCollapsed ? "Expand Navigation (Ctrl+B)" : "Collapse Navigation (Ctrl+B)"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Collapsed View - Icon Bar */}
      {isCollapsed ? (
        <div className="flex flex-col items-center py-4 space-y-4">
          {/* Icon Links - Click to expand sidebar */}
          <button
            onClick={onToggle}
            className="p-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors relative group"
            title="All Tickets - Click to expand"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {ticketCounts.all > 0 && (
              <span className="absolute -top-1 -right-1 bg-gray-200 text-gray-800 text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold ring-1 ring-gray-400">
                {ticketCounts.all}
              </span>
            )}
          </button>

          <button
            onClick={onToggle}
            className="p-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
            title="Mentions - Click to expand"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <button
            onClick={onToggle}
            className="p-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
            title="Analytics - Click to expand"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          <button
            onClick={onToggle}
            className="p-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
            title="Settings - Click to expand"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      ) : (
        /* Expanded View - Full Sidebar */
        <div className="overflow-y-auto flex-1">
              <div className="p-4">
            {/* Tickets Section */}
            <div className="mb-6">
          <button 
            onClick={() => setIsTicketsExpanded(!isTicketsExpanded)}
            className="w-full flex items-center justify-between mb-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <h3 className="text-sm font-semibold text-indigo-600 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Tickets
            </h3>
            {isTicketsExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isTicketsExpanded && (
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
              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                isActive('/tickets') && !location.search
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-400'
              }`}>
                {ticketCounts.all}
              </span>
            </Link>

            {/* Escalated - submenu under All Tickets (Admin/Manager only) - only show if count > 0 */}
            {ticketCounts.escalated > 0 && (
              <Link
                to="/tickets?filter=all-escalated"
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ml-4 ${
                  location.search.includes('filter=all-escalated')
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="text-xs">⚠️</span>
                  <span>Escalated</span>
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                  location.search.includes('filter=all-escalated')
                    ? 'bg-indigo-600 text-white'
                    : 'bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-600'
                }`}>
                  {ticketCounts.escalated}
                </span>
              </Link>
            )}

            <Link
              to="/tickets?filter=my"
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                location.search.includes('filter=my')
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>My Tickets</span>
              <div className="relative inline-block">
                <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                  location.search.includes('filter=my')
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-400'
                }`}>
                  {ticketCounts.myTickets}
                </span>
                {ticketCounts.escalatedToMe > 0 && (
                  <span className="absolute -top-2 -right-2 text-sm leading-none" title="You have escalated tickets needing your help">
                    ⚠️
                  </span>
                )}
              </div>
            </Link>

            <Link
              to="/tickets?status=open"
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                location.search.includes('status=open')
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Open</span>
              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                location.search.includes('status=open')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-400'
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
                  to="/tickets?assigned=sam"
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    location.search.includes('assigned=sam')
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Sam Johnson</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                    location.search.includes('assigned=sam')
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-400'
                  }`}>
                    {ticketCounts.sam}
                  </span>
                </Link>
                <Link
                  to="/tickets?assigned=ted"
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    location.search.includes('assigned=ted')
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Ted Smith</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                    location.search.includes('assigned=ted')
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-400'
                  }`}>
                    {ticketCounts.ted}
                  </span>
                </Link>
              </div>
            )}

            <Link
              to="/tickets?filter=unassigned"
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                location.search.includes('filter=unassigned')
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Unassigned</span>
              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                location.search.includes('filter=unassigned')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-400'
              }`}>
                {ticketCounts.unassigned}
              </span>
            </Link>

            <Link
              to="/tickets?status=snoozed"
              className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                location.search.includes('status=snoozed')
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Snoozed</span>
              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                location.search.includes('status=snoozed')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-400'
              }`}>
                {ticketCounts.snoozed}
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
              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                location.search.includes('filter=vip')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-400'
              }`}>
                {ticketCounts.vip}
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
              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                location.search.includes('status=resolved')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-800 ring-1 ring-inset ring-gray-400'
              }`}>
                {ticketCounts.resolved}
              </span>
            </Link>
          </nav>
          )}
        </div>

        {/* Mentions Section */}
        <div className="mb-6">
          <h3 className="px-3 mb-2 text-sm font-semibold text-indigo-600 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Mentions
          </h3>
          <nav className="space-y-1">
            <Link
              to="/mentions"
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive('/mentions')
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>All Mentions</span>
            </Link>
          </nav>
        </div>

        {/* Analytics Section */}
        <div className="mb-6">
          <button 
            onClick={() => setIsAnalyticsExpanded(!isAnalyticsExpanded)}
            className="w-full flex items-center justify-between mb-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <h3 className="text-sm font-semibold text-indigo-600 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </h3>
            {isAnalyticsExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isAnalyticsExpanded && (
            <nav className="space-y-1">
              <Link
                to="/analytics/ai-agent"
                className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  location.pathname === '/analytics/ai-agent'
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>AI Agent</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Settings Section */}
        <div className="mb-6">
          <h3 className="px-3 mb-2 text-sm font-semibold text-indigo-600 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </h3>
          <nav className="space-y-1">
            <Link
              to="/settings"
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive('/settings')
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>General Settings</span>
            </Link>
          </nav>
        </div>
      </div>
        </div>
      )}
    </div>
  )
}

