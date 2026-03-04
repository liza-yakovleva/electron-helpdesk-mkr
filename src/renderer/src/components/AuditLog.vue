<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auditStore } from '../store/auditStore'
import { ClipboardList } from 'lucide-vue-next'

onMounted(async () => {
  await auditStore.loadLogs()
})

const getActionColor = (action: string) => {
  const text = action.toLowerCase()
  if (text.includes('створено')) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
  if (text.includes('видалено')) return 'text-red-600 bg-red-50 dark:bg-red-500/10'
  if (text.includes('статус')) return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10'
  if (text.includes('коментар')) return 'text-purple-600 bg-purple-50 dark:bg-purple-500/10'
  return 'text-slate-600 bg-slate-50 dark:bg-slate-800'
}
</script>

<template>
  <section class="flex flex-col h-full animate-in fade-in duration-500">
    <header class="mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Audit Log</h1>
      <p class="text-app-muted">Історія всіх ключових дій у системі.</p>
    </header>

    <div class="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="h-full overflow-y-auto scrollbar-app">
        <table class="w-full text-left text-sm border-separate border-spacing-0">
          <thead class="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider z-10">
            <tr>
              <th class="px-6 py-4 border-b dark:border-slate-700 w-1/2">Дія / Опис</th>
              <th class="px-6 py-4 border-b dark:border-slate-700">Тікет ID</th>
              <th class="px-6 py-4 border-b dark:border-slate-700 text-right">Дата та час</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr 
              v-for="log in auditStore.logs" 
              :key="log.id" 
              class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td class="px-6 py-4">
                <span :class="['px-2 py-1 rounded-md font-medium text-xs whitespace-nowrap', getActionColor(log.details)]">
                  {{ log.details }}
                </span>
              </td>
              <td class="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                {{ log.ticketId }}
              </td>
              <td class="px-6 py-4 text-right text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                {{ log.timestamp }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="auditStore.logs.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-400">
          <ClipboardList :size="48" class="opacity-20 mb-4" />
          <p>Журнал аудиту порожній</p>
        </div>
      </div>
    </div>
  </section>
</template>