<script setup lang="ts">
import { ref, reactive } from 'vue'
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
  deadlineMsg: 'Please specify a valid deadline'
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
      errors.deadline = true; errors.deadlineMsg = 'Deadline must be in the future'; isValid = false
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
    creator: 'Current User',
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
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
    <div class="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:ring-white/10">
      <div class="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-6 py-5 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300">
            New ticket
          </div>
          <h2 class="text-xl font-extrabold tracking-tight">Create Service Request</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Заповніть ключові дані, щоб команда швидко взяла задачу в роботу.</p>
        </div>
        <button @click="emit('close')" class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"><X :size="20" /></button>
      </div>

      <div class="max-h-[65vh] overflow-y-auto bg-slate-50/70 p-6 dark:bg-slate-950/40">
        <form @submit.prevent="submitForm" class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Title <span class="text-red-500">*</span></label>
            <input v-model="form.title" type="text" placeholder="Наприклад: Не працює VPN" :class="['w-full rounded-xl border bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-slate-100', errors.title ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-600 dark:focus:border-blue-400 dark:focus:ring-blue-500/20']" />
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Description <span class="text-red-500">*</span></label>
            <textarea v-model="form.description" rows="3" placeholder="Опишіть проблему, кроки відтворення та вплив" :class="['w-full resize-none rounded-xl border bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-slate-100', errors.description ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-600 dark:focus:border-blue-400 dark:focus:ring-blue-500/20']"></textarea>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Assignee <span class="text-red-500">*</span></label>
            <input v-model="form.assignee" type="text" class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Priority</label>
              <select v-model="form.priority" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Category</label>
              <select v-model="form.category" class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20">
                <option value="hardware">Hardware</option><option value="software">Software</option><option value="network">Network</option><option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Deadline <span class="text-red-500">*</span></label>
            <input v-model="form.deadline" type="datetime-local" :class="['w-full rounded-xl border bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-slate-100', errors.deadline ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100 dark:border-slate-600 dark:focus:border-blue-400 dark:focus:ring-blue-500/20']" />
          </div>
        </form>
      </div>

      <div class="flex justify-end gap-3 border-t border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <button @click="emit('close')" class="rounded-xl border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
        <button @click="submitForm" :disabled="isSubmitting" class="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-colors hover:bg-blue-700 disabled:opacity-50">
          {{ isSubmitting ? 'Saving...' : 'Save Ticket' }}
        </button>
      </div>
    </div>
  </div>
</template>
