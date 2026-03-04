<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Ticket } from '../../../shared/types';
import KanbanCard from './KanbanCard.vue';
import { MoreVertical, ArrowUpDown, Clock, Calendar, Minimize2, Maximize2 } from 'lucide-vue-next';

const props = defineProps<{
  title: string;
  status: Ticket['status'];
  tickets: Ticket[];
}>();

const emit = defineEmits<{
  (e: 'move-ticket', ticketId: string, newStatus: Ticket['status']): void;
  (e: 'edit-ticket', ticketId: string): void;
}>();

const isCollapsed = ref(false);
const sortBy = ref<'priority' | 'deadline' | 'createdAt' | null>(null);
const showMenu = ref(false);

const getStatusColor = (status: Ticket['status']) => {
  switch (status) {
    case 'new': return 'bg-blue-500';
    case 'open': return 'bg-purple-500';
    case 'pending': return 'bg-amber-500';
    case 'solved': return 'bg-emerald-500';
    case 'closed': return 'bg-slate-500';
    default: return 'bg-slate-400';
  }
};

const priorityWeight = {
  'urgent': 4,
  'high': 3,
  'medium': 2,
  'low': 1
};

const sortedTickets = computed(() => {
  const ticketsCopy = [...props.tickets];
  if (!sortBy.value) return ticketsCopy;

  return ticketsCopy.sort((a, b) => {
    if (sortBy.value === 'priority') {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    if (sortBy.value === 'deadline') {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy.value === 'createdAt') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  });
});

const isDraggingOver = ref(false);

const handleDrop = (event: DragEvent) => {
  isDraggingOver.value = false;
  const ticketId = event.dataTransfer?.getData('ticketId');
  if (ticketId) {
    emit('move-ticket', ticketId, props.status);
  }
};

const toggleSort = (type: typeof sortBy.value) => {
  if (sortBy.value === type) {
    sortBy.value = null;
  } else {
    sortBy.value = type;
  }
  showMenu.value = false;
};
</script>

<template>
  <div
    :class="[
      'flex min-h-full flex-shrink-0 flex-col overflow-hidden rounded-2xl border transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-80',
      isDraggingOver
        ? 'scale-[1.02] border-blue-300 bg-blue-50 ring-2 ring-blue-500/20 shadow-lg dark:border-blue-400/40 dark:bg-blue-500/10'
        : 'border-slate-200/60 bg-slate-100/50 dark:border-slate-800 dark:bg-slate-900/50'
    ]"
    @dragover.prevent="isDraggingOver = true"
    @dragleave="isDraggingOver = false"
    @drop="handleDrop"
  >
    <!-- Column Header -->
    <div
      :class="[
        'sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/40 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70',
        isCollapsed ? 'h-full cursor-pointer flex-col py-6 transition-colors hover:bg-white/60 dark:hover:bg-slate-900' : ''
      ]"
      @click="isCollapsed ? (isCollapsed = false) : null"
    >
      <div :class="['flex items-center gap-2', isCollapsed ? 'flex-col' : '']">
        <div :class="['h-2.5 w-2.5 rounded-full shadow-sm', getStatusColor(status)]"></div>
        <h3
          :class="[
            'font-extrabold capitalize tracking-tight text-slate-700 dark:text-slate-200',
            isCollapsed ? 'vertical-text mt-4' : ''
          ]"
        >
          {{ title }}
        </h3>
        <span
          :class="[
            'rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 shadow-inner dark:bg-slate-800 dark:text-slate-300',
            isCollapsed ? 'mt-2' : 'ml-2'
          ]"
        >
          {{ tickets.length }}
        </span>
      </div>

      <div v-if="isCollapsed" class="mt-auto">
        <Maximize2 :size="16" class="text-slate-400 dark:text-slate-500" />
      </div>

      <div v-if="!isCollapsed" class="relative">
        <button
          @click.stop="showMenu = !showMenu"
          class="rounded-lg p-1.5 text-slate-400 shadow-sm transition-colors hover:bg-slate-200 dark:text-slate-500 dark:hover:bg-slate-800"
        >
          <MoreVertical :size="16" />
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showMenu"
          class="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div class="mb-1 px-2 py-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Сортувати за</span>
          </div>
          <button
            @click="toggleSort('priority')"
            :class="[
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors',
              sortBy === 'priority'
                ? 'bg-blue-50 font-bold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
            ]"
          >
            <ArrowUpDown :size="14" /> Пріоритетом
          </button>
          <button
            @click="toggleSort('deadline')"
            :class="[
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors',
              sortBy === 'deadline'
                ? 'bg-blue-50 font-bold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
            ]"
          >
            <Clock :size="14" /> Терміном
          </button>
          <button
            @click="toggleSort('createdAt')"
            :class="[
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors',
              sortBy === 'createdAt'
                ? 'bg-blue-50 font-bold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
            ]"
          >
            <Calendar :size="14" /> Датою створення
          </button>

          <div class="my-1 h-px bg-slate-100 dark:bg-slate-800"></div>

          <button
            @click.stop="isCollapsed = !isCollapsed; showMenu = false"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <template v-if="isCollapsed">
              <Maximize2 :size="14" /> Розгорнути
            </template>
            <template v-else>
              <Minimize2 :size="14" /> Згорнути
            </template>
          </button>
        </div>
      </div>
    </div>

    <!-- Column Content -->
    <div v-if="!isCollapsed" class="scrollbar-column flex-1 space-y-3 overflow-y-auto bg-transparent p-3">
      <transition-group name="list" tag="div" class="min-h-[100px] pb-10">
        <KanbanCard
          v-for="ticket in sortedTickets"
          :key="ticket.id"
          :ticket="ticket"
          @edit-ticket="(id) => $emit('edit-ticket', id)"
        />
      </transition-group>

      <div
        v-if="tickets.length === 0"
        class="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-12 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500"
      >
        <div class="rounded-full bg-white p-3 shadow-sm dark:bg-slate-900">
          <Maximize2 :size="24" class="opacity-20" />
        </div>
        <p class="font-medium">Немає тікетів у цьому статусі</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-column::-webkit-scrollbar {
  width: 5px;
}

.scrollbar-column::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-column::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.5);
  border-radius: 10px;
}

.dark .scrollbar-column::-webkit-scrollbar-thumb {
  background: rgba(51, 65, 85, 0.5);
}

.scrollbar-column::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

.dark .scrollbar-column::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.5);
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.list-leave-active {
  position: absolute;
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  white-space: nowrap;
}
</style>
