<script setup>
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="flex h-screen bg-slate-50 text-slate-900 w-full">
    <Sidebar />
    <main class="flex-1 p-8 overflow-y-auto">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p class="text-slate-500">Welcome back, here is what's happening with tickets.</p>
      </header>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 class="font-semibold text-slate-500 mb-2">Open Tickets</h3>
          <p class="text-3xl font-bold">12</p>
        </div>
        <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 class="font-semibold text-slate-500 mb-2 text-red-500">High Priority</h3>
          <p class="text-3xl font-bold text-red-500">4</p>
        </div>
        <div class="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <h3 class="font-semibold text-slate-500 mb-2 text-green-600">Avg. SLA Time</h3>
          <p class="text-3xl font-bold text-green-600">1.5h</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style>

body {
  margin: 0;
  padding: 0;
}
</style>