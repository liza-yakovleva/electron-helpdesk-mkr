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
  <div class="flex h-full flex-col bg-transparent">
    <!-- Header/Filters -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <!-- Search Input -->
        <div class="group relative">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500"
            :size="18"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Пошук тікетів (ID, Назва, Виконавець)..."
            class="w-80 rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''; debouncedSearchQuery = ''"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X :size="14" />
          </button>
        </div>

        <!-- Filters Button -->
        <div class="relative">
          <button
            @click="showFilters = !showFilters"
            :class="[
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm transition-all',
              showFilters || isFilterActive
                ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            ]"
          >
            <Filter :size="16" />
            Фільтри
            <span v-if="isFilterActive" class="h-2 w-2 rounded-full bg-blue-500"></span>
            <ChevronDown :size="14" :class="['transition-transform', showFilters ? 'rotate-180' : '']" />
          </button>

          <!-- Dropdown Filter Menu -->
          <div v-if="showFilters" class="absolute left-0 z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div class="mb-4 flex items-center justify-between">
              <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">Детальні фільтри</h4>
              <button @click="resetFilters" class="text-[10px] font-bold uppercase text-blue-600 hover:underline dark:text-blue-400">Скинути все</button>
            </div>

            <!-- Priority -->
            <div class="mb-4">
              <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Пріоритет</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="p in (['low', 'medium', 'high', 'urgent'] as Ticket['priority'][])"
                  :key="p"
                  @click="toggleFilter('priority', p)"
                  :class="[
                    'rounded border px-2 py-1 text-[10px] font-bold capitalize transition-colors',
                    activeFilters.priority.includes(p)
                      ? 'border-slate-800 bg-slate-800 text-white dark:border-blue-500 dark:bg-blue-600'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  ]"
                >
                  {{ p === 'low' ? 'Низький' : p === 'medium' ? 'Середній' : p === 'high' ? 'Високий' : 'Терміновий' }}
                </button>
              </div>
            </div>

            <!-- SLA Status -->
            <div class="mb-4">
              <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Стан SLA</span>
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
                    <span class="font-medium text-slate-700 dark:text-slate-300">
                      {{ s === 'overdue' ? 'Протерміновано' : s === 'urgent' ? 'Скоро термін' : 'Вчасно' }}
                    </span>
                  </div>
                  <div v-if="activeFilters.slaStatus.includes(s)" class="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                </button>
              </div>
            </div>

            <!-- Assignee -->
            <div v-if="availableAssignees.length" class="mb-2">
              <span class="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Виконавець</span>
              <div class="scrollbar-app max-h-32 space-y-1 overflow-y-auto pr-1">
                <button
                  v-for="a in availableAssignees"
                  :key="a"
                  @click="toggleFilter('assignee', a)"
                  class="flex w-full items-center justify-between rounded-lg border border-transparent p-2 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  :class="activeFilters.assignee.includes(a) ? 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700' : ''"
                >
                  <span class="font-medium text-slate-700 dark:text-slate-300">{{ a }}</span>
                  <div v-if="activeFilters.assignee.includes(a)" class="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        @click="$emit('open-ticket-form')"
        class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95"
      >
        <Plus :size="18" />
        Новий тікет
      </button>
    </div>

    <!-- Board Area -->
    <div class="scrollbar-app flex min-h-0 flex-1 overflow-x-auto pb-4">
      <div class="inline-flex min-h-full items-stretch gap-4">
        <KanbanColumn
          v-for="status in statuses"
          :key="status"
          :title="status === 'new' ? 'Новий' : status === 'open' ? 'Відкрито' : status === 'pending' ? 'Очікування' : status === 'solved' ? 'Вирішено' : 'Закрито'"
          :status="status"
          :tickets="filterTicketsByStatus(status)"
          @move-ticket="(id, status) => $emit('move-ticket', id, status)"
          @edit-ticket="(id) => $emit('edit-ticket', id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Individual column scrollbars are handled in KanbanColumn.vue */
</style>

