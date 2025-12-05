import { useQuery } from '@tanstack/react-query'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { ticketsApi, shopifyApi } from '../lib/api'
import { formatDistanceToNow } from 'date-fns'
import { User, Package, ShoppingBag, ChevronLeft, ChevronRight, Sparkles, Paperclip, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import StatusModal from '../components/StatusModal'
import ReassignModal from '../components/ReassignModal'
import EscalateModal from '../components/EscalateModal'
import SnoozeModal from '../components/SnoozeModal'
import ScheduleReplyModal from '../components/ScheduleReplyModal'
import EditScheduledMessageModal from '../components/EditScheduledMessageModal'
import { AIDraftResponsePanel } from '../components/AIDraftResponsePanel'
import { AIDraftFeedbackModal } from '../components/AIDraftFeedbackModal'

interface Attachment {
  name: string;
  content: string;
  type: string;
  size: number;
}

const statusColors = {
  open: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-gray-100 text-gray-800 border-gray-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
  snoozed: 'bg-purple-100 text-purple-800 border-purple-200',
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

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [showShopify, setShowShopify] = useState(false)
  const [staffResponse, setStaffResponse] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [showSnoozeModal, setShowSnoozeModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showEditScheduledModal, setShowEditScheduledModal] = useState(false)
  const [messageToEdit, setMessageToEdit] = useState<any>(null)
  const [showInternalNotes, setShowInternalNotes] = useState(false) // Hidden by default
  const [showResponseArea, setShowResponseArea] = useState(false) // Hidden by default
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [mergingTicketId, setMergingTicketId] = useState<string | null>(null)
  const [isMerging, setIsMerging] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackAction, setFeedbackAction] = useState<'approve' | 'edit'>('approve')
  const [internalNote, setInternalNote] = useState('')
  const [responseAreaHeight, setResponseAreaHeight] = useState(250)
  const [staffNotesHeight, setStaffNotesHeight] = useState(250)
  const [isResizingResponse, setIsResizingResponse] = useState(false)
  const [isResizingNotes, setIsResizingNotes] = useState(false)
  
  // Shopify integration state
  const [shopifyData, setShopifyData] = useState<{
    configured: boolean;
    customer: any | null;
    orders: any[];
    latestOrder: any | null;
    message: string | null;
  } | null>(null)
  const [shopifyLoading, setShopifyLoading] = useState(false)
  const [shopifyError, setShopifyError] = useState<string | null>(null)

  const { data: ticketData, isLoading, refetch } = useQuery({
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

  // Fetch scheduled messages for this ticket
  const { data: scheduledMessagesData, refetch: refetchScheduledMessages } = useQuery({
    queryKey: ['scheduledMessages', id],
    queryFn: async () => {
      const response = await ticketsApi.getScheduledMessages(id!)
      return response.data
    },
    enabled: !!id,
  })

  const { data: aiDraftData, isLoading: aiDraftLoading, refetch: refetchAIDraft } = useQuery({
    queryKey: ['aiDraft', id],
    queryFn: async () => {
      try {
        const response = await ticketsApi.getAIDraft(id!)
        return response.data
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null // No draft available
        }
        throw error
      }
    },
    enabled: !!id,
    retry: false,
  })

  const ticket = ticketData?.ticket
  const messages = ticketData?.messages || []
  const notes = ticketData?.notes || []
  const scheduledMessages = scheduledMessagesData?.scheduledMessages || []
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
      const prevTicket = allTickets[currentIndex - 1]
      const params = new URLSearchParams(searchParams)
      // Check if previous ticket is a chat ticket
      if (prevTicket.channel === 'chat') {
        navigate(`/chat-ticket/${prevTicket.ticket_id}?${params.toString()}`)
      } else {
        navigate(`/tickets/${prevTicket.ticket_id}?${params.toString()}`)
      }
    }
  }
  
  const handleNext = () => {
    if (hasNext) {
      const nextTicket = allTickets[currentIndex + 1]
      const params = new URLSearchParams(searchParams)
      // Check if next ticket is a chat ticket
      if (nextTicket.channel === 'chat') {
        navigate(`/chat-ticket/${nextTicket.ticket_id}?${params.toString()}`)
      } else {
        navigate(`/tickets/${nextTicket.ticket_id}?${params.toString()}`)
      }
    }
  }
  
  // If current ticket is a chat ticket, redirect to chat ticket detail page
  useEffect(() => {
    if (ticket && ticket.channel === 'chat') {
      const params = new URLSearchParams(searchParams)
      navigate(`/chat-ticket/${ticket.ticket_id}?${params.toString()}`, { replace: true })
    }
  }, [ticket, navigate, searchParams])

  // Fetch Shopify data when the Shopify panel is opened
  useEffect(() => {
    if (showShopify && ticket?.customer_email && !shopifyData) {
      setShopifyLoading(true)
      setShopifyError(null)
      
      shopifyApi.getTicketData(ticket.customer_email)
        .then(response => {
          setShopifyData(response.data)
        })
        .catch(error => {
          console.error('Failed to fetch Shopify data:', error)
          setShopifyError(error.response?.data?.error || 'Failed to load Shopify data')
        })
        .finally(() => {
          setShopifyLoading(false)
        })
    }
  }, [showShopify, ticket?.customer_email, shopifyData])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setAttachments(prev => [...prev, {
          name: file.name,
          content,
          type: file.type,
          size: file.size
        }])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSendReply = async () => {
    if ((!staffResponse.trim() && attachments.length === 0) || !ticket) return
    
    setIsSending(true)
    try {
      console.log('Sending reply to ticket:', ticket.ticket_id, 'with', attachments.length, 'attachments')
      const response = await ticketsApi.reply(ticket.ticket_id, staffResponse, attachments)
      console.log('Reply sent successfully:', response)
      setStaffResponse('')
      setAttachments([])
      // Refresh ticket data to show new message
      refetch()
    } catch (error: any) {
      console.error('Failed to send reply:', error)
      console.error('Error details:', error.response?.data || error.message)
      alert(`Failed to send reply: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteTicket = async () => {
    if (!ticket) return
    
    try {
      await ticketsApi.delete(ticket.ticket_id)
      console.log('Ticket deleted successfully')
      setShowDeleteConfirm(false)
      // Navigate back to tickets list
      navigate('/tickets')
    } catch (error: any) {
      console.error('Failed to delete ticket:', error)
      alert(`Failed to delete ticket: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleAddNote = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || !internalNote.trim() || !ticket) return
    e.preventDefault()
    
    try {
      console.log('Adding note to ticket:', ticket.ticket_id)
      await ticketsApi.addNote(ticket.ticket_id, internalNote)
      setInternalNote('')
      refetch() // Refetch data without reloading page
    } catch (error: any) {
      console.error('Failed to add note:', error)
      alert(`Failed to add note: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return
    await ticketsApi.updateStatus(ticket.ticket_id, newStatus)
    refetch()
  }

  const handleReassign = async (staffId: string | null, _staffName: string) => {
    if (!ticket) return
    try {
      await ticketsApi.assign(ticket.ticket_id, staffId || '')
      setShowReassignModal(false)
      refetch()
    } catch (error: any) {
      console.error('Failed to reassign ticket:', error)
      alert(`Failed to reassign ticket: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleEscalate = async (level: string, staffIds: string[], reason: string) => {
    if (!ticket) return
    console.log('Escalating ticket:', { level, staffIds, reason })
    try {
      // Escalate ticket - creates escalation records, @mentions, and staff note
      await ticketsApi.escalate(ticket.ticket_id, staffIds, reason)
      console.log('Ticket escalated successfully')
      setShowEscalateModal(false)
      refetch()
    } catch (error: any) {
      console.error('Failed to escalate ticket:', error)
      alert(`Failed to escalate ticket: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleSnooze = async (duration: string, customDate?: string) => {
    if (!ticket) return
    console.log('Snoozing ticket:', { duration, customDate })
    
    let snoozeUntil: Date
    const now = new Date()
    
    // Calculate snooze time based on duration
    switch (duration) {
      case '30m':
        snoozeUntil = new Date(now.getTime() + 30 * 60 * 1000)
        break
      case '3h':
        snoozeUntil = new Date(now.getTime() + 3 * 60 * 60 * 1000)
        break
      case '1d':
        snoozeUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        snoozeUntil.setHours(9, 0, 0, 0)
        break
      case 'friday':
        snoozeUntil = new Date(now)
        const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7
        snoozeUntil.setDate(now.getDate() + daysUntilFriday)
        snoozeUntil.setHours(9, 0, 0, 0)
        break
      case '1w':
        snoozeUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        snoozeUntil.setHours(9, 0, 0, 0)
        break
      case 'custom':
        if (!customDate) return
        snoozeUntil = new Date(customDate)
        break
      default:
        return
    }
    
    try {
      await ticketsApi.snooze(ticket.ticket_id, snoozeUntil.toISOString(), `Snoozed until ${snoozeUntil.toLocaleString()}`)
      console.log('Ticket snoozed successfully')
      setShowSnoozeModal(false)
      refetch()
    } catch (error: any) {
      console.error('Failed to snooze ticket:', error)
      alert(`Failed to snooze ticket: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleRemoveSnooze = async () => {
    if (!ticket) return
    
    try {
      await ticketsApi.unsnooze(ticket.ticket_id)
      console.log('Snooze removed successfully')
      setShowSnoozeModal(false)
      refetch()
    } catch (error: any) {
      console.error('Failed to remove snooze:', error)
      alert(`Failed to remove snooze: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  // Get tickets from the same customer email for merge functionality
  const sameCustomerTickets = (allTicketsData?.tickets || []).filter((t: any) => 
    t.customer_email === ticket?.customer_email && 
    t.ticket_id !== ticket?.ticket_id &&
    (t.status === 'open' || t.status === 'in-progress' || t.status === 'snoozed')
  )

  const handleMergeTicket = async () => {
    if (!ticket || !mergingTicketId) return
    
    setIsMerging(true)
    try {
      // Current ticket is primary, selected ticket gets merged into it
      await ticketsApi.merge(ticket.ticket_id, [mergingTicketId])
      console.log('Tickets merged successfully')
      setShowMergeModal(false)
      setMergingTicketId(null)
      refetch()
    } catch (error: any) {
      console.error('Failed to merge tickets:', error)
      alert(`Failed to merge tickets: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    } finally {
      setIsMerging(false)
    }
  }

  const handleResolveAndClose = async () => {
    if (!ticket) return
    if (confirm('Mark this ticket as resolved and close it?')) {
      try {
        await ticketsApi.updateStatus(ticket.ticket_id, 'resolved')
        navigate('/tickets')
      } catch (error: any) {
        console.error('Failed to resolve ticket:', error)
        alert(`Failed to resolve ticket: ${error.response?.data?.error || error.message || 'Unknown error'}`)
      }
    }
  }

  const handleScheduleReply = () => {
    if (!staffResponse.trim() || !ticket) {
      alert('Please write a response first')
      return
    }
    setShowScheduleModal(true)
  }

  const handleScheduleConfirm = async (scheduledDate: string, scheduledTime: string) => {
    if (!ticket) return

    try {
      // Parse as local browser time - JavaScript will convert to UTC automatically
      const dateTimeString = `${scheduledDate}T${scheduledTime}:00`
      const localDate = new Date(dateTimeString)
      const scheduledForUTC = localDate.toISOString()
      
      console.log('Scheduling reply:', { 
        input: dateTimeString,
        localDate: localDate.toString(),
        utcDate: scheduledForUTC,
        serverNow: new Date().toISOString()
      })
      
      // Call API to schedule the reply
      await ticketsApi.scheduleReply(ticket.ticket_id, staffResponse, scheduledForUTC)
      
      setStaffResponse('')
      setShowScheduleModal(false)
      refetch()
      refetchScheduledMessages()
    } catch (error: any) {
      console.error('Failed to schedule reply:', error)
      alert(`Failed to schedule reply: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleEditScheduledMessage = (msg: any) => {
    setMessageToEdit(msg)
    setShowEditScheduledModal(true)
  }

  const handleRemoveScheduledMessage = async () => {
    if (!messageToEdit) return
    
    try {
      await ticketsApi.deleteScheduledMessage(messageToEdit.id)
      console.log('[handleRemoveScheduledMessage] Deleted successfully')
      setShowEditScheduledModal(false)
      setMessageToEdit(null)
      refetch()
    } catch (error: any) {
      console.error('[handleRemoveScheduledMessage] Error:', error)
      alert(`Failed to remove scheduled message: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleApproveAIDraft = async () => {
    if (!id) return
    try {
      await ticketsApi.approveAIDraft(id)
      refetch()
      refetchAIDraft()
      // Show feedback modal after successful approval
      setFeedbackAction('approve')
      setShowFeedbackModal(true)
    } catch (error: any) {
      console.error('Failed to approve AI draft:', error)
      alert(`Failed to approve AI draft: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleEditAIDraft = async (editedContent: string) => {
    if (!id) return
    try {
      await ticketsApi.editAIDraft(id, editedContent)
      refetch()
      refetchAIDraft()
      // Show feedback modal after successful edit
      setFeedbackAction('edit')
      setShowFeedbackModal(true)
    } catch (error: any) {
      console.error('Failed to edit AI draft:', error)
      alert(`Failed to edit AI draft: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleRejectAIDraft = async (reason: string) => {
    if (!id) return
    try {
      await ticketsApi.rejectAIDraft(id, reason)
      refetchAIDraft()
      // Note: No feedback modal for reject - the reason is already captured
    } catch (error: any) {
      console.error('Failed to reject AI draft:', error)
      alert(`Failed to reject AI draft: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleSubmitFeedback = async (feedback: {
    qualityScore: number
    wasHelpful: boolean
    improvementNotes: string
  }) => {
    if (!id) return
    try {
      await ticketsApi.submitAIDraftFeedback(id, {
        ...feedback,
        action: feedbackAction
      })
      console.log('Feedback submitted successfully')
    } catch (error: any) {
      console.error('Failed to submit feedback:', error)
      // Don't show error to user - feedback is optional
    }
  }

  const handleEditScheduledMessageConfirm = async (newContent: string, scheduledDate: string, scheduledTime: string) => {
    console.log('[handleEditScheduledMessageConfirm] Called with:', { newContent, scheduledDate, scheduledTime, messageToEdit })
    
    if (!messageToEdit) {
      console.error('[handleEditScheduledMessageConfirm] No message to edit!')
      return
    }
    
    try {
      // Parse as local browser time - JavaScript will convert to UTC automatically
      const dateTimeString = `${scheduledDate}T${scheduledTime}:00`
      const localDate = new Date(dateTimeString)
      const scheduledForUTC = localDate.toISOString()
      
      console.log('[handleEditScheduledMessageConfirm] Updating:', { 
        messageId: messageToEdit.id,
        input: dateTimeString,
        localDate: localDate.toString(),
        utcDate: scheduledForUTC,
        serverNow: new Date().toISOString()
      })
      
      const response = await ticketsApi.updateScheduledMessage(messageToEdit.id, newContent, scheduledForUTC)
      console.log('[handleEditScheduledMessageConfirm] Response:', response)
      
      setShowEditScheduledModal(false)
      setMessageToEdit(null)
      refetch()
      refetchScheduledMessages()
    } catch (error: any) {
      console.error('[handleEditScheduledMessageConfirm] Error:', error)
      alert(`Failed to update message: ${error.response?.data?.error || error.message || 'Unknown error'}`)
    }
  }

  const handleQuickAction = (action: string) => {
    if (!ticket) return
    
    let template = ''
    switch (action) {
      case 'order-status':
        template = `Hi ${ticket.customer_name || 'there'},\n\nI'm checking on your order status now. Let me look that up for you.\n\nOrder #: [ORDER_NUMBER]\nStatus: [STATUS]\nExpected delivery: [DATE]\n\nIs there anything else I can help you with?\n\nBest regards,\nJohn`
        break
      case 'tracking':
        template = `Hi ${ticket.customer_name || 'there'},\n\nHere's your tracking information:\n\nTracking #: [TRACKING_NUMBER]\nCarrier: [CARRIER]\nCurrent status: [STATUS]\nExpected delivery: [DATE]\n\nYou can track your package at: [TRACKING_URL]\n\nBest regards,\nJohn`
        break
      case 'vip-wallet':
        template = `Hi ${ticket.customer_name || 'there'},\n\nThank you for being a valued VIP customer! Let me check your VIP wallet balance.\n\nCurrent balance: $[AMOUNT]\nVIP tier: [TIER]\nRewards available: [REWARDS]\n\nIs there anything else I can assist you with?\n\nBest regards,\nJohn`
        break
      case 'artwork':
        template = `Hi ${ticket.customer_name || 'there'},\n\nI've reviewed your artwork file. Here's what I found:\n\n✓ Resolution: [DPI]\n✓ Color mode: [COLOR_MODE]\n✓ File format: [FORMAT]\n\nRecommendations:\n[RECOMMENDATIONS]\n\nBest regards,\nJohn`
        break
      case 'quote':
        template = `Hi ${ticket.customer_name || 'there'},\n\nThank you for your quote request. Here are the details:\n\nProduct: [PRODUCT]\nQuantity: [QUANTITY]\nPrice per unit: $[PRICE]\nTotal: $[TOTAL]\n\nThis quote is valid for 30 days. Would you like to proceed with the order?\n\nBest regards,\nJohn`
        break
      default:
        return
    }
    
    setStaffResponse(template)
  }

  // Keyboard shortcuts: Ctrl+Y for Internal Notes, Ctrl+R for Response Area
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Y (Cmd+Y on Mac) to toggle Internal Notes
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        setShowInternalNotes(prev => {
          if (!prev) setShowResponseArea(false) // Close Response Area when opening Notes
          return !prev
        })
      }
      // Ctrl+R (Cmd+R on Mac) to toggle Response Area
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault()
        setShowResponseArea(prev => {
          if (!prev) setShowInternalNotes(false) // Close Notes when opening Response Area
          return !prev
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Resize handle logic for Response Area
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingResponse) return
      
      const newHeight = responseAreaHeight + (window.innerHeight - e.clientY - responseAreaHeight)
      const minHeight = 150
      const maxHeight = window.innerHeight * 0.6
      
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setResponseAreaHeight(newHeight)
      }
    }

    const handleMouseUp = () => {
      setIsResizingResponse(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    if (isResizingResponse) {
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingResponse, responseAreaHeight])

  // Resize handle logic for Staff Notes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingNotes) return
      
      const newHeight = staffNotesHeight + (window.innerHeight - e.clientY - staffNotesHeight)
      const minHeight = 150
      const maxHeight = window.innerHeight * 0.6
      
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setStaffNotesHeight(newHeight)
      }
    }

    const handleMouseUp = () => {
      setIsResizingNotes(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    if (isResizingNotes) {
      document.body.style.cursor = 'ns-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingNotes, staffNotesHeight])

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
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
          {/* Top Row: Back button, Ticket number, and badges */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Link to="/tickets" className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h1 className="text-base font-semibold text-gray-900">{ticket.ticket_number}</h1>
              </div>
              {ticket.vip === 1 && (
                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs border border-yellow-200 font-medium">
                  ⭐ VIP
                </span>
              )}
              <button
                onClick={() => setShowStatusModal(true)}
                className={`px-1.5 py-0.5 rounded-lg text-xs border font-medium hover:opacity-80 ${statusColors[ticket.status as keyof typeof statusColors] || statusColors.open}`}
              >
                {ticket.status}
              </button>
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${priorityColors[ticket.priority as keyof typeof priorityColors] || priorityColors.normal}`}>
                {ticket.priority}
              </span>
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${sentimentColors[ticket.sentiment as keyof typeof sentimentColors] || sentimentColors.neutral}`}>
                {sentimentIcons[ticket.sentiment as keyof typeof sentimentIcons] || '😐'} {ticket.sentiment || 'neutral'}
              </span>
            </div>
            <button className="text-xs px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              {ticket.assigned_to ? staffNames[ticket.assigned_to] || ticket.assigned_to : 'Unassigned'}
            </button>
          </div>

          {/* Middle Row: Customer name and date/time */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900">{ticket.customer_name || ticket.customer_email}</span>
              <span className="text-xs text-gray-500">
                {new Date(ticket.created_at).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
          </div>

          {/* Bottom Row: Subject and action buttons */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 flex-1 truncate mr-4">
              <span className="font-medium">Subject:</span> {ticket.subject}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button 
                onClick={() => setShowReassignModal(true)}
                className="text-xs px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reassign</span>
              </button>
              <button 
                onClick={() => setShowEscalateModal(true)}
                className="text-xs px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Escalate</span>
              </button>
              <button 
                onClick={() => setShowSnoozeModal(true)}
                className="text-xs px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Snooze</span>
              </button>
              <button 
                onClick={() => setShowMergeModal(true)}
                className="text-xs px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                title={sameCustomerTickets.length === 0 ? 'No other tickets from this customer' : `${sameCustomerTickets.length} other ticket(s) from this customer`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Merge</span>
                {sameCustomerTickets.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 px-1 rounded text-xs">{sameCustomerTickets.length}</span>
                )}
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs px-2 py-1 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              )}
            </div>
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
            {/* Merge Banner - shows if ticket has merged tickets */}
            {ticket.merged_from && (
              <div className="h-7 text-xs px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-1.5 text-indigo-900">
                <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>
                  <strong>Merged:</strong> {ticket.ticket_number} and {ticket.merged_from}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Scheduled Messages Indicator */}
            {scheduledMessages.length > 0 && (
              <div
                className="h-7 text-xs px-2 py-1 bg-yellow-100 border border-yellow-300 rounded-lg flex items-center gap-1.5 font-medium text-yellow-900"
                title={`${scheduledMessages.length} scheduled message${scheduledMessages.length > 1 ? 's' : ''}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{scheduledMessages.length} Scheduled</span>
              </div>
            )}
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

        {/* Messages Container - Scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
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

          {/* Messages - Threaded style like Chat Dashboard */}
          <div className="p-4 space-y-4 bg-gray-50">
            {/* Initial Message */}
            <div className="p-4 rounded-lg bg-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-300">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium text-sm text-gray-900">{ticket.customer_name}</span>
                <span className="text-xs text-gray-400">
                  {ticket.created_at && typeof ticket.created_at === 'string' 
                    ? formatDistanceToNow(new Date(ticket.created_at.includes('Z') ? ticket.created_at : ticket.created_at + 'Z'), { addSuffix: true }) 
                    : ''}
                </span>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap ml-8">{ticket.description}</div>
            </div>

            {/* Additional Messages */}
            {messages.map((msg: any) => {
              const isCustomer = msg.sender_type === 'customer';
              const isAI = msg.sender_id === 'ai-agent-001';
              const wasScheduled = msg.was_scheduled === true || msg.was_scheduled === 1;
              
              return (
                <div key={msg.id} className={`p-4 rounded-lg ${
                  isCustomer ? 'bg-gray-100' : isAI ? 'bg-purple-50' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCustomer ? 'bg-gray-300' : isAI ? 'bg-purple-200' : 'bg-blue-200'
                    }`}>
                      {isCustomer ? (
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : isAI ? (
                        <Sparkles className="w-3 h-3 text-purple-600" />
                      ) : (
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-sm text-gray-900">
                      {isCustomer 
                        ? (msg.sender_name || 'Customer')
                        : isAI ? 'McCarthy AI' : (msg.sender_name ? msg.sender_name.split(' ')[0] : 'Staff')
                      }
                    </span>
                    <span className="text-xs text-gray-400">
                      {msg.created_at && typeof msg.created_at === 'string'
                        ? formatDistanceToNow(new Date(msg.created_at.includes('Z') ? msg.created_at : msg.created_at + 'Z'), { addSuffix: true })
                        : ''}
                    </span>
                    {wasScheduled && !isCustomer && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded" title="This message was scheduled">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Scheduled
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap ml-8">{msg.content}</div>
                </div>
              );
            })}

            {/* Scheduled Messages - Show AFTER all sent messages */}
            {scheduledMessages.map((msg: any) => (
              <div key={msg.id} className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-yellow-200">
                    <svg className="w-3 h-3 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-sm text-gray-900">{msg.first_name}</span>
                  <button
                    onClick={() => handleEditScheduledMessage(msg)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-medium rounded hover:bg-yellow-200 transition-colors"
                    title="Click to edit message and scheduled time"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Scheduled: {new Date(msg.scheduled_for).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </button>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap ml-8">{msg.content}</div>
              </div>
            ))}

            {/* AI Draft Response Panel - Show AFTER all messages */}
            {aiDraftData?.draft ? (
              <div className="mt-4">
                <AIDraftResponsePanel
                  ticketId={id!}
                  draft={aiDraftData.draft}
                  loading={aiDraftLoading}
                  onApprove={handleApproveAIDraft}
                  onEdit={handleEditAIDraft}
                  onReject={handleRejectAIDraft}
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Fixed Bottom Section - Response Area & Staff Notes */}
        <div className="flex-shrink-0">
          {/* Response Area */}
          <div className="border-t border-gray-200 bg-white">
            {/* Resize Handle for Response Area */}
            {showResponseArea && (
              <div 
                className="h-1 bg-gray-200 hover:bg-purple-400 cursor-ns-resize transition-colors flex-shrink-0 relative group"
                onMouseDown={() => setIsResizingResponse(true)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-1 bg-gray-400 rounded-full group-hover:bg-purple-500 transition-colors"></div>
                </div>
              </div>
            )}
            {/* Header Bar */}
            <div 
              className="px-4 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 flex items-center gap-2 cursor-pointer hover:from-purple-100 hover:to-purple-150 transition-colors"
              onClick={() => {
                setShowResponseArea(prev => {
                  if (!prev) setShowInternalNotes(false) // Close Notes when opening Response
                  return !prev
                })
              }}
            >
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-800">💬 Response Area</h3>
              <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-300">Ctrl+R</span>
            </div>
            
            {showResponseArea && (
              <div className="p-4 flex flex-col" style={{ height: `${responseAreaHeight}px` }}>
                {/* Attachment Preview */}
                {attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-lg text-xs">
                        <Paperclip className="w-3 h-3 text-gray-500" />
                        <span className="max-w-[150px] truncate">{att.name}</span>
                        <button 
                          onClick={() => removeAttachment(idx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex-1 mb-2 min-h-0">
                  <textarea
                    value={staffResponse}
                    onChange={(e) => setStaffResponse(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full h-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none min-h-0"
                  />
                </div>
                <div className="space-y-3 flex-shrink-0">
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                  />
                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Paperclip className="w-3 h-3" />
                      Attach File
                    </button>
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      📋 All Templates
                    </button>
                    <button 
                      onClick={() => handleQuickAction('order-status')}
                      className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      🔔 @order-status
                    </button>
                    <button 
                      onClick={() => handleQuickAction('tracking')}
                      className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      🚚 @tracking
                    </button>
                    <button 
                      onClick={() => handleQuickAction('vip-wallet')}
                      className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      💰 @vip-wallet
                    </button>
                    <button 
                      onClick={() => handleQuickAction('artwork')}
                      className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      🎨 @artwork
                    </button>
                    <button 
                      onClick={() => handleQuickAction('quote')}
                      className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      📊 @quote
                    </button>
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      📦 Products
                    </button>
                    <button className="text-xs px-2.5 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      🧾 Generate Invoice
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-x-2">
                    <button 
                      onClick={handleSendReply}
                      disabled={(!staffResponse.trim() && attachments.length === 0) || isSending}
                      className="px-4 py-2 text-sm bg-purple-200 text-purple-800 border border-purple-300 rounded-lg hover:bg-purple-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {isSending ? 'Sending...' : `Send Reply${attachments.length > 0 ? ` (${attachments.length})` : ''}`}
                    </button>
                    <button 
                      onClick={handleScheduleReply}
                      className="px-4 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule Reply
                    </button>
                    <button 
                      onClick={handleResolveAndClose}
                      className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium flex items-center gap-2"
                    >
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
          <div className="border-t border-gray-200 bg-white flex-shrink-0">
            {/* Resize Handle for Staff Notes */}
            {showInternalNotes && (
              <div 
                className="h-1 bg-gray-200 hover:bg-yellow-400 cursor-ns-resize transition-colors flex-shrink-0 relative group"
                onMouseDown={() => setIsResizingNotes(true)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-1 bg-gray-400 rounded-full group-hover:bg-yellow-500 transition-colors"></div>
                </div>
              </div>
            )}
            
            {/* Header Bar */}
            <div 
              className="px-4 py-2.5 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200 flex items-center gap-2 cursor-pointer hover:from-yellow-100 hover:to-yellow-150 transition-colors"
              onClick={() => {
                setShowInternalNotes(prev => {
                  if (!prev) setShowResponseArea(false) // Close Response when opening Notes
                  return !prev
                })
              }}
            >
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-800">📝 Staff Notes (Internal Only)</h3>
              <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-300">Ctrl+Y</span>
            </div>
              
              {showInternalNotes && (
                <div className="flex flex-col bg-yellow-50" style={{ height: `${staffNotesHeight}px` }}>
                  {/* Existing Notes - Scrollable */}
                  {notes && notes.length > 0 && (
                    <div className="p-4 space-y-2 overflow-y-auto flex-shrink-0" style={{ maxHeight: '60%' }}>
                      {notes.map((note: any) => (
                        <div key={note.id} className="bg-yellow-100 rounded-lg p-3 border border-yellow-200">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-800">{note.first_name || 'Staff'}</span>
                              <span className="text-xs text-gray-500">
                                {note.created_at && typeof note.created_at === 'string'
                                  ? formatDistanceToNow(new Date(note.created_at.includes('Z') ? note.created_at : note.created_at + 'Z'), { addSuffix: true })
                                  : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Show Resolve button or resolved timestamp for escalation notes */}
                              {note.note_type === 'escalation' && note.escalated_to === user?.id && (
                                note.escalation_status === 'pending' ? (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (!ticket || !note.escalation_id) return
                                      try {
                                        await ticketsApi.resolveEscalation(ticket.ticket_id, note.escalation_id)
                                        refetch() // Refetch data without reloading page
                                      } catch (error: any) {
                                        console.error('Failed to resolve escalation:', error)
                                        alert(`Failed to resolve escalation: ${error.response?.data?.error || error.message || 'Unknown error'}`)
                                      }
                                    }}
                                    className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    Resolve
                                  </button>
                                ) : note.escalation_status === 'resolved' && note.resolved_at ? (
                                  <span className="text-xs text-green-600 font-medium">
                                    Resolved: {new Date(note.resolved_at).toLocaleString('en-GB', { 
                                      day: '2-digit', 
                                      month: '2-digit', 
                                      year: 'numeric', 
                                      hour: '2-digit', 
                                      minute: '2-digit', 
                                      second: '2-digit',
                                      hour12: true 
                                    })}
                                  </span>
                                ) : null
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {(() => {
                              let content = note.content || '';
                              // Handle MERGE_TIMESTAMP
                              if (content.includes('MERGE_TIMESTAMP:')) {
                                content = content.replace(/MERGE_TIMESTAMP:([^\n]+)\n?/g, (_: string, timestamp: string) => {
                                  try {
                                    const date = new Date(timestamp.trim());
                                    return date.toLocaleString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric', 
                                      year: 'numeric', 
                                      hour: 'numeric', 
                                      minute: '2-digit', 
                                      hour12: true 
                                    }) + '\n';
                                  } catch {
                                    return '';
                                  }
                                });
                              }
                              // Handle SCHEDULE_TIME
                              if (content.includes('SCHEDULE_TIME:')) {
                                content = content.replace(/SCHEDULE_TIME:([^\s]+)/g, (_: string, timestamp: string) => {
                                  try {
                                    const date = new Date(timestamp.trim());
                                    return date.toLocaleString('en-US', { 
                                      month: 'numeric', 
                                      day: 'numeric', 
                                      year: 'numeric', 
                                      hour: 'numeric', 
                                      minute: '2-digit', 
                                      hour12: true 
                                    });
                                  } catch {
                                    return timestamp;
                                  }
                                });
                              }
                              // Handle SNOOZE_TIME - capture full ISO timestamp (e.g., 2025-12-03T02:04:20.494Z)
                              if (content.includes('SNOOZE_TIME:')) {
                                content = content.replace(/SNOOZE_TIME:(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)/g, (_: string, timestamp: string) => {
                                  try {
                                    const date = new Date(timestamp.trim());
                                    return date.toLocaleString('en-AU', { 
                                      day: 'numeric',
                                      month: 'short', 
                                      year: 'numeric', 
                                      hour: 'numeric', 
                                      minute: '2-digit', 
                                      hour12: true 
                                    });
                                  } catch {
                                    return timestamp;
                                  }
                                });
                              }
                              // Handle BULK_REASSIGN_TIME - capture full ISO timestamp
                              if (content.includes('BULK_REASSIGN_TIME:')) {
                                content = content.replace(/BULK_REASSIGN_TIME:(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)/g, (_: string, timestamp: string) => {
                                  try {
                                    const date = new Date(timestamp.trim());
                                    return date.toLocaleString('en-AU', { 
                                      day: 'numeric',
                                      month: 'short', 
                                      year: 'numeric', 
                                      hour: 'numeric', 
                                      minute: '2-digit', 
                                      hour12: true 
                                    });
                                  } catch {
                                    return timestamp;
                                  }
                                });
                              }
                              return content;
                            })()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Note Input - Fixed at bottom */}
                  <div className="p-4 flex-1 flex flex-col min-h-0 border-t border-yellow-200">
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    onKeyDown={handleAddNote}
                    placeholder="Add internal notes for other staff members... (Press Enter to save)"
                    className="w-full flex-1 border border-yellow-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500 resize-none bg-white min-h-0"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 self-start flex-shrink-0 flex items-center gap-1"
                  >
                    <Paperclip className="w-3 h-3" />
                    Attach File
                  </button>
                  </div>
                </div>
              )}
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

            {/* Loading State */}
            {shopifyLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            )}

            {/* Error State */}
            {shopifyError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-600">{shopifyError}</p>
                <button 
                  onClick={() => {
                    setShopifyData(null)
                    setShopifyError(null)
                  }}
                  className="text-xs text-red-700 underline mt-2"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Not Configured State */}
            {shopifyData && !shopifyData.configured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-700">{shopifyData.message}</p>
              </div>
            )}

            {/* Customer Not Found */}
            {shopifyData && shopifyData.configured && !shopifyData.customer && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">{shopifyData.message || 'Customer not found in Shopify'}</p>
              </div>
            )}

            {/* Customer Data */}
            {shopifyData && shopifyData.customer && (
              <>
                {/* Customer Section */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">CUSTOMER</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {shopifyData.customer.firstName} {shopifyData.customer.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{shopifyData.customer.email}</p>
                      {shopifyData.customer.phone && (
                        <p className="text-xs text-gray-500">{shopifyData.customer.phone}</p>
                      )}
                      {shopifyData.customer.isVIP && (
                        <span className="inline-flex items-center mt-1 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">
                          ⭐ VIP Customer
                        </span>
                      )}
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Total Spent:</span>
                        <span className="font-semibold text-indigo-600">
                          ${shopifyData.customer.totalSpent?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Total Orders:</span>
                        <span className="font-semibold text-gray-900">{shopifyData.customer.ordersCount || 0}</span>
                      </div>
                      {shopifyData.customer.lastOrderDate && (
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-500">Last Order:</span>
                          <span className="text-gray-900">
                            {new Date(shopifyData.customer.lastOrderDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Latest Order Section */}
                {shopifyData.latestOrder ? (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">LATEST ORDER</h3>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Order {shopifyData.latestOrder.orderNumber}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            shopifyData.latestOrder.fulfillmentStatus === 'fulfilled' 
                              ? 'bg-green-100 text-green-800'
                              : shopifyData.latestOrder.fulfillmentStatus === 'partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {shopifyData.latestOrder.fulfillmentStatus || 'Unfulfilled'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Total: <span className="font-semibold text-gray-900">
                              ${shopifyData.latestOrder.totalPrice?.toFixed(2)} {shopifyData.latestOrder.currency}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-200 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Created:</span>
                          <span className="text-gray-900">
                            {new Date(shopifyData.latestOrder.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Payment:</span>
                          <span className={`font-medium ${
                            shopifyData.latestOrder.financialStatus === 'paid' 
                              ? 'text-green-600' 
                              : 'text-yellow-600'
                          }`}>
                            {shopifyData.latestOrder.financialStatus || 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Line Items */}
                      {shopifyData.latestOrder.lineItems && shopifyData.latestOrder.lineItems.length > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">Items:</p>
                          <div className="space-y-1">
                            {shopifyData.latestOrder.lineItems.slice(0, 3).map((item: any, idx: number) => (
                              <div key={idx} className="text-xs flex justify-between">
                                <span className="text-gray-700 truncate max-w-[180px]">{item.title}</span>
                                <span className="text-gray-500">x{item.quantity}</span>
                              </div>
                            ))}
                            {shopifyData.latestOrder.lineItems.length > 3 && (
                              <p className="text-xs text-gray-400">
                                +{shopifyData.latestOrder.lineItems.length - 3} more items
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">ORDERS</h3>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-500">No orders found</p>
                    </div>
                  </div>
                )}

                {/* Fulfillment & Tracking Section */}
                {shopifyData.latestOrder?.trackingNumber && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">FULFILLMENT & TRACKING</h3>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tracking:</p>
                        <p className="text-sm font-mono font-semibold text-gray-900">
                          {shopifyData.latestOrder.trackingNumber}
                        </p>
                        {shopifyData.latestOrder.trackingCompany && (
                          <p className="text-xs text-gray-500 mt-1">
                            Carrier: <span className="text-gray-900">{shopifyData.latestOrder.trackingCompany}</span>
                          </p>
                        )}
                      </div>
                      {shopifyData.latestOrder.trackingUrl && (
                        <a 
                          href={shopifyData.latestOrder.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          Track Package →
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Order History (if multiple orders) */}
                {shopifyData.orders && shopifyData.orders.length > 1 && (
                  <div className="mt-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                      ORDER HISTORY ({shopifyData.orders.length})
                    </h3>
                    <div className="space-y-2">
                      {shopifyData.orders.slice(1, 4).map((order: any) => (
                        <div key={order.id} className="bg-gray-50 rounded-lg p-2 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{order.orderNumber}</span>
                            <span className="text-gray-500">${order.totalPrice?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`${
                              order.fulfillmentStatus === 'fulfilled' ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {order.fulfillmentStatus || 'Unfulfilled'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Fallback when no data is loaded yet */}
            {!shopifyLoading && !shopifyError && !shopifyData && (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading Shopify data...</p>
              </div>
            )}
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

      <ReassignModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        onReassign={handleReassign}
        currentAssignment={ticket.assigned_to ? staffNames[ticket.assigned_to] : undefined}
      />

      <EscalateModal
        isOpen={showEscalateModal}
        onClose={() => setShowEscalateModal(false)}
        onConfirm={handleEscalate}
        ticketNumber={ticket.ticket_number}
      />

      <SnoozeModal
        isOpen={showSnoozeModal}
        onClose={() => setShowSnoozeModal(false)}
        onConfirm={handleSnooze}
        onRemoveSnooze={handleRemoveSnooze}
        ticketNumber={ticket.ticket_number}
        isSnoozed={ticket.status === 'snoozed'}
      />

      <ScheduleReplyModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onConfirm={handleScheduleConfirm}
      />

      <EditScheduledMessageModal
        isOpen={showEditScheduledModal}
        onClose={() => {
          setShowEditScheduledModal(false)
          setMessageToEdit(null)
        }}
        onConfirm={handleEditScheduledMessageConfirm}
        onRemove={handleRemoveScheduledMessage}
        message={messageToEdit}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Ticket</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete ticket <span className="font-medium">{ticket.ticket_number}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTicket}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Draft Feedback Modal */}
      <AIDraftFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleSubmitFeedback}
      />

      {/* Merge Tickets Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Merge Tickets</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a ticket to merge into <span className="font-medium">{ticket.ticket_number}</span> (primary).
              <br />
              <span className="text-xs text-gray-500">Only showing tickets from: {ticket.customer_email}</span>
            </p>
            
            {sameCustomerTickets.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">No other open tickets from this customer</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {sameCustomerTickets.map((t: any) => (
                  <label
                    key={t.ticket_id}
                    className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                      mergingTicketId === t.ticket_id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mergeTicket"
                      value={t.ticket_id}
                      checked={mergingTicketId === t.ticket_id}
                      onChange={() => setMergingTicketId(t.ticket_id)}
                      className="mt-1 mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">{t.ticket_number}</span>
                        <span className={`px-1.5 py-0.5 text-xs rounded ${
                          t.status === 'snoozed' ? 'bg-purple-100 text-purple-700' :
                          t.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{t.subject}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => {
                  setShowMergeModal(false)
                  setMergingTicketId(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMergeTicket}
                disabled={!mergingTicketId || isMerging}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isMerging ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Merging...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Merge into {ticket.ticket_number}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
