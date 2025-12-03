import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import StaffAvailabilityToggle from '../StaffAvailabilityToggle'

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
    allAssigned: number
    sam: number
    ted: number
  }
  isCollapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ 
  ticketCounts = { all: 0, myTickets: 0, pending: 0, unassigned: 0, snoozed: 0, resolved: 0, escalated: 0, escalatedToMe: 0, vip: 0, allAssigned: 0, sam: 0, ted: 0 },
  isCollapsed,
  onToggle
}: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  // All sections collapsed by default
  const [isTicketsExpanded, setIsTicketsExpanded] = useState(false)
  const [isCustomersExpanded, setIsCustomersExpanded] = useState(false)
  const [isStaffExpanded, setIsStaffExpanded] = useState(false)
  const [isCommunicationExpanded, setIsCommunicationExpanded] = useState(false)
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false)
  const [isChatWidgetExpanded, setIsChatWidgetExpanded] = useState(false)
  const [isAssignedExpanded, setIsAssignedExpanded] = useState(false)

  const isActive = (path: string) => location.pathname === path

  // Collapsible section component
  const CollapsibleSection = ({ 
    title, 
    icon, 
    isExpanded, 
    onToggle: toggleSection, 
    children,
    hasSubmenu = true 
  }: { 
    title: string
    icon: React.ReactNode | null
    isExpanded: boolean
    onToggle: () => void
    children?: React.ReactNode
    hasSubmenu?: boolean
  }) => (
    <div className="mb-2">
      <button
        onClick={toggleSection}
        className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center text-gray-700 font-medium">
          {icon}
          <span className={icon ? "ml-2" : ""}>{title}</span>
        </span>
        {hasSubmenu && (
          isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )
        )}
      </button>
      {isExpanded && children && (
        <div className="ml-6 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  )

  // Simple nav link
  const NavLink = ({ to, children, count }: { to: string; children: React.ReactNode; count?: number }) => (
    <Link
      to={to}
      className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
        isActive(to) || (to.includes('?') && location.search.includes(to.split('?')[1]))
          ? 'bg-indigo-50 text-indigo-700 font-medium'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
          {count}
        </span>
      )}
    </Link>
  )

  // Sub-nav link (indented)
  const SubNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      className={`block px-3 py-1.5 text-sm rounded-lg transition-colors ${
        isActive(to)
          ? 'bg-indigo-50 text-indigo-700 font-medium'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      }`}
    >
      {children}
    </Link>
  )

  return (
    <div className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header with hamburger */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggle}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {!isCollapsed && <StaffAvailabilityToggle />}
        </div>
      </div>

      {isCollapsed ? (
        /* Collapsed View - Icons only - navigate directly without expanding */
        <div className="flex flex-col items-center py-4 space-y-3">
          <button 
            onClick={() => navigate('/tickets')} 
            className={`p-2 rounded-lg transition-colors ${
              location.pathname === '/tickets' || location.pathname.startsWith('/tickets/')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`} 
            title="Tickets"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
          <button 
            onClick={() => navigate('/analytics/ai-agent')} 
            className={`p-2 rounded-lg transition-colors ${
              location.pathname.startsWith('/analytics')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`} 
            title="Analytics"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button 
            onClick={() => navigate('/settings/business-hours')} 
            className={`p-2 rounded-lg transition-colors ${
              location.pathname.startsWith('/settings')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`} 
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      ) : (
        /* Expanded View */
        <div className="overflow-y-auto flex-1 p-3">
          
          {/* Tickets Section */}
          <CollapsibleSection
            title="Tickets"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            isExpanded={isTicketsExpanded}
            onToggle={() => setIsTicketsExpanded(!isTicketsExpanded)}
          >
            <NavLink to="/tickets" count={ticketCounts.all}>All Tickets</NavLink>
            <NavLink to="/tickets?filter=my" count={ticketCounts.myTickets}>My Tickets</NavLink>
            <NavLink to="/tickets?status=open" count={ticketCounts.pending}>Open</NavLink>
            
            {/* Assigned - Nested collapsible under Open */}
            <div>
              <button
                onClick={() => setIsAssignedExpanded(!isAssignedExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-600">Assigned</span>
                {isAssignedExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {isAssignedExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  <NavLink to="/tickets?filter=all-assigned" count={ticketCounts.allAssigned}>All</NavLink>
                  <NavLink to="/tickets?assigned=00000000-0000-0000-0000-000000000003" count={ticketCounts.sam}>Sam</NavLink>
                  <NavLink to="/tickets?assigned=00000000-0000-0000-0000-000000000002" count={ticketCounts.ted}>Ted</NavLink>
                </div>
              )}
            </div>
            
            <NavLink to="/tickets?filter=unassigned" count={ticketCounts.unassigned}>Unassigned</NavLink>
            <NavLink to="/tickets?status=snoozed" count={ticketCounts.snoozed}>Snoozed</NavLink>
            <NavLink to="/tickets?filter=vip" count={ticketCounts.vip}>VIP</NavLink>
            <NavLink to="/tickets?status=resolved" count={ticketCounts.resolved}>Resolved</NavLink>
          </CollapsibleSection>

          {/* AI Chat - Direct Link */}
          <Link
            to="/chat"
            className={`flex items-center px-3 py-2 mb-2 text-sm rounded-lg transition-colors ${
              isActive('/chat')
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            AI Chat
          </Link>

          {/* Customers Section */}
          <CollapsibleSection
            title="Customers"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            isExpanded={isCustomersExpanded}
            onToggle={() => setIsCustomersExpanded(!isCustomersExpanded)}
          >
            <SubNavLink to="/customers">All Customers</SubNavLink>
            <SubNavLink to="/customers/vip">VIP Customers</SubNavLink>
          </CollapsibleSection>

          {/* Staff Section */}
          <CollapsibleSection
            title="Staff"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            isExpanded={isStaffExpanded}
            onToggle={() => setIsStaffExpanded(!isStaffExpanded)}
          >
            <SubNavLink to="/staff">List</SubNavLink>
            <SubNavLink to="/staff/hours">Hours</SubNavLink>
            <SubNavLink to="/staff/assignment">Assignment</SubNavLink>
            <SubNavLink to="/staff/performance">Performance</SubNavLink>
            <SubNavLink to="/staff/views">Private Views</SubNavLink>
          </CollapsibleSection>

          {/* Communication Section */}
          <CollapsibleSection
            title="Communication"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
            isExpanded={isCommunicationExpanded}
            onToggle={() => setIsCommunicationExpanded(!isCommunicationExpanded)}
          >
            <SubNavLink to="/communication/templates">Email Templates</SubNavLink>
            <SubNavLink to="/communication/canned">Canned Responses</SubNavLink>
          </CollapsibleSection>

          {/* Analytics - Direct Link */}
          <Link
            to="/analytics/ai-agent"
            className={`flex items-center px-3 py-2 mb-2 text-sm rounded-lg transition-colors ${
              location.pathname.startsWith('/analytics')
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </Link>

          {/* Notifications - Direct Link */}
          <Link
            to="/notifications"
            className={`flex items-center px-3 py-2 mb-2 text-sm rounded-lg transition-colors ${
              isActive('/notifications')
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </Link>

          {/* Mentions - Direct Link */}
          <Link
            to="/mentions"
            className={`flex items-center px-3 py-2 mb-2 text-sm rounded-lg transition-colors ${
              isActive('/mentions')
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            Mentions
          </Link>

          {/* Tags - Direct Link */}
          <Link
            to="/tags"
            className={`flex items-center px-3 py-2 mb-2 text-sm rounded-lg transition-colors ${
              isActive('/tags')
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Tags
          </Link>

          {/* Business Hours - Direct Link */}
          <Link
            to="/settings/business-hours"
            className={`flex items-center px-3 py-2 mb-2 text-sm rounded-lg transition-colors ${
              isActive('/settings/business-hours')
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Business Hours
          </Link>

          {/* Settings Section */}
          <CollapsibleSection
            title="Settings"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            isExpanded={isSettingsExpanded}
            onToggle={() => setIsSettingsExpanded(!isSettingsExpanded)}
          >
            <SubNavLink to="/settings/general">General</SubNavLink>
            <SubNavLink to="/settings/auth">Auth & Security</SubNavLink>
            <SubNavLink to="/settings/shopify">Shopify</SubNavLink>
            <SubNavLink to="/settings/perp">PERP Integration</SubNavLink>
            <SubNavLink to="/settings/integrations">Integrations</SubNavLink>
            {/* AI Chat Widget with nested submenu */}
            <div className="mb-1">
              <button
                onClick={() => setIsChatWidgetExpanded(!isChatWidgetExpanded)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  location.pathname.startsWith('/settings/chat')
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>AI Chat Widget</span>
                {isChatWidgetExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {isChatWidgetExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  <SubNavLink to="/settings/chat-widget">Settings</SubNavLink>
                  <SubNavLink to="/settings/chat-embed">Embed Code</SubNavLink>
                </div>
              )}
            </div>
          </CollapsibleSection>

        </div>
      )}
    </div>
  )
}
