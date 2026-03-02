<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import TicketList from './components/TicketList.vue'
import type { Ticket } from '../../shared/types'



const currentView = ref<'dashboard' | 'kanban'>('kanban')
const theme = ref<'light' | 'dark'>('light')


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
      console.log(`Ticket ${ticketId} moved to ${newStatus}`)
    } catch (error) {
      console.error('Failed to save ticket:', error)
    }
  }
}
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
    <Sidebar :current-view="currentView" :theme="theme" @set-view="setView" @toggle-theme="toggleTheme" />
    <main class="flex-1 h-full overflow-y-auto p-8">
      <template v-if="currentView === 'dashboard'">
        <header class="mb-8">
 <template v-if="currentView === 'dashboard'">
        <header class="mb-8">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Ticket Table View</h1>
          <p class="text-slate-500 dark:text-slate-400">
            Швидкий пошук, фільтрація та перегляд великого обсягу тікетів.
          </p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 class="mb-2 font-semibold text-slate-500 dark:text-slate-400">Open Tickets</h3>
            <p class="text-3xl font-bold">
              {{ tickets.filter(t => t.status === 'open').length }}
            </p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 class="mb-2 font-semibold text-red-500">
              High Priority
            </h3>
            <p class="text-3xl font-bold text-red-500">
              {{ tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length }}
            </p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 class="mb-2 font-semibold text-green-600">
              Total Tickets
            </h3>
            <p class="text-3xl font-bold text-green-600">
              {{ tickets.length }}
            </p>
          </div>
        </div>

        <TicketList :tickets="tickets" />
      </template>
      main
      </template>

      <template v-else-if="currentView === 'kanban'">
        <header class="mb-8 flex justify-between items-end">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Kanban Board</h1>
            <p class="text-slate-500 dark:text-slate-400">
              Track and manage ticket statuses and SLA.
            </p>
          </div>
        </header>

        <div class="h-[calc(100%-100px)]">
          <KanbanBoard
            :tickets="tickets"
            @move-ticket="handleMoveTicket"
          />
        </div>
      </template>
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
