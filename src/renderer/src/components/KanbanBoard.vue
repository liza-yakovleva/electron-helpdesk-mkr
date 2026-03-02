<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Ticket } from '../types';
import KanbanColumn from './KanbanColumn.vue';
import { Search, Filter, X, ChevronDown, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-vue-next';

const props = defineProps<{
  tickets: Ticket[];
}>();

const emit = defineEmits<{
  (e: 'move-ticket', ticketId: string, newStatus: Ticket['status']): void;
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

// Get unique assignees for filter
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
    // Search Filter
    const searchLower = debouncedSearchQuery.value.toLowerCase();
    const matchesSearch = !searchLower || 
      ticket.id.toLowerCase().includes(searchLower) ||
      ticket.title.toLowerCase().includes(searchLower) ||
      ticket.description.toLowerCase().includes(searchLower) ||
      (ticket.assignee && ticket.assignee.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    // Priority Filter
    if (activeFilters.value.priority.length > 0 && !activeFilters.value.priority.includes(ticket.priority)) {
      return false;
    }

    // Assignee Filter
    if (activeFilters.value.assignee.length > 0 && (!ticket.assignee || !activeFilters.value.assignee.includes(ticket.assignee))) {
      return false;
    }

    // SLA Status Filter
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
    <!-- Header/Filters -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <!-- Search Input -->
        <div class="relative group">
          <Search 
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500 dark:text-slate-500" 
            :size="18" 
          />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search tickets (ID, Title, Assignee)..." 
            class="w-80 rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 shadow-sm transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500/30"
          />
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''; debouncedSearchQuery = ''"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800"
          >
            <X :size="14" />
          </button>
        </div>

        <!-- Filters Button -->
        <div class="relative">
          <button 
            @click="showFilters = !showFilters"
            :class="[
              'flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-all shadow-sm',
              showFilters || isFilterActive
                ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            ]"
          >
            <Filter :size="16" />
            Filters
            <span v-if="isFilterActive" class="w-2 h-2 rounded-full bg-blue-500"></span>
            <ChevronDown :size="14" :class="['transition-transform', showFilters ? 'rotate-180' : '']" />
          </button>

          <!-- Dropdown Filter Menu -->
          <div v-if="showFilters" class="absolute left-0 z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">Fine Grained Filters</h4>
              <button @click="resetFilters" class="text-blue-600 text-[10px] font-bold uppercase hover:underline">Reset All</button>
            </div>

            <!-- Priority -->
            <div class="mb-4">
              <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Priority</span>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="p in (['low', 'medium', 'high', 'urgent'] as Ticket['priority'][])" 
                  :key="p"
                  @click="toggleFilter('priority', p)"
                  :class="[
                    'rounded border px-2 py-1 text-[10px] font-bold capitalize transition-colors',
                    activeFilters.priority.includes(p)
                      ? 'border-slate-800 bg-slate-800 text-white dark:border-slate-300 dark:bg-slate-200 dark:text-slate-900'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600'
                  ]"
                >
                  {{ p }}
                </button>
              </div>
            </div>

            <!-- SLA Status -->
            <div class="mb-4">
              <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">SLA Health</span>
              <div class="flex flex-col gap-1">
                <button 
                  v-for="s in (['overdue', 'urgent', 'on-track'] as const)" 
                  :key="s"
                  @click="toggleFilter('slaStatus', s)"
                  class="flex items-center justify-between rounded-lg p-2 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div class="flex items-center gap-2">
                    <AlertCircle v-if="s === 'overdue'" :size="14" class="text-red-500" />
                    <Clock v-else-if="s === 'urgent'" :size="14" class="text-amber-500" />
                    <CheckCircle2 v-else :size="14" class="text-emerald-500" />
                    <span class="capitalize font-medium text-slate-700 dark:text-slate-300">{{ s.replace('-', ' ') }}</span>
                  </div>
                  <div v-if="activeFilters.slaStatus.includes(s)" class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                </button>
              </div>
            </div>

            <!-- Assignee -->
            <div v-if="availableAssignees.length" class="mb-2">
              <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Assignee</span>
              <div class="max-h-32 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                <button 
                  v-for="a in availableAssignees" 
                  :key="a"
                  @click="toggleFilter('assignee', a)"
                  class="flex w-full items-center justify-between rounded-lg border border-transparent p-2 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  :class="activeFilters.assignee.includes(a) ? 'border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800' : ''"
                >
                  <span class="font-medium text-slate-700 dark:text-slate-300">{{ a }}</span>
                  <div v-if="activeFilters.assignee.includes(a)" class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-95">
        <Plus :size="18" />
        New Ticket
      </button>
    </div>


    <!-- Board Area -->
    <div class="flex-1 overflow-x-auto pb-4 custom-scrollbar">
      <div class="inline-flex h-full items-start gap-4">
        <KanbanColumn 
          v-for="status in statuses" 
          :key="status" 
          :title="status"
          :status="status"
          :tickets="filterTicketsByStatus(status)"
          @move-ticket="(id, status) => $emit('move-ticket', id, status)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.4);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(203, 213, 225, 0.7);
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(71, 85, 105, 0.6);
}

:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.8);
}
</style>
