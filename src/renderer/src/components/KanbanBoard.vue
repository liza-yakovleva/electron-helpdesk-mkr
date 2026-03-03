<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Ticket } from '../../../shared/types';
import KanbanColumn from './KanbanColumn.vue';
import { Search, Filter, X, ChevronDown, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-vue-next';

const props = defineProps<{
  tickets: Ticket[];
}>();

const emit = defineEmits<{
  (e: 'move-ticket', ticketId: string, newStatus: Ticket['status']): void;
  (e: 'open-ticket-form'): void;
  (e: 'edit-ticket', ticketId: string): void;
}>();

// --- Search Logic ---
const searchQuery = ref('');
const debouncedSearchQuery = ref('');
let debounceTimeout: any = null;

watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newVal;
  }, 400);
});

// --- Filter Logic ---
const showFilters = ref(false);
const activeFilters = ref({
  priority: [] as Ticket['priority'][],
  assignee: [] as string[],
  slaStatus: [] as ('overdue' | 'urgent' | 'on-track')[],
});

const statuses: Ticket['status'][] = ['new', 'open', 'pending', 'solved', 'closed'];

const availableAssignees = computed(() => {
  const assignees = props.tickets
    .map(t => t.assignee)
    .filter((a): a is string => !!a);
  return [...new Set(assignees)];
});

const getSlaStatus = (ticket: Ticket) => {
  const now = new Date();
  const deadlineDate = new Date(ticket.deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  if (diff < 0) return 'overdue';
  if (diff < 12 * 60 * 60 * 1000) return 'urgent';
  return 'on-track';
};

const displayTickets = computed(() => {
  return props.tickets.filter(ticket => {
    const searchLower = debouncedSearchQuery.value.toLowerCase();
    const matchesSearch = !searchLower || 
      ticket.id.toLowerCase().includes(searchLower) ||
      ticket.title.toLowerCase().includes(searchLower) ||
      ticket.description.toLowerCase().includes(searchLower) ||
      (ticket.assignee && ticket.assignee.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    if (activeFilters.value.priority.length > 0 && !activeFilters.value.priority.includes(ticket.priority)) {
      return false;
    }

    if (activeFilters.value.assignee.length > 0 && (!ticket.assignee || !activeFilters.value.assignee.includes(ticket.assignee))) {
      return false;
    }

    if (activeFilters.value.slaStatus.length > 0) {
      const status = getSlaStatus(ticket);
      if (!activeFilters.value.slaStatus.includes(status)) return false;
    }

    return true;
  });
});

const filterTicketsByStatus = (status: Ticket['status']) => {
  return displayTickets.value.filter(t => t.status === status);
};

const resetFilters = () => {
  searchQuery.value = '';
  debouncedSearchQuery.value = '';
  activeFilters.value = {
    priority: [],
    assignee: [],
    slaStatus: [],
  };
};

const toggleFilter = (type: 'priority' | 'assignee' | 'slaStatus', value: any) => {
  const index = (activeFilters.value[type] as any[]).indexOf(value);
  if (index === -1) {
    (activeFilters.value[type] as any[]).push(value);
  } else {
    (activeFilters.value[type] as any[]).splice(index, 1);
  }
};

const isFilterActive = computed(() => {
  return debouncedSearchQuery.value || 
         activeFilters.value.priority.length > 0 || 
         activeFilters.value.assignee.length > 0 || 
         activeFilters.value.slaStatus.length > 0;
});
</script>

<template>
  <div class="flex flex-col h-full bg-transparent">
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <div class="group relative order-1 min-w-[16rem] flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
        <input v-model="searchQuery" type="text" placeholder="Search tickets..." class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm dark:bg-slate-900 dark:text-white" />
      </div>

      <button 
        @click="$emit('open-ticket-form')" 
        type="button"
        class="relative z-10 order-3 shrink-0 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-blue-700 active:scale-95"
      >
        <Plus :size="18" /> New Ticket
      </button>
    </div>

    <div class="flex-1 min-h-0 overflow-auto pb-4 scrollbar-app">
      <div class="inline-flex h-full items-start gap-4">
        <KanbanColumn 
          v-for="status in statuses" 
          :key="status" 
          :status="status"
          :tickets="filterTicketsByStatus(status)"
          @move-ticket="(id, s) => $emit('move-ticket', id, s)"
          @edit-ticket="(id) => $emit('edit-ticket', id)"
        />
      </div>
    </div>
  </div>
</template>