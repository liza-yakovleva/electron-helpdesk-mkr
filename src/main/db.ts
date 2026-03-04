import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import type { Ticket, Comment, AuditEvent } from '../shared/types'

const userDataPath = app.getPath('userData')
const dbPath = path.join(userDataPath, 'database.json')
const commentsPath = path.join(userDataPath, 'comments.json')
const auditLogsPath = path.join(userDataPath, 'auditLogs.json')

function ensureDatabase() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([], null, 2))
  }
}

function ensureCommentsDatabase() {
  if (!fs.existsSync(commentsPath)) {
    fs.writeFileSync(commentsPath, JSON.stringify([], null, 2))
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

export function getComments(): Comment[] {
  ensureCommentsDatabase()
  const data = fs.readFileSync(commentsPath, 'utf-8')
  return JSON.parse(data)
}

export function saveComments(comments: Comment[]) {
  ensureCommentsDatabase()
  fs.writeFileSync(commentsPath, JSON.stringify(comments, null, 2))
}

export function getCommentsByTicketId(ticketId: string): Comment[] {
  const comments = getComments()
  return comments.filter(c => c.ticketId === ticketId)
}

export function addComment(comment: Comment) {
  const comments = getComments()
  comments.push(comment)
  saveComments(comments)
  return comments
}

function ensureAuditLogsDatabase() {
  if (!fs.existsSync(auditLogsPath)) {
    fs.writeFileSync(auditLogsPath, JSON.stringify([], null, 2))
  }
}

export function getAuditLogs(): AuditEvent[] {
  ensureAuditLogsDatabase()
  const data = fs.readFileSync(auditLogsPath, 'utf-8')
  return JSON.parse(data)
}

export function saveAuditLogs(logs: AuditEvent[]) {
  ensureAuditLogsDatabase()
  fs.writeFileSync(auditLogsPath, JSON.stringify(logs, null, 2))
}

export function addAuditLog(log: AuditEvent) {
  const logs = getAuditLogs()
  logs.push(log)
  saveAuditLogs(logs)
  return logs
}

export function getAuditLogsByTicketId(ticketId: string): AuditEvent[] {
  const logs = getAuditLogs()
  return logs.filter(l => l.ticketId === ticketId)
}
