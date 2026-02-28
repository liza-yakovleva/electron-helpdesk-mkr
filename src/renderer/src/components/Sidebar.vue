<script setup>
import { LayoutDashboard, Table, ClipboardList, Moon, Sun } from 'lucide-react';
</script>

<template>
  <aside class="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
    <div class="p-6">
      <h2 class="text-xl font-bold text-white flex items-center gap-2">
        <ClipboardList class="text-blue-500" />
        HelpDesk <span class="text-xs bg-blue-600 px-1 rounded">PRO</span>
      </h2>
    </div>

    <nav class="flex-1 px-4 space-y-2">
      <a href="#" class="flex items-center gap-3 p-3 rounded-lg bg-slate-800 text-white">
        <LayoutDashboard :size="20" /> Kanban Board
      </a>
      <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
        <Table :size="20" /> All Tickets
      </a>
      <a href="#" class="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
        <ClipboardList :size="20" /> Audit Log
      </a>
    </nav>

    <div class="p-4 border-t border-slate-800 space-y-4">
      <button class="flex items-center gap-3 w-full p-2 hover:bg-slate-800 rounded-lg">
        <Moon :size="18" /> Dark Mode
      </button>
      <div class="flex items-center gap-3 p-2">
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
          LY
        </div>
        <span class="text-sm font-medium">Liza</span>
      </div>
    </div>
  </aside>
</template>