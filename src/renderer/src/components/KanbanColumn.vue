<script setup lang="ts">
import { ref, computed } from 'vue';
import { Ticket } from '../types';
import KanbanCard from './KanbanCard.vue';
import { MoreVertical, ArrowUpDown, Clock, Calendar, Minimize2, Maximize2 } from 'lucide-vue-next';

const props = defineProps<{
  title: string;
  status: Ticket['status'];
  tickets: Ticket[];
}>();

const emit = defineEmits<{
  (e: 'move-ticket', ticketId: string, newStatus: Ticket['status']): void;
}>();

// --- Local State ---
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
      'flex-shrink-0 flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden',
      isCollapsed ? 'w-16' : 'w-80',
      isDraggingOver ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-lg scale-[1.02]' : 'bg-slate-100/50 border-slate-200/60'
    ]"
    @dragover.prevent="isDraggingOver = true"
    @dragleave="isDraggingOver = false"
    @drop="handleDrop"
  >
    <!-- Column Header -->
    <div 
      :class="[
        'p-4 flex items-center justify-between border-b border-slate-200 bg-white/40 backdrop-blur-sm sticky top-0 z-10',
        isCollapsed ? 'flex-col h-full py-6 cursor-pointer hover:bg-white/60 transition-colors' : ''
      ]"
      @click="isCollapsed ? isCollapsed = false : null"
    >
      <div :class="['flex items-center gap-2', isCollapsed ? 'flex-col' : '']">
        <div :class="['w-2.5 h-2.5 rounded-full shadow-sm', getStatusColor(status)]"></div>
        <h3 :class="[
          'font-extrabold text-slate-700 capitalize tracking-tight',
          isCollapsed ? 'vertical-text mt-4' : ''
        ]">
          {{ title }}
        </h3>
        <span :class="[
          'px-2 py-0.5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold shadow-inner',
          isCollapsed ? 'mt-2' : 'ml-2'
        ]">
          {{ tickets.length }}
        </span>
      </div>

      <div v-if="isCollapsed" class="mt-auto">
        <Maximize2 :size="16" class="text-slate-400" />
      </div>

      <div v-if="!isCollapsed" class="relative">
        <button 
          @click.stop="showMenu = !showMenu"
          class="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors shadow-sm"
        >
          <MoreVertical :size="16" />
        </button>

        <!-- Dropdown Menu -->
        <div v-if="showMenu" class="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-2 overflow-hidden">
          <div class="px-2 py-1 mb-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort By</span>
          </div>
          <button @click="toggleSort('priority')" :class="['w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors', sortBy === 'priority' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50']">
            <ArrowUpDown :size="14" /> Priority
          </button>
          <button @click="toggleSort('deadline')" :class="['w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors', sortBy === 'deadline' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50']">
            <Clock :size="14" /> Deadline
          </button>
          <button @click="toggleSort('createdAt')" :class="['w-full flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors', sortBy === 'createdAt' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50']">
            <Calendar :size="14" /> Date Created
          </button>
          
          <div class="h-px bg-slate-100 my-1"></div>
          
          <button @click.stop="isCollapsed = !isCollapsed; showMenu = false" class="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <template v-if="isCollapsed">
              <Maximize2 :size="14" /> Expand
            </template>
            <template v-else>
              <Minimize2 :size="14" /> Collapse
            </template>
          </button>
        </div>
      </div>
    </div>

    <!-- Column Content -->
    <div v-if="!isCollapsed" class="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar bg-transparent">
      <transition-group 
        name="list" 
        tag="div"
        class="min-h-[100px] pb-10"
      >
        <KanbanCard 
          v-for="ticket in sortedTickets" 
          :key="ticket.id" 
          :ticket="ticket" 
        />
      </transition-group>
      
      <div v-if="tickets.length === 0" class="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs gap-3">
        <div class="p-3 bg-white rounded-full shadow-sm">
          <Maximize2 :size="24" class="opacity-20" />
        </div>
        <p class="font-medium">No tickets in this status</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.5);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
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

