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
// safe button
const submitForm = async () => {
  if (!validate()) return
  
  isSubmitting.value = true
  
  const now = new Date().toISOString()
  
  // Format deadline to proper ISO string if it comes from datetime-local
  const deadlineDate = new Date(form.deadline)
  
  const newTicket: Ticket = {
    // Generate unique ID as requested: INC- + random digits
    id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
    title: form.title.trim(),
    description: form.description.trim(),
    status: 'new', // always 'new' for new tickets
    priority: form.priority,
    category: form.category,
    creator: 'Current User', // Placeholder since there isn't an auth user provided
    assignee: form.assignee.trim(),
    createdAt: now,
    updatedAt: now,
    deadline: deadlineDate.toISOString()
  }
  
  try {
    // @ts-ignore - window.api is injected via IPC
    const updatedTickets = await window.api.saveTicket(newTicket)
    
    // Reset form states
    form.title = ''
    form.description = ''
    form.assignee = 'admin'
    form.deadline = ''
    form.priority = 'low'
    form.category = 'other'
    
    emit('submit', updatedTickets)
  } catch (error) {
    console.error('Failed to save ticket:', error)
    // Could display an error banner to user here
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Header -->
      <div class="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
        <div>
          <h2 class="text-xl font-bold text-slate-800">New Ticket</h2>
          <p class="text-sm text-slate-500 mt-1">Fill out the details below to create a support request.</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Body / Form -->
      <div class="p-6 overflow-y-auto flex-1 bg-slate-50/50">
        <form @submit.prevent="submitForm" class="space-y-5">
          
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Title <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.title" 
              type="text" 
              :class="[
                'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 bg-white', 
                errors.title 
                  ? 'border-red-300 text-red-900 focus:ring-red-200 placeholder-red-300' 
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500 placeholder-slate-400'
              ]"
              placeholder="Brief summary of the issue (e.g., Cannot access email)"
            />
            <p v-if="errors.title" class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Title cannot be empty
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Description <span class="text-red-500">*</span>
            </label>
            <textarea 
              v-model="form.description" 
              rows="4"
              :class="[
                'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 resize-none bg-white', 
                errors.description 
                  ? 'border-red-300 text-red-900 focus:ring-red-200 placeholder-red-300' 
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500 placeholder-slate-400'
              ]"
              placeholder="Provide more details about the problem (minimum 10 characters)..."
            ></textarea>
            <p v-if="errors.description" class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Description must be at least 10 characters long
            </p>
          </div>

          <!-- Assignee -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Assignee <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.assignee" 
              type="text" 
              :class="[
                'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 bg-white', 
                errors.assignee 
                  ? 'border-red-300 text-red-900 focus:ring-red-200 placeholder-red-300' 
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500 placeholder-slate-400'
              ]"
              placeholder="Assign to..."
            />
            <p v-if="errors.assignee" class="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Assignee cannot be empty
            </p>
          </div>

          <!-- Grid for Priority & Category -->
          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select 
                v-model="form.priority" 
                class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white shadow-sm transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                v-model="form.category" 
                class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white shadow-sm transition-colors"
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
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Deadline <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.deadline" 
              type="datetime-local" 
              :class="[
                'w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 bg-white', 
                errors.deadline 
                  ? 'border-red-300 text-red-900 focus:ring-red-200' 
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500'
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
      <div class="p-5 border-t border-slate-200 bg-white flex justify-end gap-3">
        <button 
          @click="emit('close')" 
          type="button"
          class="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="submitForm" 
          :disabled="isSubmitting"
          class="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
        >
          <span v-if="isSubmitting" class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          {{ isSubmitting ? 'Saving...' : 'Save Ticket' }}
        </button>
      </div>
    </div>
  </div>
</template>
