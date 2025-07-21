<template>
  <div class="mt-8">
    <div class="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
      <div class="relative">
        <!-- Map Container -->
        <div class="aspect-video bg-gray-100 relative overflow-hidden">
          <!-- Fallback Map Display -->
          <div v-if="mapError" class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div class="text-center max-w-sm">
              <div class="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2C7.79 2 6 3.79 6 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.21-1.79-4-4-4zm0 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-white mb-2">{{ location.name }}</h3>
              <p class="text-sm text-gray-300 mb-2">{{ location.address }}</p>
              <p class="text-xs text-gray-400">{{ location.coordinates.lat.toFixed(4) }}, {{ location.coordinates.lng.toFixed(4) }}</p>
            </div>
          </div>
          
          <!-- Yandex Map Iframe with Custom Styling -->
          <div v-else class="relative w-full h-full">
            <iframe
              :key="`map-${mapZoom}`"
              :src="getMapUrl()"
              width="100%"
              height="100%"
              frameborder="0"
              scrolling="no"
              class="yandex-map-iframe"
              style="border: none;"
              allow="geolocation"
              @error="handleMapError"
              @load="handleMapLoad"
            ></iframe>
          </div>
          
          <!-- Loading Overlay -->
          <div v-if="isLoading" class="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div class="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center space-x-3 shadow-lg">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                <div class="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
              </div>
              <span class="text-sm text-gray-700 font-medium">Загрузка карты...</span>
            </div>
          </div>

          <!-- Custom Minimalist Marker -->
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
            <div class="relative flex flex-col items-center">
              <!-- Marker Pin -->
              <div class="relative">
                <div class="w-6 h-6 bg-gray-800 rounded-full shadow-2xl border-2 border-white flex items-center justify-center">
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <!-- Pin tail -->
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
              
              <!-- Marker Text Card -->
              <div class="mt-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200 max-w-xs">
                <h3 class="text-sm font-semibold text-gray-900 text-center leading-tight">{{ location.name }}</h3>
                <p class="text-xs text-gray-600 text-center mt-1 leading-tight">{{ location.address }}</p>
              </div>
              
              <!-- Connection line from marker to text -->
              <div class="absolute top-6 w-px h-2 bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Minimal Location Info Bar -->
      <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2C7.79 2 6 3.79 6 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.21-1.79-4-4-4zm0 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900 text-sm">{{ location.name }}</p>
              <p class="text-gray-600 text-xs">{{ location.address }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="flex items-center space-x-1">
              <span class="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
              <span class="text-xs text-gray-500 font-medium">Карта</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LocationResult } from '@/types'

interface Props {
  location: LocationResult
  mapZoom: number
  isLoading: boolean
}

const props = defineProps<Props>()
const mapError = ref(false)

// Generate clean Yandex Maps URL without markers
const getMapUrl = () => {
  if (!props.location?.coordinates) return ''
  
  const { lat, lng } = props.location.coordinates
  
  // Clean Yandex Maps iframe URL without built-in markers
  const baseUrl = 'https://yandex.ru/map-widget/v1/'
  const params = new URLSearchParams({
    lang: 'ru_RU',
    ll: `${lng},${lat}`,
    z: props.mapZoom.toString(),
    l: 'map', // Basic map layer
    mode: 'search'
  })
  
  return `${baseUrl}?${params.toString()}`
}

// Handle map loading errors
const handleMapError = () => {
  console.warn('Map failed to load, showing fallback')
  mapError.value = true
}

// Handle successful map load
const handleMapLoad = () => {
  mapError.value = false
}
</script>

<style scoped>
/* Hide Yandex Maps UI elements and apply monochrome styling */
.yandex-map-iframe {
  filter: grayscale(100%) contrast(1.2) brightness(0.8);
  transition: filter 0.3s ease;
}

/* Hide Yandex Maps controls using iframe content styling */
.yandex-map-iframe::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

/* Additional styles to ensure clean interface */
.yandex-map-iframe {
  background-color: #374151;
}

/* Responsive marker text */
@media (max-width: 640px) {
  .absolute.top-1\/2 .max-w-xs {
    max-width: 250px;
  }
}

[class*='copyrights-pane'] {
	display: none !important;
}
</style> 