<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import TicketList from './components/TicketList.vue'
import TicketForm from './components/TicketForm.vue'
import TicketEditModal from './components/TicketEditModal.vue'
import type { Ticket } from '../../shared/types'
import AuditLog from './components/AuditLog.vue' 
import { Plus } from 'lucide-vue-next'

const currentView = ref<'dashboard' | 'kanban' | 'audit'>('kanban')
const theme = ref<'light' | 'dark'>('light')
const showTicketForm = ref(false)
const editingTicket = ref<Ticket | null>(null)

const tickets = ref<Ticket[]>([])

const logActivity = async (ticketId: string, details: string) => {
  try {
    await window.api.saveLog({
      id: Date.now().toString(),
      ticketId,
      details,
      user: 'Володимир (QA)', // Тут можна брати активного юзера
      timestamp: new Date().toLocaleString('uk-UA')
    })
  } catch (e) {
    console.error("Logging failed", e)
  }
}
const setView = (view: 'dashboard' | 'kanban' | 'audit') => {
  currentView.value = view
}

const applyTheme = (nextTheme: 'light' | 'dark') => {
  theme.value = nextTheme
  document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  document.documentElement.style.colorScheme = nextTheme
  localStorage.setItem('theme', nextTheme)
}

const toggleTheme = () => {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(async () => {
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : systemPrefersDark ? 'dark' : 'light')

  try {
    tickets.value = await window.api.getTickets()
  } catch (error) {
    console.error('Failed to load tickets:', error)
  }
})

const handleMoveTicket = async (ticketId: string, newStatus: Ticket['status']) => {
  const ticketIndex = tickets.value.findIndex(t => t.id === ticketId)
  if (ticketIndex !== -1) {
    const oldStatus = tickets.value[ticketIndex].status
    const updatedTicket = { ...tickets.value[ticketIndex], status: newStatus, updatedAt: new Date().toISOString() }

    try {
      tickets.value = await window.api.saveTicket(updatedTicket)
      // Логуємо подію
      await logActivity(ticketId, `Змінено статус: ${oldStatus} -> ${newStatus}`)
    } catch (error) {
      console.error('Failed to save ticket:', error)
    }
  }
}

const handleTicketCreated = (updatedTickets: Ticket[]) => {
  tickets.value = updatedTickets
  showTicketForm.value = false
  const newTicket = updatedTickets[updatedTickets.length - 1]
  logActivity(newTicket.id, 'Створено новий тікет')
}

const handleTicketEdited = (updatedTickets: Ticket[]) => {
  const ticketId = editingTicket.value?.id
  tickets.value = updatedTickets
  if (ticketId) {
    logActivity(ticketId, 'Відредаговано дані тікета')
  }
  editingTicket.value = null
}

const openEditModal = (ticketId: string) => {
  const ticket = tickets.value.find(t => t.id === ticketId)
  if (ticket) {
    editingTicket.value = ticket
  }
}
</script>

<template>
  <div class="flex h-dvh w-full min-h-0 overflow-hidden bg-slate-50 text-app-text transition-colors dark:bg-slate-950 dark:text-slate-100">
    <Sidebar :current-view="currentView" :theme="theme" @set-view="setView" @toggle-theme="toggleTheme" />
    
    <main class="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 scrollbar-app">
      
      <template v-if="currentView === 'dashboard'">
  <header class="mb-6 lg:mb-8 flex justify-between items-center">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Ticket Table View</h1>
      <p class="text-app-muted">Швидкий пошук та перегляд тікетів.</p>
    </div>
    <button 
      @click="showTicketForm = true"
      class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all"
    >
      <Plus :size="18" /> New Ticket
    </button>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    </div>

  <TicketList :tickets="tickets" />
</template>

      <template v-else-if="currentView === 'kanban'">
        <section class="flex min-h-[32rem] flex-col">
          <header class="mb-6 flex justify-between items-end lg:mb-8">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Kanban Board</h1>
              <p class="text-app-muted">
                Track and manage ticket statuses and SLA.
              </p>
            </div>
          </header>

          <div class="min-h-[22rem] flex-1">
            <KanbanBoard
              :tickets="tickets"
              @move-ticket="handleMoveTicket"
              @open-ticket-form="showTicketForm = true"
              @edit-ticket="openEditModal"
            />
          </div>
        </section>
      </template>

      <template v-else-if="currentView === 'audit'">
        <AuditLog />
      </template>

      <TicketForm 
        v-if="showTicketForm" 
        @close="showTicketForm = false" 
        @submit="handleTicketCreated" 
      />
      
      <TicketEditModal
        v-if="editingTicket"
        :ticket="editingTicket"
        @close="editingTicket = null"
        @submit="handleTicketEdited"
      />
    </main>
  </div>
</template>