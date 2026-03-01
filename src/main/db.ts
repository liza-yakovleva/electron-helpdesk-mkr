import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import type { Ticket } from '../shared/types'

const userDataPath = app.getPath('userData')
const dbPath = path.join(userDataPath, 'database.json')

// Якщо файл не існує — створюємо
function ensureDatabase() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([], null, 2))
  }
}

export function getTickets(): Ticket[] {
  ensureDatabase()
  const data = fs.readFileSync(dbPath, 'utf-8')
  return JSON.parse(data)
}

export function saveTickets(tickets: Ticket[]) {
  ensureDatabase()
  fs.writeFileSync(dbPath, JSON.stringify(tickets, null, 2))
}

