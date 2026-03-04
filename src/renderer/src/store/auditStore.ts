import { reactive } from 'vue';

export interface AuditLogEntry {
  id: string;
  ticketId: string;
  details: string;
  timestamp: string;
}

export const auditStore = reactive({
  logs: [] as AuditLogEntry[],

  async addLog(ticketId: string, details: string) {
    const newLog: AuditLogEntry = {
      id: Date.now().toString(),
      ticketId,
      details,
      timestamp: new Date().toISOString()
    };
    
    try {
      const savedLogs = await window.api.addAuditLog(newLog);
      this.logs = savedLogs;
      console.log('Audit Log added and saved:', newLog);
    } catch (error) {
      console.error('Помилка при збереженні логу:', error);
    }
  },

  async loadLogs(ticketId?: string) {
    try {
      const logs = await window.api.getAuditLogs(ticketId);
      this.logs = logs;
      console.log('Audit logs loaded:', logs);
    } catch (error) {
      console.error('Помилка при завантаженні логів:', error);
      this.logs = [];
    }
  }
});