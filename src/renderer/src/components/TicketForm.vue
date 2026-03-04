<script setup lang="ts">
import { ref, reactive } from 'vue'
import { X } from 'lucide-vue-next'
import type { Ticket, TicketPriority, TicketCategory } from '../../../shared/types'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', tickets: Ticket[]): void
}>()

const form = reactive({
  title: '',
  description: '',
  assignee: 'admin',
  priority: 'low' as TicketPriority,
  category: 'other' as TicketCategory,
  deadline: ''
})

const errors = reactive({
  title: false,
  description: false,
  assignee: false,
  deadline: false,
  deadlineMsg: 'Будь ласка, вкажіть коректний термін'
})

const isSubmitting = ref(false)

const validate = () => {
  let isValid = true
  if (!form.title.trim()) { errors.title = true; isValid = false } else { errors.title = false }
  if (form.description.trim().length < 10) { errors.description = true; isValid = false } else { errors.description = false }
  if (!form.assignee.trim()) { errors.assignee = true; isValid = false } else { errors.assignee = false }
  if (!form.deadline) {
    errors.deadline = true; isValid = false
  } else {
    const deadlineDate = new Date(form.deadline)
    if (deadlineDate <= new Date()) {
      errors.deadline = true; errors.deadlineMsg = 'Термін має бути в майбутньому'; isValid = false
    } else { errors.deadline = false }
  }
  return isValid
}

const submitForm = async () => {
  if (!validate()) return
  isSubmitting.value = true
  
  const newTicket: Ticket = {
    id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
    title: form.title.trim(),
    description: form.description.trim(),
    status: 'new',
    priority: form.priority,
    category: form.category,
    creator: 'Поточний користувач',
    assignee: form.assignee.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deadline: new Date(form.deadline).toISOString()
  }
  
  try {
    const updatedTickets = await window.api.saveTicket(newTicket)
    emit('submit', updatedTickets)
  } catch (error) {
    console.error('Save failed:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-slate-900/50 p-4 z-[100] backdrop-blur-sm">
    <div class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl animate-in fade-in zoom-in-95 duration-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <div class="flex items-center justify-between border-b border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <h2 class="text-xl font-bold">Новий тікет</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Заповніть деталі нижче.</p>
        </div>
        <button @click="emit('close')" class="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"><X :size="20" /></button>
      </div>

      <div class="flex-1 overflow-y-auto bg-slate-50/50 p-6 dark:bg-slate-950/40">
        <form @submit.prevent="submitForm" class="space-y-4 text-left">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Заголовок <span class="text-red-500">*</span></label>
            <input v-model="form.title" type="text" :class="['w-full rounded-lg border bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500', errors.title ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500 dark:border-slate-600 dark:focus:border-blue-400']" placeholder="Короткий опис проблеми" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Опис <span class="text-red-500">*</span></label>
            <textarea v-model="form.description" rows="3" :class="['w-full rounded-lg border bg-white px-4 py-2 text-sm text-slate-900 resize-none outline-none transition-colors placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500', errors.description ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500 dark:border-slate-600 dark:focus:border-blue-400']" placeholder="Детально опишіть проблему..."></textarea>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Виконавець <span class="text-red-500">*</span></label>
            <input v-model="form.assignee" type="text" :class="['w-full rounded-lg border bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500', errors.assignee ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500 dark:border-slate-600 dark:focus:border-blue-400']" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Пріоритет</label>
              <select v-model="form.priority" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400">
                <option value="low">Низький</option><option value="medium">Середній</option><option value="high">Високий</option><option value="urgent">Терміновий</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Категорія</label>
              <select v-model="form.category" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400">
                <option value="hardware">Залізо</option><option value="software">Софт</option><option value="network">Мережа</option><option value="other">Інше</option>
              </select>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Термін <span class="text-red-500">*</span></label>
            <input v-model="form.deadline" type="datetime-local" :class="['w-full rounded-lg border bg-white px-4 py-2 text-sm text-slate-900 outline-none transition-colors dark:bg-slate-800 dark:text-slate-100', errors.deadline ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-blue-500 dark:border-slate-600 dark:focus:border-blue-400']" />
            <p v-if="errors.deadline" class="mt-1 text-xs text-red-500">{{ errors.deadlineMsg }}</p>
          </div>
        </form>
      </div>

      <div class="flex justify-end gap-3 border-t border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <button @click="emit('close')" class="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">Скасувати</button>
        <button @click="submitForm" :disabled="isSubmitting" class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {{ isSubmitting ? 'Збереження...' : 'Створити тікет' }}
        </button>
      </div>
    </div>
  </div>
</template>

