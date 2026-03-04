<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import TicketList from './components/TicketList.vue'
import TicketForm from './components/TicketForm.vue'
import TicketEditModal from './components/TicketEditModal.vue'
import TicketComments from './components/TicketComments.vue'
import AuditLog from './components/AuditLog.vue' 
import { auditStore } from './store/auditStore' 
import type { Ticket } from '../../shared/types'
import { Plus, RefreshCw, Undo2, X } from 'lucide-vue-next'

const currentView = ref<'dashboard' | 'kanban' | 'audit'>('kanban')
const theme = ref<'light' | 'dark'>('light')
const showTicketForm = ref(false)
const editingTicket = ref<Ticket | null>(null)
const commentingTicket = ref<Ticket | null>(null)
const tickets = ref<Ticket[]>([])
const backuptickets = ref<Ticket[]>([])
const isRefreshing = ref(false)

const toastState = ref<{
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  timeoutId: ReturnType<typeof setTimeout> | null;
}>({
  visible: false,
  message: '',
  type: 'success',
  timeoutId: null
})

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  if (toastState.value.timeoutId) {
    clearTimeout(toastState.value.timeoutId)
  }
  
  toastState.value.visible = true
  toastState.value.message = message
  toastState.value.type = type
  
  toastState.value.timeoutId = setTimeout(() => {
    toastState.value.visible = false
  }, 3000)
}

const undoState = ref<{
  visible: boolean;
  message: string;
  timeLeft: number;
  intervalId: ReturnType<typeof setInterval> | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  undoAction: (() => void) | null;
}>({
  visible: false,
  message: '',
  timeLeft: 5,
  intervalId: null,
  timeoutId: null,
  undoAction: null
})

const showUndoMessage = (message: string, onCommit: () => void, onUndo: () => void) => {
  if (undoState.value.timeoutId) {
    clearTimeout(undoState.value.timeoutId)
    // Якщо був попередній незбережений стейт – комітимо його
    // Для простоти, в поточній реалізації припускаємо одне збереження за раз
  }
  if (undoState.value.intervalId) {
    clearInterval(undoState.value.intervalId)
  }
  
  undoState.value.visible = true
  undoState.value.message = message
  undoState.value.timeLeft = 5
  undoState.value.undoAction = onUndo

  undoState.value.intervalId = setInterval(() => {
    undoState.value.timeLeft--
    if (undoState.value.timeLeft <= 0) {
      if (undoState.value.intervalId) clearInterval(undoState.value.intervalId)
    }
  }, 1000)
  
  undoState.value.timeoutId = setTimeout(() => {
    undoState.value.visible = false
    if (undoState.value.intervalId) clearInterval(undoState.value.intervalId)
    undoState.value.undoAction = null
    onCommit()
  }, 5000)
}

const cancelUndo = () => {
  if (undoState.value.timeoutId) {
    clearTimeout(undoState.value.timeoutId)
    undoState.value.timeoutId = null
  }
  if (undoState.value.intervalId) {
    clearInterval(undoState.value.intervalId)
    undoState.value.intervalId = null
  }
  
  if (undoState.value.undoAction) {
    undoState.value.undoAction()
  }
  
  undoState.value.visible = false
  undoState.value.undoAction = null
}

const setView = (view: 'dashboard' | 'kanban' | 'audit') => {
  currentView.value = view
}

const refreshTickets = async () => {
  isRefreshing.value = true
  try {
    tickets.value = await window.api.getTickets()
  } catch (error) {
    console.error('Failed to reload tickets:', error)
  } finally {
    setTimeout(() => { isRefreshing.value = false }, 500)
  }
}

const applyTheme = (nextTheme: 'light' | 'dark') => {
  theme.value = nextTheme
  document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  document.documentElement.style.colorScheme = nextTheme
  localStorage.setItem('theme', nextTheme)
}

const getPreferredTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : systemPrefersDark ? 'dark' : 'light'
}

