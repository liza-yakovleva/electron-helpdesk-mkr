<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Ticket, TicketPriority, TicketCategory } from '../../../shared/types'
import { Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  ticket: Ticket;
  tickets: Ticket[];
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', tickets: Ticket[]): void
}>()

const toLocalDatetimeString = (isoString: string) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

const form = reactive({
  title: props.ticket.title,
  description: props.ticket.description,
  assignee: props.ticket.assignee || '',
  priority: props.ticket.priority,
  category: props.ticket.category,
  deadline: toLocalDatetimeString(props.ticket.deadline)
})

const errors = reactive({
  title: false,
  titleMsg: '',
  description: false,
  descriptionMsg: '',
  assignee: false,
  assigneeMsg: '',
  deadline: false,
  deadlineMsg: 'Будь ласка, вкажіть коректний термін'
})

const isSubmitting = ref(false)
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)

const validate = () => {
  let isValid = true
  
  if (!form.title.trim()) {
    errors.title = true
    errors.titleMsg = 'Поле не може бути пустим'
    isValid = false
  } else {
    errors.title = false
  }
  
  if (!form.description.trim()) {
    errors.description = true
    errors.descriptionMsg = 'Поле не може бути пустим'
    isValid = false
  } else if (form.description.trim().length < 10) {
    errors.description = true
    errors.descriptionMsg = 'Опис має містити більше 10 символів'
    isValid = false
  } else {
    errors.description = false
  }
  
  if (!form.assignee.trim()) {
    errors.assignee = true
    errors.assigneeMsg = 'Поле не може бути пустим'
    isValid = false
  } else {
    errors.assignee = false
  }
  
  if (!form.deadline) {
    errors.deadline = true
    errors.deadlineMsg = 'Поле не може бути пустим'
    isValid = false
  } else {
    const deadlineDate = new Date(form.deadline)
    const now = new Date()
    if (deadlineDate <= now) {
      errors.deadline = true
      errors.deadlineMsg = 'Термін має бути в майбутньому'
      isValid = false
    } else if (deadlineDate.getFullYear() > 9999) {
      errors.deadline = true
      errors.deadlineMsg = 'Рік не може бути більше 4 цифр'
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
    const updatedTickets = props.tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t)
    emit('submit', updatedTickets)
  } catch (error) {
    console.error('Failed to update ticket locally:', error)
  } finally {
    isSubmitting.value = false
  }
}

const deleteTicket = async () => {
  isDeleting.value = true
  try {
    const updatedTickets = props.tickets.filter(t => t.id !== props.ticket.id)
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
  <div class="fixed inset-0 flex items-center justify-center bg-slate-900/50 p-4 z-[100] backdrop-blur-sm">
    <div class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl animate-in fade-in zoom-in-95 duration-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      
      <!-- Header -->
      <div class="relative flex items-center justify-between border-b border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div class="absolute right-16 top-1/2 -translate-y-1/2">
           <div v-if="showDeleteConfirm" class="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 dark:border-red-500/20 dark:bg-red-500/10">
             <span class="text-xs font-medium text-red-700 dark:text-red-300">Ви впевнені?</span>
             <button @click="deleteTicket" :disabled="isDeleting" class="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50">Так</button>
             <button @click="showDeleteConfirm = false" class="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">Ні</button>
           </div>
           <button v-else @click="showDeleteConfirm = true" class="flex items-center gap-2 rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" title="Видалити тікет">
             <Trash2 :size="18" />
           </button>
        </div>

        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Редагувати тікет</h2>
            <span class="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">{{ ticket.id }}</span>
          </div>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Оновіть інформацію про тікет.</p>
        </div>
        <button @click="emit('close')" class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Body / Form -->
      <div class="flex-1 overflow-y-auto bg-slate-50/50 p-6 dark:bg-slate-950/40">
        <form @submit.prevent="submitForm" class="space-y-4 text-left">
          
          <!-- Title -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Заголовок <span class="text-red-500">*</span>
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
            <p v-if="errors.title" class="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {{ errors.titleMsg }}
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Опис <span class="text-red-500">*</span>
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
            <p v-if="errors.description" class="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {{ errors.descriptionMsg }}
            </p>
          </div>

          <!-- Assignee -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Виконавець <span class="text-red-500">*</span>
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
            <p v-if="errors.assignee" class="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {{ errors.assigneeMsg }}
            </p>
          </div>

          <!-- Grid for Priority & Category -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Пріоритет</label>
              <select 
                v-model="form.priority" 
                class="app-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
              >
                <option value="low">Низький</option>
                <option value="medium">Середній</option>
                <option value="high">Високий</option>
                <option value="urgent">Терміновий</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Категорія</label>
              <select 
                v-model="form.category" 
                class="app-select w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
              >
                <option value="hardware">Залізо</option>
                <option value="software">Софт</option>
                <option value="network">Мережа</option>
                <option value="other">Інше</option>
              </select>
            </div>
          </div>

          <!-- Deadline -->
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Термін <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.deadline" 
              type="datetime-local" 
              max="9999-12-31T23:59"
              :class="[
                'w-full rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 dark:text-slate-100', 
                errors.deadline 
                  ? 'border-red-500 text-red-900 focus:ring-red-200 dark:border-red-500 dark:text-red-200' 
                  : 'border-slate-300 focus:ring-blue-100 focus:border-blue-500 dark:border-slate-600 dark:focus:ring-blue-500/20 dark:focus:border-blue-400'
              ]"
            />
            <p v-if="errors.deadline" class="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {{ errors.deadlineMsg }}
            </p>
          </div>
        </form>
      </div>

      <!-- Footer/Actions -->
      <div class="flex justify-end gap-3 rounded-b-xl border-t border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <button 
          @click="emit('close')" 
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-slate-500/30"
        >
          Скасувати
        </button>
        <button 
          @click="submitForm" 
          :disabled="isSubmitting"
          class="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span v-if="isSubmitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          {{ isSubmitting ? 'Збереження...' : 'Зберегти зміни' }}
        </button>
      </div>
    </div>
  </div>
</template>



