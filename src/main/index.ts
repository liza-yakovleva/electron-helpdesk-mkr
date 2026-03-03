import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import type { Ticket } from '../shared/types'

// reuse the helper functions defined in db.ts so the storage path is
// configured in one place. the old implementation used "tickets.json"
// while the actual file on disk (per user report) is "database.json".
import { getTickets, saveTickets } from './db'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200, height: 800, show: false, autoHideMenuBar: true,
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
    const index = tickets.findIndex(t => t.id === ticket.id)
    if (index !== -1) {
      tickets[index] = { ...ticket, updatedAt: new Date().toISOString() }
    } else {
      tickets.push({ ...ticket, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    saveTickets(tickets)
    return tickets
  })

  ipcMain.handle('delete-ticket', (_event, id) => {
    const tickets = getTickets().filter(t => t.id !== id)
    saveTickets(tickets)
    return tickets
  })

  createWindow()
})