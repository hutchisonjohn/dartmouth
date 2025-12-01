import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { ticketsApi } from '../../lib/api'
import Sidebar from './Sidebar'
import {
  Bars3Icon,
  XMarkIcon,
  TicketIcon,
  BellIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Tickets', href: '/tickets', icon: TicketIcon },
  { name: 'Mentions', href: '/mentions', icon: BellIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(true) // Hidden by default
  const location = useLocation()
  const { user, logout } = useAuthStore()

  // Fetch ticket counts for sidebar
  const { data: ticketsData } = useQuery({
    queryKey: ['tickets-all'],
    queryFn: async () => {
      const response = await ticketsApi.list({ limit: 1000 })
      return response.data.tickets
    },
    refetchInterval: 30000,
  })

  const tickets = ticketsData || []
  
  // Debug: Log all tickets with their assignments
  console.log('DashboardLayout - All tickets:', tickets.map((t: any) => ({ 
    id: t.ticket_number, 
    assigned: t.assigned_to, 
    status: t.status 
  })))
  
  const ticketCounts = {
    // All Tickets: Exclude resolved/closed
    all: tickets.filter((t: any) => 
      t.status !== 'resolved' && 
      t.status !== 'closed'
    ).length,
    // My Tickets: Assigned to me OR escalated to me, exclude resolved/closed (INCLUDE snoozed)
    myTickets: tickets.filter((t: any) => 
      (t.assigned_to === user?.id || t.is_escalated_to_me === 1) &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    ).length,
    // Open: Unresolved tickets that are assigned to staff (in-progress)
    pending: tickets.filter((t: any) => 
      (t.status === 'open' || t.status === 'in-progress') && 
      t.assigned_to && 
      t.assigned_to !== null &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    ).length,
    // Unassigned: Unresolved tickets with no assignment
    unassigned: tickets.filter((t: any) => 
      (!t.assigned_to || t.assigned_to === null) &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    ).length,
    snoozed: tickets.filter((t: any) => t.status === 'snoozed').length,
    resolved: tickets.filter((t: any) => t.status === 'resolved' || t.status === 'closed').length,
    escalated: tickets.filter((t: any) => t.has_escalation === 1).length,
    escalatedToMe: tickets.filter((t: any) => t.is_escalated_to_me === 1).length,
    // VIP: Exclude resolved/closed
    vip: tickets.filter((t: any) => 
      t.vip === 1 &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    ).length,
    // Staff member counts (includes open, in-progress, AND snoozed - excludes resolved/closed)
    sam: tickets.filter((t: any) => 
      (t.assigned_to === '00000000-0000-0000-0000-000000000003' || 
       (t.is_escalated_to_me === 1 && user?.id === '00000000-0000-0000-0000-000000000003')) &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    ).length,
    ted: tickets.filter((t: any) => 
      (t.assigned_to === '00000000-0000-0000-0000-000000000002' ||
       (t.is_escalated_to_me === 1 && user?.id === '00000000-0000-0000-0000-000000000002')) &&
      t.status !== 'resolved' &&
      t.status !== 'closed'
    ).length,
  }

  // Keyboard shortcut: Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setDesktopSidebarCollapsed(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-xl font-bold text-gray-900">CS Dashboard</h1>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => {
                            const isActive = location.pathname.startsWith(item.href)
                            return (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  className={clsx(
                                    isActive
                                      ? 'bg-gray-50 text-primary-600'
                                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                  )}
                                >
                                  <item.icon
                                    className={clsx(
                                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600',
                                      'h-6 w-6 shrink-0'
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col">
        <Sidebar 
          ticketCounts={ticketCounts} 
          isCollapsed={desktopSidebarCollapsed}
          onToggle={() => setDesktopSidebarCollapsed(!desktopSidebarCollapsed)}
        />
      </div>

      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">Dashboard</div>
      </div>

      <main className={`transition-all duration-300 ${desktopSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <Outlet />
      </main>
    </div>
  )
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}


