import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Ticket } from '../shared/types'

const api = {
  getTickets: (): Promise<Ticket[]> =>
    ipcRenderer.invoke('get-tickets'),

  saveTicket: (ticket: Ticket): Promise<Ticket[]> =>
    ipcRenderer.invoke('save-ticket', ticket),

  deleteTicket: (ticketId: string): Promise<Ticket[]> =>
    ipcRenderer.invoke('delete-ticket', ticketId)
}

//  boilerplate-логіку
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}