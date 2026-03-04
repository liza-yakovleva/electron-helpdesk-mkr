// preload/index.ts
// this script runs in the renderer context and is used to safely expose
// a small set of IPC helpers to the web code. the main process logic (app
// lifecycle, window creation, ipcMain handlers, etc.) belongs in
// `src/main/index.ts` – which is already the case in this repo.

import { contextBridge, ipcRenderer } from 'electron'
import type { Ticket, Comment, AuditEvent } from '../shared/types'

// expose a simple API object under `window.api`. the renderer code relies
// on `window.api.getTickets`, `saveTicket` and `deleteTicket` so we provide
// thin wrappers around `ipcRenderer.invoke`.

contextBridge.exposeInMainWorld('api', {
  getTickets: (): Promise<Ticket[]> => ipcRenderer.invoke('get-tickets'),
  saveTicket: (ticket: Ticket): Promise<Ticket[]> => ipcRenderer.invoke('save-ticket', ticket),
  deleteTicket: (id: string): Promise<Ticket[]> => ipcRenderer.invoke('delete-ticket', id),
  getComments: (ticketId: string): Promise<Comment[]> => ipcRenderer.invoke('get-comments', ticketId),
  addComment: (comment: Comment): Promise<Comment[]> => ipcRenderer.invoke('add-comment', comment),
  getAuditLogs: (ticketId?: string): Promise<AuditEvent[]> => ipcRenderer.invoke('get-audit-logs', ticketId),
  addAuditLog: (log: AuditEvent): Promise<AuditEvent[]> => ipcRenderer.invoke('add-audit-log', log),
  setThemeSource: (theme: 'light' | 'dark' | 'system'): Promise<'light' | 'dark'> =>
    ipcRenderer.invoke('set-theme-source', theme),
  getEffectiveTheme: (): Promise<'light' | 'dark'> => ipcRenderer.invoke('get-effective-theme')
})
