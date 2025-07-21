<template>
  <div class="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
    <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Анализ конкурентов в радиусе</h3>
          <p class="text-sm text-gray-600">
            Найдено <span class="font-medium">{{ competitors.length }}</span> конкурентов в радиусе {{ radius }}м
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Competition Level Indicator -->
          <div class="flex items-center space-x-2">
            <div 
              class="w-4 h-4 rounded border-2"
              :class="competitionLevel === 'high' ? 'bg-red-500 border-red-600' : 
                     competitionLevel === 'medium' ? 'bg-yellow-500 border-yellow-600' : 
                     'bg-green-500 border-green-600'"
            ></div>
            <span class="text-sm font-medium text-gray-700">
              {{ competitionLevel === 'high' ? 'Высокая конкуренция' : 
                 competitionLevel === 'medium' ? 'Средняя конкуренция' : 
                 'Низкая конкуренция' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="relative">
      <!-- Map Container -->
      <div class="aspect-video bg-gray-100 relative overflow-hidden">
        <!-- Map Display -->
        <div v-if="mapError" class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div class="text-center max-w-sm">
            <div class="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2C7.79 2 6 3.79 6 6c0 3.5 4 8 4 8s4-4.5 4-8c0-2.21-1.79-4-4-4zm0 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">{{ location.name }}</h3>
            <p class="text-sm text-gray-300 mb-2">{{ location.address }}</p>
            <p class="text-xs text-gray-400">Конкурентов: {{ competitors.length }}</p>
          </div>
        </div>
        
        <!-- Yandex Map with markers -->
        <div v-else class="relative w-full h-full">
          <iframe
            :key="`competitor-map-${mapKey}`"
            :src="getMapUrl()"
            width="100%"
            height="100%"
            frameborder="0"
            scrolling="no"
            class="competitor-map-iframe static-map"
            style="border: none;"
            allow=""
            @error="handleMapError"
            @load="handleMapLoad"
          ></iframe>
          
          <!-- Interaction blocker overlay -->
          <div class="map-interaction-blocker"></div>

          <!-- Competition Zone Overlay -->
          <div class="absolute inset-0 pointer-events-none competition-overlay">
            <!-- Grid/Hexagon overlay for competition zones -->
            <div class="competition-grid w-full h-full">
              <!-- Center zone (restaurant location) -->
              <div class="zone-center" :class="getCenterZoneClass()">
                <div class="zone-marker restaurant-marker">
                  <div class="marker-icon">🍽️</div>
                  <div class="marker-pulse"></div>
                </div>
              </div>

              <!-- Competitor zones -->
              <div 
                v-for="(competitor, index) in competitors.slice(0, 8)" 
                :key="`zone-${index}`"
                class="competitor-zone"
                :class="[getCompetitorZoneClass(), `competitor-position-${index % 8}`]"
              >
                <div class="zone-marker competitor-marker">
                  <div class="marker-icon">🏪</div>
                  <div class="marker-pulse competitor-pulse"></div>
                  <div class="competitor-label">{{ competitor.name.substring(0, 12) }}...</div>
                </div>
              </div>

              <!-- Competition density grid -->
              <div class="density-grid">
                <div 
                  v-for="index in 36" 
                  :key="`cell-${index-1}`"
                  class="grid-cell"
                  :class="getCellDensityClass(index-1)"
                >
                  <div class="cell-indicator" v-if="getCellCompetitorCount(index-1) > 0">
                    <span class="competitor-count">{{ getCellCompetitorCount(index-1) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Competition Level Overlay -->
        <div class="absolute top-4 left-4 right-4">
          <div 
            class="rounded-lg p-3 border-2 backdrop-blur-sm"
            :class="competitionLevel === 'high' ? 'bg-red-50/90 border-red-200 text-red-800' : 
                   competitionLevel === 'medium' ? 'bg-yellow-50/90 border-yellow-200 text-yellow-800' : 
                   'bg-green-50/90 border-green-200 text-green-800'"
          >
            <div class="flex items-center space-x-2">
              <div 
                class="w-3 h-3 rounded"
                :class="competitionLevel === 'high' ? 'bg-red-500' : 
                       competitionLevel === 'medium' ? 'bg-yellow-500' : 
                       'bg-green-500'"
              ></div>
              <span class="font-medium text-sm">
                {{ getCompetitionText() }}
              </span>
            </div>
          </div>
        </div>

        <!-- Markers Legend -->
        <div class="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-lg">
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow"></div>
              <span class="text-xs text-gray-700">Ваш ресторан</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow"></div>
              <span class="text-xs text-gray-700">Конкуренты ({{ competitors.length }})</span>
            </div>
          </div>
        </div>

        <!-- Loading Overlay -->
        <div v-if="isLoading" class="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div class="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center space-x-3 shadow-lg">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
              <div class="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
            <span class="text-sm text-gray-700 font-medium">Поиск конкурентов...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Competitor Details -->
    <div v-if="competitors.length > 0" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ competitors.length }}</div>
          <div class="text-sm text-gray-600">Прямых конкурентов</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ radius }}м</div>
          <div class="text-sm text-gray-600">Радиус поиска</div>
        </div>
        <div class="text-center">
          <div 
            class="text-2xl font-bold"
            :class="competitionLevel === 'high' ? 'text-red-600' : 
                   competitionLevel === 'medium' ? 'text-yellow-600' : 
                   'text-green-600'"
          >
            {{ getCompetitionScore() }}%
          </div>
          <div class="text-sm text-gray-600">Уровень конкуренции</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { LocationResult } from '@/types'

