import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import type { Ticket } from '../shared/types'

// reuse the helper functions defined in db.ts so the storage path is
// configured in one place. the old implementation used "tickets.json"
// while the actual file on disk (per user report) is "database.json".
import {
  getTickets,
  saveTickets,
  getCommentsByTicketId,
  addComment,
  getAuditLogs,
  addAuditLog,
  getAuditLogsByTicketId,
  deleteCommentsByTicketId,
  deleteAuditLogsByTicketId
} from './db'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#020617' : '#f6f7fb',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  if (process.platform === 'win32') app.setAppUserModelId('com.electron.helpdesk')

  // ОБРОБНИКИ ДЛЯ ДІМИ ТА МІШІ
  ipcMain.handle('get-tickets', () => getTickets())

  ipcMain.handle('save-ticket', (_event, ticket: Ticket) => {
    const tickets = getTickets()
    const index = tickets.findIndex((t) => t.id === ticket.id)
    if (index !== -1) {
      tickets[index] = { ...ticket, updatedAt: new Date().toISOString() }
    } else {
      tickets.push({
        ...ticket,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    saveTickets(tickets)
    return tickets
  })

  ipcMain.handle('delete-ticket', (_event, id) => {
    const tickets = getTickets().filter((t) => t.id !== id)
    saveTickets(tickets)
    // Видаляємо також коментарі та логи для цього тікета
    deleteCommentsByTicketId(id)
    deleteAuditLogsByTicketId(id)
    return tickets
  })

  ipcMain.handle('get-comments', (_event, ticketId: string) => {
    return getCommentsByTicketId(ticketId)
  })

  ipcMain.handle('add-comment', (_event, comment) => {
    return addComment(comment)
  })

  ipcMain.handle('get-audit-logs', (_event, ticketId: string) => {
    if (ticketId) {
      return getAuditLogsByTicketId(ticketId)
    }
    return getAuditLogs()
  })

  ipcMain.handle('add-audit-log', (_event, log) => {
    return addAuditLog(log)
  })

  ipcMain.handle('set-theme-source', (_event, theme: 'light' | 'dark' | 'system') => {
    nativeTheme.themeSource = theme
    const backgroundColor = nativeTheme.shouldUseDarkColors ? '#020617' : '#f6f7fb'
    for (const window of BrowserWindow.getAllWindows()) {
      window.setBackgroundColor(backgroundColor)
    }
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  })

  ipcMain.handle('get-effective-theme', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  })

  createWindow()
})
