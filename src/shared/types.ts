// ===== Ticket Status =====
export type TicketStatus =
  | 'new'
  | 'open'
  | 'pending'
  | 'solved'
  | 'closed'

// ===== Ticket Priority =====
export type TicketPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'

// ===== Ticket Category =====
export type TicketCategory =
  | 'hardware'
  | 'software'
  | 'network'
  | 'other'

// ===== Main Ticket Interface =====
export interface Ticket {
  id: string                    // INC-101
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  creator: string
  assignee?: string
  createdAt: string             // ISO string
  updatedAt: string             // ISO string
  deadline: string              // ISO string (SLA)
}

// ===== Comments =====
export interface Comment {
  id: string
  ticketId: string
  author: string
  text: string
  createdAt: string
}

// ===== Audit Log =====
export interface AuditEvent {
  id: string
  ticketId: string
  action: string
  user: string
  timestamp: string
}