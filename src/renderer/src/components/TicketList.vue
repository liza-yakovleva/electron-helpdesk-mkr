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
    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="grid gap-3 md:grid-cols-3">
        <input
          v-model="searchQuery"
          placeholder="Пошук за назвою або ID..."
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500"
        />

        <select
          v-model="selectedPriority"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm capitalize outline-none transition-colors focus:border-blue-500"
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
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm capitalize outline-none transition-colors focus:border-blue-500"
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

    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse text-left text-sm">
          <thead class="bg-slate-100 text-slate-700">
            <tr>
              <th class="border-b border-slate-200 px-4 py-3 font-semibold">ID</th>
              <th class="border-b border-slate-200 px-4 py-3 font-semibold">Заголовок</th>
              <th class="border-b border-slate-200 px-4 py-3 font-semibold">Статус</th>
              <th class="border-b border-slate-200 px-4 py-3 font-semibold">Пріоритет</th>
              <th class="border-b border-slate-200 px-4 py-3 font-semibold">Дата створення</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticket in filteredTickets"
              :key="ticket.id"
              class="transition-colors hover:bg-slate-50"
            >
              <td class="border-b border-slate-200 px-4 py-3 font-mono text-xs">{{ ticket.id }}</td>
              <td class="border-b border-slate-200 px-4 py-3 font-medium text-slate-900">
                {{ ticket.title }}
              </td>
              <td class="border-b border-slate-200 px-4 py-3 capitalize">{{ ticket.status }}</td>
              <td class="border-b border-slate-200 px-4 py-3 capitalize">{{ ticket.priority }}</td>
              <td class="border-b border-slate-200 px-4 py-3 text-slate-600">
                {{ formatCreatedAt(ticket.createdAt) }}
              </td>
            </tr>
            <tr v-if="filteredTickets.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-slate-500">
                За поточними фільтрами тікетів не знайдено.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
