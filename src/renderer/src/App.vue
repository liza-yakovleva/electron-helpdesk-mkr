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
  <div class="flex h-dvh w-full min-h-0 overflow-hidden text-app-text">
    <Sidebar :current-view="currentView" @set-view="setView" />
    <main class="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 scrollbar-app">
      <template v-if="currentView === 'dashboard'">
        <header class="mb-6 lg:mb-8">
          <h1 class="text-2xl font-extrabold">Dashboard Overview</h1>
          <p class="text-app-muted">
            Welcome back, here is what's happening with tickets.
          </p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="app-card p-6">
            <h3 class="font-semibold text-app-muted mb-2">Open Tickets</h3>
            <p class="text-3xl font-bold">
              {{ tickets.filter(t => t.status === 'open').length }}
            </p>
          </div>

          <div class="app-card p-6">
            <h3 class="font-semibold text-app-danger mb-2">
              High Priority
            </h3>
            <p class="text-3xl font-bold text-app-danger">
              {{ tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length }}
            </p>
          </div>

          <div class="app-card p-6">
            <h3 class="font-semibold text-app-success mb-2">
              Total Tickets
            </h3>
            <p class="text-3xl font-bold text-app-success">
              {{ tickets.length }}
            </p>
          </div>
        </div>
      </template>

      <template v-else-if="currentView === 'kanban'">
        <section class="flex min-h-[32rem] flex-col">
          <header class="mb-6 flex justify-between items-end lg:mb-8">
            <div>
              <h1 class="text-2xl font-extrabold">Kanban Board</h1>
              <p class="text-app-muted">
                Track and manage ticket statuses and SLA.
              </p>
            </div>
          </header>

          <div class="min-h-[22rem] flex-1">
            <KanbanBoard
              :tickets="tickets"
              @move-ticket="handleMoveTicket"
            />
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
