<template>
  <div class="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iIzM3NDE1MSIgZmlsbC1vcGFjaXR5PSIwLjAyIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPgo8L2c+CjwvZz4KPC9zdmc+')] opacity-40"></div>
      </div>
      
      <div class="relative container mx-auto px-4 py-16 h-full">
        <div class="max-w-6xl mx-auto">
          <!-- Brand Header -->
          <div class="section-header animate-fade-in">
            <div class="flex items-center justify-center mb-8">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl mr-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div class="text-left">
                <h1 class="section-title text-5xl md:text-6xl mb-2">Owner Pro</h1>
                <p class="text-blue-600 font-semibold text-lg">Аналитика • Конкуренты • Рост</p>
              </div>
            </div>
            
            <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Максимизируйте прибыль своего ресторана с помощью 
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                умной аналитики
              </span>
            </h2>
          
          </div>

          <!-- Search Section -->
          <div class="animate-slide-up">
            <SearchInput 
              v-model:search-query="searchQuery"
              :show-cta="!selectedLocation && !isLoading && !searchQuery"
              :is-searching="isSearching"
              :is-loading="isLoading"
            />

            <!-- Search Results -->
            <SearchResults 
              :search-query="searchQuery"
              :locations="locations"
              :is-searching="isSearching"
              :is-loading="isLoading"
              @select-location="selectLocation"
            />

            <!-- Selected Restaurant Display -->
            <SelectedRestaurant
              v-if="selectedLocation && !isLoading"
              :selected-location="selectedLocation"
              :is-loading="isLoading"
              @analyze="startOnboarding"
            />

            <!-- Analysis Progress Section (only for legacy analysis) -->
            <AnalysisProgress
              v-if="isLoading && analysisSteps.length > 0"
              :selected-location="selectedLocation"
              :analysis-steps="analysisSteps"
              :map-zoom="mapZoom"
            />

            <!-- Quick Analysis Option -->
            <div v-if="selectedLocation" class="mt-8 text-center">
              <div class="card-modern p-6 max-w-md mx-auto">
                <p class="text-gray-600 mb-4">
                  Или получите быстрый технический анализ без персонализации
                </p>
                <button
                  @click="quickAnalyze"
                  :disabled="isLoading"
                  class="btn-brand-outline w-full"
                >
                  <span class="flex items-center justify-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Быстрый анализ
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { LocationResult } from '@/types'
import { useRestaurantAnalysis } from '@/composables/useRestaurantAnalysis'
import { useOnboarding } from '@/composables/useOnboarding'
import { twoGisService } from '@/services/twoGisService'

// Components
import SearchInput from '@/components/SearchInput.vue'
import SearchResults from '@/components/SearchResults.vue'
import SelectedRestaurant from '@/components/SelectedRestaurant.vue'
import AnalysisProgress from '@/components/AnalysisProgress.vue'


const router = useRouter()
const searchQuery = ref('')
const selectedLocation = ref<LocationResult | null>(null)
const locations = ref<LocationResult[]>([])
const mapZoom = ref(12) // Start with wide view

const { isLoading, analysisSteps, analyzeLocation } = useRestaurantAnalysis()
const { setRestaurantFromLocation } = useOnboarding()

// Session storage keys for legacy analysis
const STORAGE_KEYS = {
  SELECTED_LOCATION: 'restaurant_analysis_selected_location',
  ANALYSIS_RESULT: 'restaurant_analysis_result',
  LAST_ANALYSIS_TIME: 'restaurant_analysis_timestamp'
} as const

// Debounced search functionality - Only 2GIS for initial search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let currentSearchController: AbortController | null = null
const isSearching = ref(false)

const searchRestaurants = async (query: string) => {
  if (query.length < 3) {
    locations.value = []
    isSearching.value = false
    return
  }

  // Отменяем предыдущий запрос если он еще выполняется
  if (currentSearchController) {
    currentSearchController.abort()
  }

  // Создаем новый контроллер для отмены запроса
  currentSearchController = new AbortController()
  const signal = currentSearchController.signal

  isSearching.value = true
  
  try {
    // Проверяем, не был ли запрос отменен перед началом
    if (signal.aborted) {
      return
    }

    // Use only 2GIS for initial search as requested
    const searchParams = {
      query: query.trim(),
      location: 'Kazakhstan',
      radius: 50000
    }
    
    console.log(`🔍 Поиск ресторанов: "${query}"`)
    
    const results = await twoGisService.searchPlaces(searchParams)
    
    // Проверяем, не был ли запрос отменен во время выполнения
    if (signal.aborted) {
      return
    }
    
    // Use nextTick to preserve input focus
    await nextTick()
    locations.value = results
    
    console.log(`✅ Найдено ${results.length} результатов для "${query}"`)
  } catch (error) {
    // Игнорируем ошибки отмененных запросов
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`❌ Поиск отменен для "${query}"`)
      return
    }
    
    console.error('Ошибка поиска локаций:', error)
    locations.value = []
  } finally {
    // Сбрасываем состояние загрузки только если запрос не был отменен
    if (!signal.aborted) {
      isSearching.value = false
    }
  }
}

