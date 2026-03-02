<script setup lang="ts">
import { LayoutDashboard, Table, ClipboardList, Moon } from 'lucide-vue-next';

defineProps<{
  currentView: string;
}>();

defineEmits<{
  (e: 'set-view', view: 'dashboard' | 'kanban'): void;
}>();
</script>

<template>
  <aside class="h-full w-16 min-w-16 shrink-0 overflow-y-auto bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 scrollbar-app sm:w-64 sm:min-w-64">
    <div class="p-4 sm:p-6">
      <h2 class="text-xl font-bold text-white flex items-center justify-center gap-2 sm:justify-start">
        <ClipboardList class="text-blue-500" />
        <span class="hidden sm:inline">HelpDesk</span>
        <span class="hidden sm:inline text-xs bg-blue-600 px-1 rounded">PRO</span>
      </h2>
    </div>

    <nav class="flex-1 px-2 sm:px-4 space-y-2">
      <button 
        @click="$emit('set-view', 'kanban')"
        :class="['w-full flex items-center justify-center sm:justify-start gap-3 p-3 rounded-lg transition-colors text-left', currentView === 'kanban' ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400']"
        title="Kanban Board"
      >
        <LayoutDashboard :size="20" />
        <span class="hidden sm:inline">Kanban Board</span>
      </button>
      <button 
        @click="$emit('set-view', 'dashboard')"
        :class="['w-full flex items-center justify-center sm:justify-start gap-3 p-3 rounded-lg transition-colors text-left', currentView === 'dashboard' ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400']"
        title="Statistical View"
      >
        <Table :size="20" />
        <span class="hidden sm:inline">Statistical View</span>
      </button>
      <a href="#" class="flex items-center justify-center sm:justify-start gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-400" title="Audit Log">
        <ClipboardList :size="20" />
        <span class="hidden sm:inline">Audit Log</span>
      </a>
    </nav>

    <div class="p-4 border-t border-slate-800 space-y-4">
      <button class="flex items-center justify-center sm:justify-start gap-3 w-full p-2 hover:bg-slate-800 rounded-lg text-slate-400" title="Dark Mode">
        <Moon :size="18" />
        <span class="hidden sm:inline">Dark Mode</span>
      </button>
      <div class="flex items-center justify-center sm:justify-start gap-3 p-2">
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
          LY
        </div>
        <span class="hidden sm:inline text-sm font-medium text-slate-200">Liza</span>
      </div>
    </div>
  </aside>
</template>
