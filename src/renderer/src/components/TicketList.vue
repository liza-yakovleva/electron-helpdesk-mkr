<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Ticket } from '../../../shared/types'
import { MessageSquare } from 'lucide-vue-next' 
import TicketComments from './TicketComments.vue' 

const props = defineProps<{
  tickets: Ticket[]
}>()

const showCommentsModal = ref(false)

const searchQuery = ref('')
const selectedPriority = ref<'all' | Ticket['priority']>('all')
const selectedStatus = ref<'all' | Ticket['status']>('all')

const statuses: Ticket['status'][] = ['new', 'open', 'pending', 'solved', 'closed']
const priorities: Ticket['priority'][] = ['low', 'medium', 'high', 'urgent']

const filteredTickets = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return props.tickets.filter(ticket => {
    const matchesSearch =
      !query ||
      ticket.title.toLowerCase().includes(query) ||
      ticket.id.toLowerCase().includes(query)
    const matchesPriority =
      selectedPriority.value === 'all' || ticket.priority === selectedPriority.value
    const matchesStatus =
      selectedStatus.value === 'all' || ticket.status === selectedStatus.value

    return matchesSearch && matchesPriority && matchesStatus
  })
})

const formatCreatedAt = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="grid gap-3 md:grid-cols-3">
        <input
          v-model="searchQuery"
          placeholder="Пошук за назвою або ID..."
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-blue-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400"
        />

        <select
          v-model="selectedPriority"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm capitalize text-slate-800 outline-none transition-colors focus:border-blue-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400"
        >
          <option value="all">Всі пріоритети</option>
          <option
            v-for="priority in priorities"
            :key="priority"
            :value="priority"
            class="capitalize"
          >
            {{ priority }}
          </option>
        </select>

        <select
          v-model="selectedStatus"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm capitalize text-slate-800 outline-none transition-colors focus:border-blue-500 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400"
        >
          <option value="all">Всі статуси</option>
          <option
            v-for="status in statuses"
            :key="status"
            :value="status"
            class="capitalize"
          >
            {{ status }}
          </option>
        </select>
      </div>
    </div>

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse text-left text-sm">
          <thead class="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <tr>
              <th class="border-b border-slate-200 px-4 py-3 font-semibold dark:border-slate-700">ID</th>
              <th class="border-b border-slate-200 px-4 py-3 font-semibold dark:border-slate-700">Заголовок</th>
              <th class="border-b border-slate-200 px-4 py-3 font-semibold dark:border-slate-700">Статус</th>
              <th class="border-b border-slate-200 px-4 py-3 font-semibold dark:border-slate-700">Пріоритет</th>
              <th class="border-b border-slate-200 px-4 py-3 font-semibold dark:border-slate-700">Дата створення</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              class="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <td class="border-b border-slate-200 px-4 py-3 font-mono text-xs dark:border-slate-700">{{ ticket.id }}</td>
              <td class="border-b border-slate-200 px-4 py-3 font-medium text-slate-900 dark:border-slate-700 dark:text-slate-100">
                {{ ticket.title }}
              </td>
              <td class="border-b border-slate-200 px-4 py-3 capitalize dark:border-slate-700">{{ ticket.status }}</td>
              <td class="border-b border-slate-200 px-4 py-3 capitalize dark:border-slate-700">{{ ticket.priority }}</td>
              <td class="border-b border-slate-200 px-4 py-3 text-slate-600 dark:border-slate-700 dark:text-slate-400">
                {{ formatCreatedAt(ticket.createdAt) }}
              </td>
            </tr>
            <tr v-if="filteredTickets.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                За поточними фільтрами тікетів не знайдено.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

