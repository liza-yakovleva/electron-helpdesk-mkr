<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Ticket } from '../../../shared/types'
import { MessageSquare } from 'lucide-vue-next'

const props = defineProps<{
  ticket: Ticket
}>()

const emit = defineEmits<{
  (e: 'edit-ticket', ticketId: string): void
  (e: 'open-comments', ticketId: string): void
}>()

const commentCount = ref(0)
onMounted(async () => {
  try {
    const comments = await window.api.getComments(props.ticket.id)
    commentCount.value = comments.length
  } catch (error) {
    console.error('Failed to load comment count', error)
  }
})

const slaStatus = computed(() => {
  const now = new Date()
  const deadlineDate = new Date(props.ticket.deadline)
  const diff = deadlineDate.getTime() - now.getTime()

  if (diff < 0) return 'overdue'
  if (diff < 12 * 60 * 60 * 1000) return 'urgent'
  return 'on-track'
})

const slaLabel = computed(() => {
  if (slaStatus.value === 'overdue') return 'Протерміновано'
  if (slaStatus.value === 'urgent') return 'Скоро термін'
  return 'Вчасно'
})

const priorityClass = computed(() => {
  switch (props.ticket.priority) {
    case 'urgent':
      return 'text-red-600 bg-red-100 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30'
    case 'high':
      return 'text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30'
    case 'medium':
      return 'text-amber-600 bg-amber-100 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
    default:
      return 'text-green-600 bg-green-100 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30'
  }
})

const slaClass = computed(() => {
  switch (slaStatus.value) {
    case 'overdue':
      return 'bg-red-500 text-white dark:bg-red-600'
    case 'urgent':
      return 'bg-amber-500 text-white dark:bg-amber-600'
    case 'on-track':
      return 'bg-emerald-500 text-white dark:bg-emerald-600'
    default:
      return 'bg-slate-500 text-white dark:bg-slate-600'
  }
})

const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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
    class="group mb-3 cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/50"
  >
    <div class="mb-2 flex items-start justify-between">
      <span
        class="font-mono text-xs font-bold text-slate-400 transition-colors group-hover:text-blue-600 dark:text-slate-500"
      >
        {{ ticket.id }}
      </span>
      <span
        :class="[
          'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
          priorityClass
        ]"
      >
        {{
          ticket.priority === 'low'
            ? 'Низький'
            : ticket.priority === 'medium'
              ? 'Середній'
              : ticket.priority === 'high'
                ? 'Високий'
                : 'Терміновий'
        }}
      </span>
    </div>

    <h4 class="mb-1 line-clamp-2 font-bold text-slate-800 dark:text-slate-100">
      {{ ticket.title }}
    </h4>

    <p class="mb-3 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
      {{ ticket.description }}
    </p>

    <div
      class="mt-auto flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-800"
    >
      <div class="flex items-center gap-2">
        <div
          v-if="ticket.assignee"
          class="flex h-6 w-6 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-[10px] font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-200"
        >
          {{ ticket.assignee.substring(0, 2).toUpperCase() }}
        </div>
        <div
          v-else
          class="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-100 text-[10px] font-bold text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500"
        >
          ?
        </div>
        <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {{ ticket.assignee || 'Не призначено' }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click.stop="emit('open-comments', ticket.id)"
          class="flex items-center gap-1.5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10"
          title="Коментарі"
        >
          <MessageSquare :size="14" />
          <span v-if="commentCount > 0" class="text-[10px] font-bold leading-none">{{ commentCount }}</span>
        </button>

        <div
          :class="[
            'flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-bold uppercase shadow-sm',
            slaClass
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {{ slaLabel }}
        </div>
      </div>
    </div>

    <div class="mt-2 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
      <span>Термін: {{ formatDate(ticket.deadline) }}</span>
    </div>
  </div>
</template>
