import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { getTickets, saveTickets } from './db'
import type { Ticket } from '../shared/types'


function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // =========================
  // ТУТ ДОДАЄМО IPC HANDLE
  // =========================

  ipcMain.handle('get-tickets', () => {
    return getTickets()
  })

  ipcMain.handle('save-ticket', (_event, ticket: Ticket) => {
    const tickets = getTickets()

    const index = tickets.findIndex(t => t.id === ticket.id)

    if (index !== -1) {
      // UPDATE
      tickets[index] = {
        ...ticket,
        updatedAt: new Date().toISOString()
      }
    } else {
      // CREATE
      tickets.push({
        ...ticket,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    saveTickets(tickets)

    return tickets
  })

  ipcMain.handle('delete-ticket', (_event, ticketId: string) => {
    let tickets = getTickets()
    tickets = tickets.filter(t => t.id !== ticketId)
    saveTickets(tickets)
    return tickets
  })


  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})