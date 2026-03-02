<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import TicketList from './components/TicketList.vue'
import TicketForm from './components/TicketForm.vue'
import TicketEditModal from './components/TicketEditModal.vue'
import type { Ticket } from '../../shared/types'

const currentView = ref<'dashboard' | 'kanban'>('kanban')
const theme = ref<'light' | 'dark'>('light')
const showTicketForm = ref(false)
const editingTicket = ref<Ticket | null>(null)

const tickets = ref<Ticket[]>([])

const setView = (view: 'dashboard' | 'kanban') => {
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

const handleMoveTicket = async (
  ticketId: string,
  newStatus: Ticket['status']
) => {
  const ticketIndex = tickets.value.findIndex(t => t.id === ticketId)

  if (ticketIndex !== -1) {
    const updatedTicket: Ticket = {
      ...tickets.value[ticketIndex],
      status: newStatus,
      updatedAt: new Date().toISOString()
    }

    try {
      tickets.value = await window.api.saveTicket(updatedTicket)
    } catch (error) {
      console.error('Failed to save ticket:', error)
    }
  }
}

const handleTicketCreated = (updatedTickets: Ticket[]) => {
  tickets.value = updatedTickets
  showTicketForm.value = false
}

const handleTicketEdited = (updatedTickets: Ticket[]) => {
  tickets.value = updatedTickets
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
        <header class="mb-6 lg:mb-8">
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Ticket Table View</h1>
          <p class="text-app-muted">
            Швидкий пошук, фільтрація та перегляд великого обсягу тікетів.
          </p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="app-card p-6">
            <h3 class="font-semibold text-app-muted mb-2">Open Tickets</h3>
            <p class="text-3xl font-bold italic">
              {{ tickets.filter(t => t.status === 'open').length }}
            </p>
          </div>

          <div class="app-card p-6">
            <h3 class="font-semibold text-app-danger mb-2">High Priority</h3>
            <p class="text-3xl font-bold text-app-danger">
              {{ tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length }}
            </p>
          </div>

          <div class="app-card p-6">
            <h3 class="font-semibold text-app-success mb-2">Total Tickets</h3>
            <p class="text-3xl font-bold text-app-success">
              {{ tickets.length }}
            </p>
          </div>
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