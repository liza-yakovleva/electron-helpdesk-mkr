import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
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
  getComments,
  getCommentsByTicketId,
  addComment,
  getAuditLogs,
  addAuditLog,
  getAuditLogsByTicketId,
  deleteCommentsByTicketId,
  deleteAuditLogsByTicketId
} from './db'

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let isAppQuitting: boolean = false

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow?.show())
  
  mainWindow.on('close', (event) => {
    if (!isAppQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
    return false
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  if (process.platform === 'win32') app.setAppUserModelId('com.electron.helpdesk')

  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Додати тікет', 
      click: () => {
        mainWindow?.show()
        mainWindow?.webContents.send('open-add-ticket')
      } 
    },
    { type: 'separator' },
    { 
      label: 'Вийти', 
      click: () => {
        isAppQuitting = true
        app.quit()
      } 
    }
  ])
  tray.setToolTip('Helpdesk Ticketing System')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    mainWindow?.show()
  })

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

  createWindow()
})
