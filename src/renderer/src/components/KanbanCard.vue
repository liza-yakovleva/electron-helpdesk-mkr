<script setup lang="ts">
import { computed } from 'vue';
import { Ticket } from '../types';

const props = defineProps<{
  ticket: Ticket;
}>();

const slaStatus = computed(() => {
  const now = new Date();
  const deadlineDate = new Date(props.ticket.deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  
  if (diff < 0) return 'overdue';
  if (diff < 12 * 60 * 60 * 1000) return 'urgent'; // Less than 12 hours
  return 'on-track';
});

const slaLabel = computed(() => {
  if (slaStatus.value === 'overdue') return 'Overdue';
  if (slaStatus.value === 'urgent') return 'Due Soon';
  return 'On Track';
});

const priorityClass = computed(() => {
  switch (props.ticket.priority) {
    case 'urgent': return 'border-red-100 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300';
    case 'high': return 'border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300';
    case 'medium': return 'border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300';
    case 'low': return 'border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300';
    default: return 'border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300';
  }
});

const slaClass = computed(() => {
  switch (slaStatus.value) {
    case 'overdue': return 'bg-red-500 text-white';
    case 'urgent': return 'bg-amber-500 text-white';
    case 'on-track': return 'bg-emerald-500 text-white';
    default: return 'bg-slate-500 text-white';
  }
});

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('uk-UA', { 
    day: '2-digit', 
    month: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('ticketId', props.ticket.id);
    event.dataTransfer.effectAllowed = 'move';
  }
};
</script>

<template>
  <div 
    draggable="true"
    @dragstart="handleDragStart"
    class="group mb-3 cursor-grab rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900"
  >
    <div class="flex justify-between items-start mb-2">
      <span class="text-xs font-mono font-bold text-slate-400 transition-colors group-hover:text-blue-600 dark:text-slate-500">
        {{ ticket.id }}
      </span>
      <span :class="['text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider', priorityClass]">
        {{ ticket.priority }}
      </span>
    </div>

    <h4 class="mb-1 line-clamp-2 font-bold text-slate-800 dark:text-slate-100">
      {{ ticket.title }}
    </h4>
    
    <p class="mb-3 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
      {{ ticket.description }}
    </p>

    <div class="mt-auto flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <div v-if="ticket.assignee" class="flex h-6 w-6 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-[10px] font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-200">
          {{ ticket.assignee.substring(0, 2).toUpperCase() }}
        </div>
        <div v-else class="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-100 text-[10px] font-bold text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500">
          ?
        </div>
        <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {{ ticket.assignee || 'Unassigned' }}
        </span>
      </div>

      <div :class="['flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm', slaClass]">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ slaLabel }}
      </div>
    </div>
    
    <div class="mt-2 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
      <span>Deadline: {{ formatDate(ticket.deadline) }}</span>
    </div>
  </div>
</template>