interface Props {
  location: LocationResult
  competitors: LocationResult[]
  radius: number
  isLoading: boolean
}

const props = defineProps<Props>()
const mapError = ref(false)
const mapKey = ref(0)

// Computed properties
const competitionLevel = computed(() => {
  if (props.competitors.length >= 5) return 'high'
  if (props.competitors.length >= 2) return 'medium'
  return 'low'
})

const getCompetitionText = () => {
  switch (competitionLevel.value) {
    case 'high':
      return `Высокая конкуренция - ${props.competitors.length} заведений рядом`
    case 'medium':
      return `Умеренная конкуренция - ${props.competitors.length} заведения рядом`
    default:
      return props.competitors.length === 0 
        ? 'Отличная локация - конкурентов не найдено!'
        : `Низкая конкуренция - ${props.competitors.length} заведение рядом`
  }
}

const getCompetitionScore = () => {
  // Calculate competition score based on number of competitors
  const maxCompetitors = 10
  const score = Math.min(100, (props.competitors.length / maxCompetitors) * 100)
  return Math.round(score)
}

// Generate static Yandex Maps URL with all markers
const getMapUrl = () => {
  if (!props.location?.coordinates) return ''
  
  const { lat, lng } = props.location.coordinates
  
  // Create markers for main location and competitors
  const markers = []
  
  // Main restaurant marker (blue)
  markers.push(`${lng},${lat},pm2bl~${encodeURIComponent(props.location.name)}`)
  
  // Competitor markers (red)
  props.competitors.forEach((competitor, index) => {
    if (competitor.coordinates) {
      markers.push(`${competitor.coordinates.lng},${competitor.coordinates.lat},pm2rd~${encodeURIComponent(competitor.name)}`)
    }
  })
  
  const baseUrl = 'https://yandex.ru/map-widget/v1/'
  const params = new URLSearchParams({
    lang: 'ru_RU',
    ll: `${lng},${lat}`,
    z: '16', // Closer zoom to see nearby competitors
    l: 'map',
    mode: 'static', // Static mode - no interaction
    controls: '', // Remove all controls
    scroll: 'false', // Disable scroll zoom
    drag: 'false' // Disable drag
  })
  
  // Add markers if we have them
  if (markers.length > 0) {
    params.set('pt', markers.join('~'))
  }
  
  return `${baseUrl}?${params.toString()}`
}

// Handle map loading
const handleMapError = () => {
  console.warn('Competitor map failed to load, showing fallback')
  mapError.value = true
}

const handleMapLoad = () => {
  mapError.value = false
}

// Helper functions for zone styling and positioning
const getCenterZoneClass = () => {
  return `zone-restaurant ${competitionLevel.value}-competition`
}

const getCompetitorZoneClass = () => {
  return `zone-competitor ${competitionLevel.value}-density`
}

// Simplified grid functions
const getCellCompetitorCount = (cellIndex: number) => {
  const gridSize = 6 // 6x6 grid = 36 cells
  const row = Math.floor(cellIndex / gridSize)
  const col = cellIndex % gridSize
  
  // Center cells (around restaurant) get more competitors
  const centerRow = Math.floor(gridSize / 2)
  const centerCol = Math.floor(gridSize / 2)
  const distanceFromCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol)
  
  if (props.competitors.length === 0) return 0
  
  // Distribute competitors based on distance from center
  if (distanceFromCenter === 0) return Math.min(3, props.competitors.length) // Center
  if (distanceFromCenter === 1) return Math.min(2, Math.max(0, props.competitors.length - 3)) // Adjacent to center
  if (distanceFromCenter === 2) return Math.min(1, Math.max(0, props.competitors.length - 6)) // Further out
  
  return 0 // Edge cells
}

