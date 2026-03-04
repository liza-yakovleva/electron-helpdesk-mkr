<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Ticket, TicketPriority, TicketCategory } from '../../../shared/types'
import { Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  ticket: Ticket;
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', tickets: Ticket[]): void
}>()

const form = reactive({
  title: props.ticket.title,
  description: props.ticket.description,
  assignee: props.ticket.assignee || '',
  priority: props.ticket.priority,
  category: props.ticket.category,
  deadline: props.ticket.deadline.slice(0, 16) 
})

const errors = reactive({
  title: false,
  description: false,
  assignee: false,
  deadline: false,
  deadlineMsg: 'Please specify a valid deadline'
})

const isSubmitting = ref(false)
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)

const validate = () => {
  let isValid = true
  
  if (!form.title.trim()) {
    errors.title = true
    isValid = false
  } else {
    errors.title = false
  }
  
  if (form.description.trim().length < 10) {
    errors.description = true
    isValid = false
  } else {
    errors.description = false
  }
  
  if (!form.assignee.trim()) {
    errors.assignee = true
    isValid = false
  } else {
    errors.assignee = false
  }
  
  if (!form.deadline) {
    errors.deadline = true
    errors.deadlineMsg = 'Please specify a deadline'
    isValid = false
  } else {
    const deadlineDate = new Date(form.deadline)
    const now = new Date()
    if (deadlineDate <= now) {
      errors.deadline = true
      errors.deadlineMsg = 'Deadline must be in the future'
      isValid = false
    } else {
      errors.deadline = false
    }
  }

  return isValid
}

const submitForm = async () => {
  if (!validate()) return
  
  isSubmitting.value = true
  
  const now = new Date().toISOString()
  const deadlineDate = new Date(form.deadline)
  
  const updatedTicket: Ticket = {
    ...props.ticket,
    title: form.title.trim(),
    description: form.description.trim(),
    priority: form.priority,
    category: form.category,
    assignee: form.assignee.trim(),
    updatedAt: now,
    deadline: deadlineDate.toISOString()
  }
  
  try {
    const updatedTickets = await window.api.saveTicket(updatedTicket)
    emit('submit', updatedTickets)
  } catch (error) {
    console.error('Failed to save ticket:', error)
  } finally {
    isSubmitting.value = false
  }
}

const deleteTicket = async () => {
  isDeleting.value = true
  try {
    const updatedTickets = await window.api.deleteTicket(props.ticket.id)
    emit('submit', updatedTickets)
  } catch (error) {
    console.error('Failed to delete ticket:', error)
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
    <div class="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl animate-in fade-in zoom-in-95 duration-200 flex flex-col dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      
      <!-- Header -->
      <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-white relative dark:border-slate-700 dark:bg-slate-900">
        <div class="absolute right-16 top-1/2 -translate-y-1/2">
           <div v-if="showDeleteConfirm" class="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 dark:bg-red-500/10 dark:border-red-500/20">
             <span class="text-xs font-medium text-red-700 dark:text-red-300">Are you sure?</span>
             <button @click="deleteTicket" :disabled="isDeleting" class="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50">Yes</button>
             <button @click="showDeleteConfirm = false" class="text-xs font-medium text-slate-600 bg-white px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700">No</button>
           </div>
           <button v-else @click="showDeleteConfirm = true" class="text-red-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 flex items-center gap-2 dark:hover:bg-red-500/10" title="Delete Ticket">
             <Trash2 :size="18" />
           </button>
        </div>

        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Ticket</h2>
            <span class="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded dark:bg-slate-800 dark:text-slate-300">{{ ticket.id }}</span>
          </div>
          <p class="text-sm text-slate-500 mt-1 dark:text-slate-400">Update the ticket information.</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Body / Form -->
      <div class="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/40">
        <form @submit.prevent="submitForm" class="space-y-4 text-left">
          
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
              Title <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.title" 
              type="text" 
              :class="[
                'w-full rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 dark:text-slate-100', 
                errors.title 
                  ? 'border-red-500 text-red-900 focus:ring-red-200 placeholder-red-300 dark:border-red-500 dark:text-red-200 dark:placeholder-red-300' 
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500 placeholder-slate-400 dark:border-slate-600 dark:focus:ring-blue-500/20 dark:focus:border-blue-400 dark:placeholder-slate-500'
              ]"
            />
            <p v-if="errors.title" class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Title cannot be empty
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
              Description <span class="text-red-500">*</span>
            </label>
            <textarea 
              v-model="form.description" 
              rows="3"
              :class="[
                'w-full rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 resize-none bg-white dark:bg-slate-800 dark:text-slate-100', 
                errors.description 
                  ? 'border-red-500 text-red-900 focus:ring-red-200 placeholder-red-300 dark:border-red-500 dark:text-red-200 dark:placeholder-red-300' 
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500 placeholder-slate-400 dark:border-slate-600 dark:focus:ring-blue-500/20 dark:focus:border-blue-400 dark:placeholder-slate-500'
              ]"
            ></textarea>
            <p v-if="errors.description" class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Description must be at least 10 characters long
            </p>
          </div>

          <!-- Assignee -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
              Assignee <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.assignee" 
              type="text" 
              :class="[
                'w-full rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 dark:text-slate-100', 
                errors.assignee 
                  ? 'border-red-500 text-red-900 focus:ring-red-200 placeholder-red-300 dark:border-red-500 dark:text-red-200 dark:placeholder-red-300' 
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500 placeholder-slate-400 dark:border-slate-600 dark:focus:ring-blue-500/20 dark:focus:border-blue-400 dark:placeholder-slate-500'
              ]"
            />
            <p v-if="errors.assignee" class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Assignee cannot be empty
            </p>
          </div>

          <!-- Grid for Priority & Category -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Priority</label>
              <select 
                v-model="form.priority" 
                class="app-select w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white shadow-sm transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500/20 dark:focus:border-blue-400"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Category</label>
              <select 
                v-model="form.category" 
                class="app-select w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white shadow-sm transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500/20 dark:focus:border-blue-400"
              >
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="network">Network</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <!-- Deadline -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
              Deadline <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.deadline" 
              type="datetime-local" 
              :class="[
                'w-full rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 dark:text-slate-100', 
                errors.deadline 
                  ? 'border-red-500 text-red-900 focus:ring-red-200 dark:border-red-500 dark:text-red-200' 
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500 dark:border-slate-600 dark:focus:ring-blue-500/20 dark:focus:border-blue-400'
              ]"
            />
            <p v-if="errors.deadline" class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {{ errors.deadlineMsg }}
            </p>
          </div>
        </form>
      </div>

      <!-- Footer/Actions -->
      <div class="p-5 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-xl dark:border-slate-700 dark:bg-slate-900">
        <button 
          @click="emit('close')" 
          type="button"
          class="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors dark:text-slate-200 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 dark:focus:ring-slate-500/30"
        >
          Cancel
        </button>
        <button 
          @click="submitForm" 
          :disabled="isSubmitting"
          class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
        >
          <span v-if="isSubmitting" class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>


