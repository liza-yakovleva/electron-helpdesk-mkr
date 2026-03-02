<template>
  <div 
    draggable="true"
    @dragstart="handleDragStart"
    @click="emit('edit-ticket', ticket.id)"
    class="group mb-3 cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-300 active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500/50"
  >
    <div class="flex justify-between items-start mb-2">
      <span class="text-xs font-mono font-bold text-slate-400 transition-colors group-hover:text-blue-600 dark:text-slate-500">
        {{ ticket.id }}
      </span>
      <span :class="['text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider', priorityClass]">
        {{ ticket.priority }}
      </span>
    </div>

    <h4 class="mb-1 line-clamp-2 font-bold text-slate-800 dark:text-slate-100">
      {{ ticket.title }}
    </h4>
    
    <p class="mb-3 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
      {{ ticket.description }}
    </p>

    <div class="mt-auto flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <div v-if="ticket.assignee" class="flex h-6 w-6 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-[10px] font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-200">
          {{ ticket.assignee.substring(0, 2).toUpperCase() }}
        </div>
        <div v-else class="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-100 text-[10px] font-bold text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500">
          ?
        </div>
        <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {{ ticket.assignee || 'Unassigned' }}
        </span>
      </div>

      <div :class="['flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm', slaClass]">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {{ slaLabel }}
      </div>
    </div>
    
    <div class="mt-2 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
      <span>Deadline: {{ formatDate(ticket.deadline) }}</span>
    </div>
  </div>
</template>