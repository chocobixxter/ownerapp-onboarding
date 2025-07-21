<template>
  <div class="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-xl border border-gray-100 mb-12">
    <div class="text-center mb-6">
      <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span class="text-3xl">🍽️</span>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ selectedLocation.name }}</h2>
      <p class="text-gray-600 mb-1">{{ selectedLocation.address }}</p>
      <p class="text-sm text-green-600 flex items-center justify-center">
        <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        {{ selectedLocation.city }} • Найдено в 2GIS
      </p>
    </div>
    
    <button
      :disabled="isLoading"
      class="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
      @click="$emit('analyze')"
    >
      <span class="flex items-center justify-center space-x-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        <span>{{ isLoading ? 'Анализируем...' : 'Начать полный анализ' }}</span>
      </span>
    </button>
    
    <div class="mt-4 bg-blue-50 rounded-xl p-3">
      <p class="text-xs text-center text-blue-800 flex items-center justify-center space-x-1">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        <span>Мы проанализируем ваше присутствие в Google Maps, Яндекс.Картах и 2GIS</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LocationResult } from '@/types'

interface Props {
  selectedLocation: LocationResult
  isLoading: boolean
}

interface Emits {
  (e: 'analyze'): void
}

defineProps<Props>()
defineEmits<Emits>()
</script> 