<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import type { Ticket } from './types'

// ❌ ВИДАЛЯЄМО mockTickets
// import { mockTickets as initialTickets } from './mockTickets'

const currentView = ref<'dashboard' | 'kanban'>('kanban')

// 🔥 Тепер масив спочатку пустий
const tickets = ref<Ticket[]>([])

const setView = (view: 'dashboard' | 'kanban') => {
  currentView.value = view
}

// 🔥 Завантажуємо з backend при старті
onMounted(async () => {
  try {
    tickets.value = await window.api.getTickets()
  } catch (error) {
    console.error('Failed to load tickets:', error)
  }
})

// 🔥 Тепер оновлення зберігається в JSON
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
  <div class="flex h-screen bg-slate-50 text-slate-900 w-full overflow-hidden">
    <Sidebar :current-view="currentView" @set-view="setView" />
    <main class="flex-1 p-8 overflow-y-auto h-full">
      <template v-if="currentView === 'dashboard'">
        <header class="mb-8">
          <h1 class="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p class="text-slate-500">
            Welcome back, here is what's happening with tickets.
          </p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 class="font-semibold text-slate-500 mb-2">Open Tickets</h3>
            <p class="text-3xl font-bold">
              {{ tickets.filter(t => t.status === 'open').length }}
            </p>
          </div>

          <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 class="font-semibold text-slate-500 mb-2 text-red-500">
              High Priority
            </h3>
            <p class="text-3xl font-bold text-red-500">
              {{ tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length }}
            </p>
          </div>

          <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 class="font-semibold text-slate-500 mb-2 text-green-600">
              Total Tickets
            </h3>
            <p class="text-3xl font-bold text-green-600">
              {{ tickets.length }}
            </p>
          </div>
        </div>
      </template>

      <template v-else-if="currentView === 'kanban'">
        <header class="mb-8 flex justify-between items-end">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Kanban Board</h1>
            <p class="text-slate-500">
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