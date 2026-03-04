<script setup lang="ts">
import { LayoutDashboard, Table, ClipboardList, Moon, Sun } from 'lucide-vue-next';

defineProps<{
  currentView: string;
  theme: 'light' | 'dark';
}>();

defineEmits<{
  (e: 'set-view', view: 'dashboard' | 'kanban'): void;
  (e: 'toggle-theme'): void;
}>();
</script>

<template>
  <aside class="flex h-screen w-16 min-w-16 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white text-slate-700 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:w-64 sm:min-w-64">
    <div class="shrink-0 p-4 sm:p-6">
      <h2 class="flex items-center justify-center gap-2 text-xl font-bold text-slate-900 dark:text-white sm:justify-start">
        <ClipboardList class="text-blue-500" />
        <span class="hidden sm:inline">HelpDesk</span>
        <span class="hidden sm:inline text-xs bg-blue-600 px-1 rounded text-white">PRO</span>
      </h2>
    </div>

    <nav class="space-y-2 px-2 pb-2 sm:px-4">
      <button 
        @click="$emit('set-view', 'kanban')"
        :class="[
          'w-full rounded-lg p-3 transition-colors flex items-center justify-center sm:justify-start gap-3',
          currentView === 'kanban'
            ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-slate-800 dark:text-white dark:shadow-lg'
            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
        ]"
        title="Kanban Board"
      >
        <LayoutDashboard :size="20" />
        <span class="hidden sm:inline">Панель канбан</span>
      </button>

      <button 
        @click="$emit('set-view', 'dashboard')"
        :class="[
          'w-full rounded-lg p-3 transition-colors flex items-center justify-center sm:justify-start gap-3',
          currentView === 'dashboard'
            ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-slate-800 dark:text-white dark:shadow-lg'
            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
        ]"
        title="Табличний перегляд"
      >
        <Table :size="20" />
        <span class="hidden sm:inline">Табличний перегляд</span>
      </button>

      <button 
        @click="$emit('set-view', 'audit')"
        :class="[
          'w-full rounded-lg p-3 transition-colors flex items-center justify-center sm:justify-start gap-3',
          currentView === 'audit'
            ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-slate-800 dark:text-white dark:shadow-lg'
            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
        ]"
        title="Журнал аудиту"
      >
        <ClipboardList :size="20" />
        <span class="hidden sm:inline">Журнал аудиту</span>
      </button>
    </nav>

    <div class="mt-auto shrink-0 space-y-4 border-t border-slate-200 p-4 dark:border-slate-800">
      <button @click="$emit('toggle-theme')" title="Змінити тему [Ctrl+T]" class="flex w-full items-center justify-center gap-3 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 sm:justify-start">
        <Moon v-if="theme === 'light'" :size="18" />
        <Sun v-else :size="18" />
        <span class="hidden sm:inline">{{ theme === 'light' ? 'Темна тема' : 'Світла тема' }}</span>
      </button>
      
      <div class="flex items-center justify-center gap-3 p-2 sm:justify-start">
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
          LY
        </div>
        <span class="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200">Liza</span>
      </div>
    </div>
  </aside>
</template>
