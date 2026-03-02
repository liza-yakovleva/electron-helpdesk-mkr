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
  <aside class="flex h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-700 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
    <div class="p-6">
      <h2 class="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
        <ClipboardList class="text-blue-500" />
        HelpDesk <span class="text-xs bg-blue-600 px-1 rounded">PRO</span>
      </h2>
    </div>

    <nav class="flex-1 px-4 space-y-2">
      <button 
        @click="$emit('set-view', 'kanban')"
        :class="[
          'w-full rounded-lg p-3 text-left transition-colors flex items-center gap-3',
          currentView === 'kanban'
            ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-slate-800 dark:text-white dark:shadow-lg'
            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
        ]"
      >
        <LayoutDashboard :size="20" /> Kanban Board
      </button>
      <button 
        @click="$emit('set-view', 'dashboard')"
        :class="[
          'w-full rounded-lg p-3 text-left transition-colors flex items-center gap-3',
          currentView === 'dashboard'
            ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-slate-800 dark:text-white dark:shadow-lg'
            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
        ]"
      >
        <Table :size="20" /> Statistical View
      </button>
      <a href="#" class="flex items-center gap-3 rounded-lg p-3 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
        <ClipboardList :size="20" /> Audit Log
      </a>
    </nav>

    <div class="space-y-4 border-t border-slate-200 p-4 dark:border-slate-800">
      <button @click="$emit('toggle-theme')" class="flex w-full items-center gap-3 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
        <Moon v-if="theme === 'light'" :size="18" />
        <Sun v-else :size="18" />
        {{ theme === 'light' ? 'Dark Mode' : 'Light Mode' }}
      </button>
      <div class="flex items-center gap-3 p-2">
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
          LY
        </div>
        <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Liza</span>
      </div>
    </div>
  </aside>
</template>
