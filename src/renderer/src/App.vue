<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import TicketList from './components/TicketList.vue'
import TicketForm from './components/TicketForm.vue'
import TicketEditModal from './components/TicketEditModal.vue'
import type { Ticket } from '../../shared/types'

// ❌ ВИДАЛЯЄМО mockTickets
// import { mockTickets as initialTickets } from './mockTickets'

const currentView = ref<'dashboard' | 'kanban'>('kanban')
const showTicketForm = ref(false)
const editingTicket = ref<Ticket | null>(null)

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
  <div class="flex h-screen bg-slate-50 text-slate-900 w-full overflow-hidden">
    <Sidebar :current-view="currentView" @set-view="setView" />
    <main class="flex-1 p-8 overflow-y-auto h-full">
      <template v-if="currentView === 'dashboard'">
        <header class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Ticket Table View</h1>
            <p class="text-slate-500">
              Швидкий пошук, фільтрація та перегляд великого обсягу тікетів.
            </p>
          </div>
        </header>

        <TicketList :tickets="tickets" />
      </template>

      <template v-else-if="currentView === 'kanban'">
        <header class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            @open-ticket-form="showTicketForm = true"
            @edit-ticket="openEditModal"
          />
        </div>
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

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
