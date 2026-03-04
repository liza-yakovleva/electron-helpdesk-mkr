<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import TicketList from './components/TicketList.vue'
import TicketForm from './components/TicketForm.vue'
import TicketEditModal from './components/TicketEditModal.vue'
import AuditLog from './components/AuditLog.vue' 
import { auditStore } from './store/auditStore' 
import type { Ticket } from '../../shared/types'
import { Plus } from 'lucide-vue-next'

const currentView = ref<'dashboard' | 'kanban' | 'audit'>('kanban')
const theme = ref<'light' | 'dark'>('light')
const showTicketForm = ref(false)
const editingTicket = ref<Ticket | null>(null)
const tickets = ref<Ticket[]>([])

const setView = (view: 'dashboard' | 'kanban' | 'audit') => {
  currentView.value = view
}

const applyTheme = (nextTheme: 'light' | 'dark') => {
  theme.value = nextTheme
  document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  document.documentElement.style.colorScheme = nextTheme
  localStorage.setItem('theme', nextTheme)
  window.api.setThemeSource(nextTheme).catch((error) => {
    console.error('Failed to sync theme with native window:', error)
  })
}

const toggleTheme = () => {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(async () => {
  const savedTheme = localStorage.getItem('theme')
  const savedThemeValue = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null

  let initialTheme: 'light' | 'dark'
  if (savedThemeValue) {
    initialTheme = savedThemeValue
  } else {
    try {
      initialTheme = await window.api.getEffectiveTheme()
    } catch {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      initialTheme = systemPrefersDark ? 'dark' : 'light'
    }
  }

  applyTheme(initialTheme)

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
      await auditStore.addLog(ticketId, `Змінено статус: ${oldStatus} -> ${newStatus}`)
    } catch (error) {
      console.error('Failed to save ticket:', error)
    }
  }
}

const handleTicketCreated = async (updatedTickets: Ticket[]) => {
  const newTicket = updatedTickets.find(nt => !tickets.value.some(t => t.id === nt.id))
  tickets.value = updatedTickets
  showTicketForm.value = false
  if (newTicket) {
    await auditStore.addLog(newTicket.id, 'Створено новий тікет')
  }
}

const handleTicketEdited = async (updatedTickets: Ticket[]) => {
  const ticketId = editingTicket.value?.id
  const wasDeleted = !updatedTickets.some(t => t.id === ticketId)
  
  tickets.value = updatedTickets
  
  if (ticketId) {
    if (wasDeleted) {
      await auditStore.addLog(ticketId, 'Видалено тікет')
    } else {
      await auditStore.addLog(ticketId, 'Відредаговано дані тікета')
    }
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
  <div class="flex h-dvh w-full min-h-0 overflow-hidden bg-slate-50 text-app-text transition-colors dark:bg-slate-950 dark:text-slate-100 font-sans">
    
    <Sidebar 
      :current-view="currentView" 
      :theme="theme" 
      @set-view="setView" 
      @toggle-theme="toggleTheme" 
    />
    
    <main class="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 scrollbar-app">
      
      <template v-if="currentView === 'dashboard'">
        <header class="mb-6 flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Ticket Table View</h1>
            <p class="text-app-muted">Швидкий пошук та перегляд тікетів у таблиці.</p>
          </div>
          <button 
            @click="showTicketForm = true"
            class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus :size="18" /> New Ticket
          </button>
        </header>
        <TicketList :tickets="tickets" />
      </template>

      <template v-else-if="currentView === 'kanban'">
        <section class="flex min-h-full flex-col">
          <header class="mb-6">
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Kanban Board</h1>
            <p class="text-app-muted">Керуйте статусами тікетів та відстежуйте SLA.</p>
          </header>

          <div class="flex-1 min-h-0">
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
