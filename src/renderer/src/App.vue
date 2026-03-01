<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './components/Sidebar.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import { mockTickets as initialTickets } from './mockTickets'
import { Ticket } from './types'

const currentView = ref<'dashboard' | 'kanban'>('kanban');
const tickets = ref<Ticket[]>([...initialTickets]);

const setView = (view: 'dashboard' | 'kanban') => {
  currentView.value = view;
};

const handleMoveTicket = (ticketId: string, newStatus: Ticket['status']) => {
  const ticketIndex = tickets.value.findIndex(t => t.id === ticketId);
  if (ticketIndex !== -1) {
    // Update the ticket status and updatedAt
    tickets.value[ticketIndex] = {
      ...tickets.value[ticketIndex],
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`Ticket ${ticketId} moved to ${newStatus}`);
    // In a real app, we would send an IPC call here to update the backend
  }
};
</script>

<template>
  <div class="flex h-screen bg-slate-50 text-slate-900 w-full overflow-hidden">
    <Sidebar :current-view="currentView" @set-view="setView" />
    <main class="flex-1 p-8 overflow-y-auto h-full">
      <template v-if="currentView === 'dashboard'">
        <header class="mb-8">
          <h1 class="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p class="text-slate-500">Welcome back, here is what's happening with tickets.</p>
        </header>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 class="font-semibold text-slate-500 mb-2">Open Tickets</h3>
            <p class="text-3xl font-bold">12</p>
          </div>
          <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 class="font-semibold text-slate-500 mb-2 text-red-500">High Priority</h3>
            <p class="text-3xl font-bold text-red-500">4</p>
          </div>
          <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <h3 class="font-semibold text-slate-500 mb-2 text-green-600">Avg. SLA Time</h3>
            <p class="text-3xl font-bold text-green-600">1.5h</p>
          </div>
        </div>
      </template>

      <template v-else-if="currentView === 'kanban'">
        <header class="mb-8 flex justify-between items-end">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Kanban Board</h1>
            <p class="text-slate-500">Track and manage ticket statuses and SLA.</p>
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