const getCellDensityClass = (cellIndex: number) => {
  const competitorCount = getCellCompetitorCount(cellIndex)
  
  if (competitorCount >= 3) return 'high-density'
  if (competitorCount >= 2) return 'medium-density' 
  if (competitorCount >= 1) return 'low-density'
  return 'no-density'
}

// Watch for changes to regenerate map
watch(() => [props.location, props.competitors], () => {
  mapKey.value++
}, { deep: true })

onMounted(() => {
  mapKey.value++
})
</script>

<style scoped>
.competitor-map-iframe {
  filter: grayscale(20%) contrast(1.1) brightness(0.95);
  transition: filter 0.3s ease;
}

.competitor-map-iframe:hover {
  filter: grayscale(0%) contrast(1) brightness(1);
}

/* Static map - no interactions */
.static-map {
  pointer-events: none;
  user-select: none;
}

/* Interaction blocker overlay */
.map-interaction-blocker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background: transparent;
  pointer-events: auto;
  cursor: default;
}

/* Competition Overlay Container */
.competition-overlay {
  z-index: 10;
}

/* Competition Grid Overlay */
.competition-grid {
  position: relative;
  z-index: 11;
}

/* Zone Markers */
.zone-marker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.restaurant-marker {
  animation: pulse 2s infinite;
}

.marker-icon {
  font-size: 1.5rem;
  background: white;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 3px solid;
}

.restaurant-marker .marker-icon {
  border-color: #2563eb;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.competitor-marker .marker-icon {
  border-color: #dc2626;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  font-size: 1.2rem;
  width: 2.5rem;
  height: 2.5rem;
}

.marker-pulse {
  position: absolute;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  animation: ripple 2s infinite;
}

.competitor-pulse {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(220, 38, 38, 0.3);
}

.restaurant-marker .marker-pulse {
  background: rgba(37, 99, 235, 0.3);
}

.competitor-label {
  background: rgba(220, 38, 38, 0.9);
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  white-space: nowrap;
  max-width: 8rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Zone Areas */
.zone-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 25;
}

.zone-competitor {
  position: absolute;
  z-index: 20;
}

/* Competitor Positioning */
.competitor-position-0 { top: 20%; left: 80%; }
.competitor-position-1 { top: 30%; left: 20%; }
.competitor-position-2 { top: 70%; left: 85%; }
.competitor-position-3 { top: 15%; left: 50%; }
.competitor-position-4 { top: 80%; left: 30%; }
.competitor-position-5 { top: 40%; left: 90%; }
.competitor-position-6 { top: 85%; left: 60%; }
.competitor-position-7 { top: 25%; left: 15%; }

/* Competition Density Grid */
.density-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 15;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 1px;
}

.grid-cell {
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.high-density {
  background: rgba(220, 38, 38, 0.4);
  border-color: rgba(220, 38, 38, 0.6);
}

.medium-density {
  background: rgba(245, 158, 11, 0.3);
  border-color: rgba(245, 158, 11, 0.5);
}

.low-density {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
}

.no-density {
  background: rgba(229, 231, 235, 0.1);
  border-color: rgba(229, 231, 235, 0.2);
}

.cell-indicator {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.competitor-count {
  font-size: 0.6rem;
}

/* Competition Level Zones */
.high-competition .zone-center {
  animation: danger-pulse 1.5s infinite;
}

.medium-competition .zone-center {
  animation: warning-pulse 2s infinite;
}

.low-competition .zone-center {
  animation: safe-pulse 2.5s infinite;
}

/* Animations */
@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.05); }
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
}

@keyframes danger-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
  50% { box-shadow: 0 0 0 1rem rgba(220, 38, 38, 0); }
}

@keyframes warning-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
  50% { box-shadow: 0 0 0 1rem rgba(245, 158, 11, 0); }
}

@keyframes safe-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  50% { box-shadow: 0 0 0 1rem rgba(34, 197, 94, 0); }
}

/* Hide Yandex Maps controls */
[class*='copyrights-pane'] {
  display: none !important;
}
</style> 