const toggleTheme = () => {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

if (typeof window !== 'undefined') {
  applyTheme(getPreferredTheme())
}

onMounted(async () => {
  applyTheme(getPreferredTheme())

  try {
    tickets.value = await window.api.getTickets()
  } catch (error) {
    console.error('Failed to load tickets:', error)
  }

  if (window.api.onOpenAddTicket) {
    window.api.onOpenAddTicket(() => {
      showTicketForm.value = true
    })
  }
  
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const handleKeyDown = (e: KeyboardEvent) => {
  // Ctrl + N for New Ticket
  if (e.ctrlKey && e.code === 'KeyN') {
    e.preventDefault()
    showTicketForm.value = true
  }
  // Ctrl + T for Theme Toggle
  if (e.ctrlKey && e.code === 'KeyT') {
    e.preventDefault()
    toggleTheme()
  }
  // F5 for Refresh
  if (e.code === 'F5') {
    e.preventDefault()
    refreshTickets()
  }
}

const handleMoveTicket = async (ticketId: string, newStatus: Ticket['status']) => {
  const ticketIndex = tickets.value.findIndex(t => t.id === ticketId)
  if (ticketIndex !== -1) {
    const oldStatus = tickets.value[ticketIndex].status
    const updatedTicket = { ...tickets.value[ticketIndex], status: newStatus, updatedAt: new Date().toISOString() }

    try {
      tickets.value = await window.api.saveTicket(updatedTicket)
      await auditStore.addLog(ticketId, `Змінено статус: ${oldStatus} -> ${newStatus}`)
    } catch (error) {
      console.error('Failed to save ticket:', error)
    }
  }
}

const handleTicketCreated = async (updatedTickets: Ticket[]) => {
  const newTicket = updatedTickets.find(nt => !tickets.value.some(t => t.id === nt.id))
  
  backuptickets.value = [...tickets.value]
  tickets.value = updatedTickets
  showTicketForm.value = false

  // Миттєве збереження для нового тікета
  if (newTicket) {
    await auditStore.addLog(newTicket.id, 'Створено новий тікет')
    await window.api.saveTicket(newTicket)
    showToast('Тікет успішно створено!', 'success')
  }
}

const handleTicketEdited = async (updatedTickets: Ticket[]) => {
  const ticketId = editingTicket.value?.id
  const wasDeleted = !updatedTickets.some(t => t.id === ticketId)
  const previousTicketState = tickets.value.find(t => t.id === ticketId)
  
  backuptickets.value = [...tickets.value]
  tickets.value = updatedTickets
  editingTicket.value = null
  
  const msg = wasDeleted ? 'Тікет видалено' : 'Тікет оновлено'
  
  showUndoMessage(
    msg,
    async () => {
      // Commit
      if (ticketId) {
        if (wasDeleted) {
          await auditStore.addLog(ticketId, 'Видалено тікет')
        } else {
          await auditStore.addLog(ticketId, 'Відредаговано дані тікета')
        }
      }
    },
    async () => {
      // Undo
      tickets.value = [...backuptickets.value]
      if (wasDeleted && previousTicketState) {
         await window.api.saveTicket(previousTicketState)
      } else if (!wasDeleted && previousTicketState) {
         await window.api.saveTicket(previousTicketState)
      }
    }
  )
}

const openEditModal = (ticketId: string) => {
  const ticket = tickets.value.find(t => t.id === ticketId)
  if (ticket) {
    editingTicket.value = ticket
  }
}

const openCommentsModal = (ticketId: string) => {
  const ticket = tickets.value.find(t => t.id === ticketId)
  if (ticket) {
    commentingTicket.value = ticket
  }
}
</script>

<template>
  <div class="flex h-dvh w-full min-h-0 overflow-hidden bg-app-bg text-app-text transition-colors font-sans">
    
    <Sidebar 
      :current-view="currentView" 
      :theme="theme" 
      @set-view="setView" 
      @toggle-theme="toggleTheme" 
    />
    
    <main class="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      
      <template v-if="currentView === 'dashboard'">
        <header class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Табличний перегляд тікетів</h1>
            <p class="text-app-muted">Швидкий пошук та перегляд тікетів у таблиці.</p>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="refreshTickets"
              class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Оновити дані [F5]"
            >
              <RefreshCw :size="16" :class="{ 'animate-spin': isRefreshing }" />
              Оновити
            </button>
            <button 
              @click="showTicketForm = true"
              class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95"
              title="Новий тікет [Ctrl+N]"
            >
              <Plus :size="18" /> Новий тікет
            </button>
          </div>
        </header>
        <TicketList :tickets="tickets" />
      </template>

      <template v-else-if="currentView === 'kanban'">
        <section class="flex h-full flex-col">
          <header class="mb-6 flex items-start justify-between">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Панель канбан</h1>
              <p class="text-app-muted">Керуйте статусами тікетів та відстежуйте SLA.</p>
            </div>
            <div class="flex items-center gap-3">
              <button 
                @click="refreshTickets"
                class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                title="Оновити дані [F5]"
              >
                <RefreshCw :size="16" :class="{ 'animate-spin': isRefreshing }" />
                Оновити
              </button>
            </div>
          </header>

          <div class="min-h-0 flex-1">
            <KanbanBoard
              :tickets="tickets"
              @move-ticket="handleMoveTicket"
              @open-ticket-form="showTicketForm = true"
              @edit-ticket="openEditModal"
              @open-comments="openCommentsModal"
            />
          </div>
        </section>
      </template>

      <template v-else-if="currentView === 'audit'">
        <AuditLog />
      </template>

      <TicketForm 
        v-if="showTicketForm" 
        @close="showTicketForm = false" 
        @submit="handleTicketCreated" 
      />
      
      <TicketEditModal
        v-if="editingTicket"
        :ticket="editingTicket"
        :tickets="tickets"
        @close="editingTicket = null"
        @submit="handleTicketEdited"
      />

      <TicketComments
        v-if="commentingTicket"
        :ticketId="commentingTicket.id"
        :ticketTitle="commentingTicket.title"
        @close="commentingTicket = null"
      />

      <!-- Toast Notification -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-[-10px] opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-[-10px] opacity-0"
      >
        <div 
          v-if="toastState.visible"
          class="fixed top-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-3.5 text-sm font-medium shadow-xl z-[300]"
          :class="{
            'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/50 dark:text-green-300': toastState.type === 'success',
            'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300': toastState.type === 'error',
            'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300': toastState.type === 'info',
          }"
        >
          <span>{{ toastState.message }}</span>
          <button @click="toastState.visible = false; clearTimeout(toastState.timeoutId!)" class="ml-2 hover:opacity-75 transition-opacity">
            <X :size="16" />
          </button>
        </div>
      </Transition>

      <!-- Undo Snackbar -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-y-10 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-10 opacity-0"
      >
        <div 
          v-if="undoState.visible"
          class="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-800 shadow-2xl z-[200] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <span class="flex items-center gap-2">
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
              {{ undoState.timeLeft }}
            </span>
            {{ undoState.message }}
          </span>
          <div class="h-5 w-px bg-slate-200 dark:bg-slate-600"></div>
          <button 
            @click="cancelUndo()"
            class="flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-500 transition-colors uppercase tracking-wider text-xs dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Undo2 :size="16" /> Скасувати
          </button>
          <button @click="undoState.visible = false; clearTimeout(undoState.timeoutId!); clearInterval(undoState.intervalId!)" class="ml-1 text-slate-400 hover:text-slate-500 hover:bg-slate-100 p-1 rounded-md transition-colors dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-300">
            <X :size="16" />
          </button>
        </div>
      </Transition>
    </main>
  </div>
</template>
