import { reactive } from 'vue';

export interface AuditLogEntry {
  id: string;
  ticketId: string;
  details: string;
  timestamp: string;
}

export const auditStore = reactive({
  logs: [] as AuditLogEntry[],

  addLog(ticketId: string, details: string) {
    const newLog: AuditLogEntry = {
      id: Date.now().toString(),
      ticketId,
      details,
      timestamp: new Date().toLocaleString('uk-UA')
    };
    
    // Додаємо новий лог на початок списку
    this.logs.unshift(newLog);
    
    console.log('Audit Log added:', newLog);
  }
});