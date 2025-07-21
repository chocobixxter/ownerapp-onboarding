<template>
  <div class="max-w-2xl mx-auto">
    <!-- Search Results -->
    <div v-if="searchQuery && locations.length > 0 && !isLoading">
      <p class="text-center text-sm text-gray-600 mb-4">
        Найдено {{ locations.length }} ресторан{{ locations.length === 1 ? '' : locations.length < 5 ? 'а' : 'ов' }} - выберите для анализа:
      </p>
      <div class="space-y-3">
        <div
          v-for="location in locations"
          :key="location.id"
          class="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all duration-300 group"
          @click="$emit('selectLocation', location)"
        >
          <div class="flex items-start space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mt-1 group-hover:scale-110 transition-transform duration-200">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 group-hover:text-green-900 transition-colors">{{ location.name }}</div>
              <div class="text-sm text-gray-600 mt-1 truncate">{{ location.address }}</div>
              <div class="text-xs text-green-600 mt-1 flex items-center">
                <span class="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                {{ location.city }} • 2GIS
              </div>
            </div>
            <div class="text-gray-400 group-hover:text-green-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results Message -->
    <div v-if="searchQuery && searchQuery.length >= 3 && locations.length === 0 && !isSearching && !isLoading" class="text-center py-8 max-w-md mx-auto">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Рестораны не найдены</h3>
      <p class="text-gray-500">Попробуйте изменить название или проверьте правописание</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LocationResult } from '@/types'

interface Props {
  searchQuery: string
  locations: LocationResult[]
  isSearching: boolean
  isLoading: boolean
}

interface Emits {
  (e: 'selectLocation', location: LocationResult): void
}

defineProps<Props>()
defineEmits<Emits>()
</script> 