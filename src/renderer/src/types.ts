// Головний інтерфейс заявки (Ticket)
export interface Ticket {
  id: string;                // Унікальний ID (наприклад, "INC-101")
  title: string;             // Короткий заголовок проблеми
  description: string;       // Детальний опис
  status: 'new' | 'open' | 'pending' | 'solved' | 'closed'; // Статуси для Канбану
  priority: 'low' | 'medium' | 'high' | 'urgent';          // Пріоритети для фільтрів
  category: 'hardware' | 'software' | 'network' | 'other'; // Категорії для статистики
  creator: string;           // Хто створив (ім'я користувача)
  assignee?: string;         // Хто виконує (може бути порожнім)
  createdAt: string;         // Дата створення (ISO string)
  updatedAt: string;         // Дата останньої зміни
  deadline: string;          // SLA: до якого часу треба виконати
}

// Інтерфейс для логів аудиту (Audit Log)
export interface AuditEvent {
  id: string;
  ticketId: string;          // До якої заявки відноситься лог
  action: string;            // Що зроблено (наприклад, "Змінено статус на Open")
  user: string;              // Хто зробив зміну
  timestamp: string;         // Коли
}