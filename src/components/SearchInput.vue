<template>
  <div class="max-w-4xl mx-auto mb-12">
    <div class="space-y-4">
      <!-- AI Search Input -->
      <div class="text-center">
        <div class="inline-flex items-center space-x-2 mb-6">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-800">Найдите ваш ресторан</h2>
        </div>
        
        <div class="relative max-w-2xl mx-auto">
          <div class="relative">
            <input
              id="restaurant-search"
              :value="searchQuery"
              @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Введите название ресторана в Казахстане..."
              class="target w-full px-6 py-4 text-lg bg-white border-0 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-xl transition-all duration-300 placeholder-gray-400"
              :disabled="isLoading"
            />
            <div class="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <div v-if="isSearching" class="flex items-center space-x-1">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
              </div>
              <div v-else class="text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <!-- AI-style gradient border -->
          <div class="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-sm"></div>
        </div>
        
        <p class="text-sm text-gray-500 mt-3 flex items-center justify-center space-x-1">
          <span class="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Результаты поиска от 2GIS</span>
        </p>
      </div>
    </div>
  </div>

  <canvas v-show="showCta" id="overlay" class="fixed inset-0 pointer-events-none z-50"></canvas>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted } from 'vue'
import init from '@/utils/target-animation'

interface Props {
  searchQuery: string
  isSearching: boolean
  isLoading: boolean
  showCta: boolean
}

interface Emits {
  (e: 'update:searchQuery', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()

onMounted(() => {
  init();
})
</script> 