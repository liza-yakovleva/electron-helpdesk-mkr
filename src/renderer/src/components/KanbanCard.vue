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
    case 'urgent': return 'text-red-600 bg-red-50 border-red-100';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-100';
    case 'medium': return 'text-blue-600 bg-blue-50 border-blue-100';
    case 'low': return 'text-slate-500 bg-slate-50 border-slate-100';
    default: return 'text-slate-500 bg-slate-50 border-slate-100';
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
    class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3 group"
  >
    <div class="flex justify-between items-start mb-2">
      <span class="text-xs font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
        {{ ticket.id }}
      </span>
      <span :class="['text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider', priorityClass]">
        {{ ticket.priority }}
      </span>
    </div>

    <h4 class="font-bold text-slate-800 mb-1 line-clamp-2">
      {{ ticket.title }}
    </h4>
    
    <p class="text-xs text-slate-500 mb-3 line-clamp-2">
      {{ ticket.description }}
    </p>

    <div class="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
      <div class="flex items-center gap-2">
        <div v-if="ticket.assignee" class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 border border-blue-200">
          {{ ticket.assignee.substring(0, 2).toUpperCase() }}
        </div>
        <div v-else class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-200 border-dashed">
          ?
        </div>
        <span class="text-[11px] text-slate-500 font-medium">
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
    
    <div class="mt-2 text-[10px] text-slate-400 flex justify-between">
      <span>Deadline: {{ formatDate(ticket.deadline) }}</span>
    </div>
  </div>
</template>
