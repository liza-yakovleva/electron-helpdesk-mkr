import { Ticket } from './types';

export const mockTickets: Ticket[] = [
  {
    id: 'INC-101',
    title: 'Cannot access email',
    description: 'User reports they cannot login to their Outlook account.',
    status: 'new',
    priority: 'high',
    category: 'software',
    creator: 'John Doe',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    deadline: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now (Urgent)
  },
  {
    id: 'INC-102',
    title: 'Laptop screen flickering',
    description: 'The internal display flicker when moving the lid.',
    status: 'open',
    priority: 'medium',
    category: 'hardware',
    creator: 'Alice Smith',
    assignee: 'Liza',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    deadline: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago (Overdue)
  },
  {
    id: 'INC-103',
    title: 'VPN connection issues',
    description: 'Getting 806 error when connecting to corporate VPN.',
    status: 'pending',
    priority: 'high',
    category: 'network',
    creator: 'Bob Wilson',
    assignee: 'Liza',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    deadline: new Date(Date.now() + 172800000).toISOString(), // 2 days from now (On Track)
  },
  {
    id: 'INC-104',
    title: 'Printer setup required',
    description: 'New printer in Room 402 needs network configuration.',
    status: 'new',
    priority: 'low',
    category: 'hardware',
    creator: 'Charlie Brown',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now (On Track)
  },
  {
    id: 'INC-105',
    title: 'Software update stalled',
    description: 'Critical security update is stuck at 45% for 3 hours.',
    status: 'open',
    priority: 'urgent',
    category: 'software',
    creator: 'David Miller',
    assignee: 'Roman',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    deadline: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now (Urgent)
  },
  {
    id: 'INC-106',
    title: 'Password reset',
    description: 'New employee needs their AD password reset.',
    status: 'solved',
    priority: 'low',
    category: 'other',
    creator: 'Eve Johnson',
    assignee: 'Liza',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    deadline: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'INC-107',
    title: 'Server room power outage',
    description: 'UPS is beeping, possible battery failure.',
    status: 'new',
    priority: 'urgent',
    category: 'hardware',
    creator: 'Frank Knight',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    deadline: new Date(Date.now() + 1800000).toISOString(), // 30 mins from now (Urgent)
  },
];