// Watch for search query changes with improved debouncing
watch(searchQuery, (newQuery, oldQuery) => {
  // Очищаем существующий таймаут
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  // Если поле очищено, сразу очищаем результаты
  if (!newQuery.trim()) {
    locations.value = []
    isSearching.value = false
    
    // Отменяем текущий запрос если он выполняется
    if (currentSearchController) {
      currentSearchController.abort()
    }
    return
  }
  
  // Показываем индикатор загрузки только если запрос достаточно длинный
  if (newQuery.length >= 3) {
    isSearching.value = true
  }
  
  // Устанавливаем новый таймаут для debounced поиска
  searchTimeout = setTimeout(async () => {
    await searchRestaurants(newQuery)
  }, 500) // Увеличили до 500ms для лучшего debounce
}, { immediate: false })

// Watch analysis progress for smooth zoom animation (legacy)
watch(isLoading, (loading) => {
  if (loading && selectedLocation.value) {
    // Reset zoom when analysis starts
    mapZoom.value = 12
    startZoomAnimation()
  } else {
    // Final zoom when analysis completes
    mapZoom.value = 18
  }
})

// Smooth zoom animation during analysis (legacy)
const startZoomAnimation = () => {
  const zoomInterval = setInterval(() => {
    if (!isLoading.value) {
      clearInterval(zoomInterval)
      mapZoom.value = 18 // Final detailed zoom
      return
    }
    
    // Gradually increase zoom based on analysis progress
    const completedSteps = analysisSteps.value.filter(s => s.status === 'completed').length
    const totalSteps = analysisSteps.value.length
    const progress = totalSteps > 0 ? completedSteps / totalSteps : 0
    
    // Smooth zoom from 12 to 18 over analysis duration
    const targetZoom = 12 + (progress * 6) // 12 -> 18
    mapZoom.value = Math.min(18, Math.max(12, Math.round(targetZoom)))
  }, 500) // Update every 500ms for smooth effect
}

const selectLocation = (location: LocationResult) => {
  selectedLocation.value = location
  locations.value = [] // Clear search results
  searchQuery.value = '' // Clear search input
}

// NEW: Start onboarding process (primary flow)
const startOnboarding = () => {
  if (!selectedLocation.value) return

  console.log('🚀 Starting onboarding for:', selectedLocation.value.name)
  
  // Initialize onboarding with selected restaurant
  setRestaurantFromLocation(selectedLocation.value)
  
  // Navigate to confirmation page (Step 2)
  router.push('/onboarding/confirm-data')
}

// Legacy: Quick analysis (secondary option)
const quickAnalyze = async () => {
  if (!selectedLocation.value) return

  try {
    console.log('🚀 Starting quick analysis for:', selectedLocation.value.name)
    
    // Start analysis
    const result = await analyzeLocation(selectedLocation.value)
    
    console.log('✅ Analysis completed, saving to storage...')
    
    // Save result to session storage
    sessionStorage.setItem(STORAGE_KEYS.ANALYSIS_RESULT, JSON.stringify(result))
    sessionStorage.setItem(STORAGE_KEYS.LAST_ANALYSIS_TIME, Date.now().toString())
    sessionStorage.setItem(STORAGE_KEYS.SELECTED_LOCATION, JSON.stringify(selectedLocation.value))
    
    // Navigate to results page with query parameters
    const params = new URLSearchParams()
    params.set('name', selectedLocation.value.name)
    params.set('address', selectedLocation.value.address)
    params.set('lat', selectedLocation.value.coordinates.lat.toString())
    params.set('lng', selectedLocation.value.coordinates.lng.toString())
    
    console.log('🔄 Navigating to results page...')
    
    router.push({ path: '/results', query: Object.fromEntries(params) })
    
  } catch (error) {
    console.error('❌ Error analyzing restaurant:', error)
    // On error, still navigate to results page to show error state
    router.push('/results')
  }
}


</script>

 