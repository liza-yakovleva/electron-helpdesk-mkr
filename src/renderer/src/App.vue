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
import { Plus, RefreshCw } from 'lucide-vue-next'

const currentView = ref<'dashboard' | 'kanban' | 'audit'>('kanban')
const theme = ref<'light' | 'dark'>('light')
const showTicketForm = ref(false)
const editingTicket = ref<Ticket | null>(null)
const tickets = ref<Ticket[]>([])
const isRefreshing = ref(false)

const setView = (view: 'dashboard' | 'kanban' | 'audit') => {
  currentView.value = view
}

const refreshTickets = async () => {
  isRefreshing.value = true
  try {
    tickets.value = await window.api.getTickets()
  } catch (error) {
    console.error('Failed to reload tickets:', error)
  } finally {
    setTimeout(() => { isRefreshing.value = false }, 500)
  }
}

const applyTheme = (nextTheme: 'light' | 'dark') => {
  theme.value = nextTheme
  document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  document.documentElement.style.colorScheme = nextTheme
  localStorage.setItem('theme', nextTheme)
}

const getPreferredTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : systemPrefersDark ? 'dark' : 'light'
}

const toggleTheme = () => {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

if (typeof window !== 'undefined') {
  applyTheme(getPreferredTheme())
}

onMounted(async () => {
  applyTheme(getPreferredTheme())

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
  <div class="flex h-dvh w-full min-h-0 overflow-hidden bg-app-bg text-app-text transition-colors font-sans">
    
    <Sidebar 
      :current-view="currentView" 
      :theme="theme" 
      @set-view="setView" 
      @toggle-theme="toggleTheme" 
    />
    
    <main class="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      
      <template v-if="currentView === 'dashboard'">
        <header class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Табличний перегляд тікетів</h1>
            <p class="text-app-muted">Швидкий пошук та перегляд тікетів у таблиці.</p>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="refreshTickets"
              class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Оновити дані"
            >
              <RefreshCw :size="16" :class="{ 'animate-spin': isRefreshing }" />
              Оновити
            </button>
            <button 
              @click="showTicketForm = true"
              class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus :size="18" /> Новий тікет
            </button>
          </div>
        </header>
        <TicketList :tickets="tickets" />
      </template>

      <template v-else-if="currentView === 'kanban'">
        <section class="flex h-full flex-col">
          <header class="mb-6 flex items-start justify-between">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Панель канбан</h1>
              <p class="text-app-muted">Керуйте статусами тікетів та відстежуйте SLA.</p>
            </div>
            <div class="flex items-center gap-3">
              <button 
                @click="refreshTickets"
                class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                title="Оновити дані"
              >
                <RefreshCw :size="16" :class="{ 'animate-spin': isRefreshing }" />
                Оновити
              </button>
            </div>
          </header>

          <div class="min-h-0 flex-1">
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
