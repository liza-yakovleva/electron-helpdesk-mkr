<script setup lang="ts">
import { computed, ref } from 'vue' 
import type { Ticket } from '../../../shared/types'
import { MessageSquare } from 'lucide-vue-next'
import TicketComments from './TicketComments.vue'

const props = defineProps<{
  ticket: Ticket
}>()

const showCommentsModal = ref(false) 

const emit = defineEmits<{
  (e: 'edit-ticket', ticketId: string): void
}>()

const priorityClass = computed(() => {
  switch (props.ticket.priority) {
    case 'urgent': return 'text-red-600 border-red-200 bg-red-100'
    case 'high': return 'text-orange-600 border-orange-200 bg-orange-100'
    case 'medium': return 'text-amber-600 border-amber-200 bg-amber-100'
    default: return 'text-green-600 border-green-200 bg-green-100'
  }
})

const slaLabel = computed(() => {
  const now = new Date()
  const deadlineDate = new Date(props.ticket.deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  if (diff < 0) return 'Overdue'
  if (diff < 12 * 60 * 60 * 1000) return 'Urgent'
  return 'On track'
})

const slaClass = computed(() => {
  const lbl = slaLabel.value.toLowerCase()
  if (lbl === 'overdue') return 'bg-red-100 text-red-700'
  if (lbl === 'urgent') return 'bg-amber-100 text-amber-700'
  return 'bg-green-100 text-green-700'
})

const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const handleDragStart = (e: DragEvent) => {
  e.dataTransfer?.setData('ticketId', props.ticket.id)
}
</script>

<template>
  <div 
    draggable="true"
    @dragstart="handleDragStart"
    @click="emit('edit-ticket', ticket.id)"
    class="group mb-3 cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-300 active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/50"
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

      <div class="flex items-center gap-2">
        <button 
          @click.stop="showCommentsModal = true"
          class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Коментарі"
        >
          <MessageSquare :size="14" />
        </button>

        <div :class="['flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm', slaClass]">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {{ slaLabel }}
        </div>
      </div>
    </div>
    
    <div class="mt-2 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
      <span>Deadline: {{ formatDate(ticket.deadline) }}</span>
    </div>
    <TicketComments 
      v-if="showCommentsModal" 
      :ticketId="ticket.id"
      :ticketTitle="ticket.title" 
      @close="showCommentsModal = false" 
    />
  </div>
</template>