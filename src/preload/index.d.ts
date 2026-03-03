import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getTickets: () => Promise<import('../shared/types').Ticket[]>
      saveTicket: (ticket: import('../shared/types').Ticket) => Promise<import('../shared/types').Ticket[]>
      deleteTicket: (id: string) => Promise<import('../shared/types').Ticket[]>
    }
  }
}
