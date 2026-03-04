<script lang="ts">
import type { Comment } from '../../shared/types'
export type { Comment }
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Send, MessageSquare, Clock, X } from 'lucide-vue-next'
import { QUICK_TEMPLATES } from '../constants/templates'
import type { Comment } from '../../shared/types'
import { auditStore } from '../store/auditStore'

const props = defineProps<{
  ticketId: string
  ticketTitle: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const author = ref('Support Agent')
const text = ref('')
const comments = ref<Comment[]>([])

// Функція для швидкої відповіді
const applyTemplate = (templateText: string) => {
  text.value = templateText
}

const filteredComments = computed(() => {
  return comments.value
    .filter(c => c.ticketId === props.ticketId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

const loadComments = async () => {
  try {
    const allComments = await window.api.getComments(props.ticketId)
    comments.value = allComments
  } catch (error) {
    console.error('Помилка при завантаженні коментарів:', error)
    comments.value = []
  }
}

const addComment = async () => {
  console.log('Додаємо коментар для тікета:', props.ticketId)
  if (!text.value.trim() || !author.value.trim()) return

  const newComment: Comment = {
    id: Date.now().toString(),
    ticketId: props.ticketId,
    author: author.value.trim(),
    text: text.value.trim(),
    createdAt: new Date().toISOString()
  }

  try {
    const savedComments = await window.api.addComment(newComment)
    comments.value = savedComments
    auditStore.addLog(props.ticketId, `Додано коментар: "${text.value.substring(0, 40)}..."`)
    text.value = ''
  } catch (error) {
    console.error('Помилка при збереженні коментаря:', error)
  }
}

onMounted(() => {
  loadComments()
})
</script>

<template>
  <div @click.stop 
    class="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[110] backdrop-blur-sm" 
    style="-webkit-app-region: no-drag;"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
      
      <div class="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
        <div class="flex items-center gap-3">
          <div class="bg-blue-100 p-2 rounded-lg text-blue-600">
            <MessageSquare :size="20" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-800">Коментарі</h2>
            <p class="text-xs text-slate-500">{{ ticketTitle }}</p>
          </div>
        </div>
        <button @click.stop="emit('close')" class="text-slate-400 hover:text-slate-600 p-2 rounded-lg transition-colors">
          <X :size="20" />
        </button>
      </div>

      <div class="p-6 overflow-y-auto flex-1 bg-white rounded-b-xl">
        <div class="flex flex-col gap-8">
          
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm shrink-0">
            <div class="space-y-4">
              
              <div>
                <label class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Швидкі відповіді
                </label>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="tpl in QUICK_TEMPLATES" 
                    :key="tpl.label"
                    @click="applyTemplate(tpl.text)"
                    type="button"
                    class="text-[11px] px-3 py-1.5 bg-white border border-slate-200 rounded-full hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                  >
                    {{ tpl.label }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Автор <span class="text-red-500">*</span></label>
                <input v-model="author" type="text" class="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Текст коментаря <span class="text-red-500">*</span></label>
                <textarea v-model="text" rows="3" class="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Напишіть щось або виберіть шаблон..."></textarea>
              </div>
            </div>

            <div class="mt-4 flex justify-end">
              <button
                @click="addComment"
                :disabled="!text.trim() || !author.trim()"
                class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-all shadow-sm"
              >
                <Send :size="16" /> Надіслати
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Clock :size="14" /> Історія ({{ filteredComments.length }})
            </h3>
            
            <div v-if="filteredComments.length === 0" class="text-center py-6">
              <p class="text-sm text-slate-400 italic">Для цього тікета ще немає коментарів.</p>
            </div>

            <div v-for="comment in filteredComments" :key="comment.id" class="border-l-2 border-blue-400 pl-4 py-2 animate-in slide-in-from-top-2">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-sm text-slate-800">{{ comment.author }}</span>
                <span class="text-[11px] text-slate-400">{{ new Date(comment.createdAt).toLocaleString() }}</span>
              </div>
              <p class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{{ comment.text }}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>