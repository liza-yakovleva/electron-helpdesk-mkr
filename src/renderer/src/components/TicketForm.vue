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
  <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 text-slate-900">
      <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
        <div>
          <h2 class="text-xl font-bold">New Ticket</h2>
          <p class="text-sm text-slate-500 mt-1">Fill out the details below.</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 p-2"><X :size="20" /></button>
      </div>

      <div class="p-6 overflow-y-auto flex-1 bg-slate-50/50">
        <form @submit.prevent="submitForm" class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium mb-1">Title <span class="text-red-500">*</span></label>
            <input v-model="form.title" type="text" :class="['w-full rounded-lg border px-4 py-2 text-sm', errors.title ? 'border-red-500' : 'border-slate-300']" />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description <span class="text-red-500">*</span></label>
            <textarea v-model="form.description" rows="3" :class="['w-full rounded-lg border px-4 py-2 text-sm resize-none', errors.description ? 'border-red-500' : 'border-slate-300']"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Assignee <span class="text-red-500">*</span></label>
            <input v-model="form.assignee" type="text" class="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Priority</label>
              <select v-model="form.priority" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Category</label>
              <select v-model="form.category" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
                <option value="hardware">Hardware</option><option value="software">Software</option><option value="network">Network</option><option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Deadline <span class="text-red-500">*</span></label>
            <input v-model="form.deadline" type="datetime-local" :class="['w-full rounded-lg border px-4 py-2 text-sm', errors.deadline ? 'border-red-500' : 'border-slate-300']" />
          </div>
        </form>
      </div>

      <div class="p-5 border-t border-slate-200 bg-white flex justify-end gap-3">
        <button @click="emit('close')" class="px-5 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
        <button @click="submitForm" :disabled="isSubmitting" class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {{ isSubmitting ? 'Saving...' : 'Save Ticket' }}
        </button>
      </div>
    </div>
  </div>
</template>