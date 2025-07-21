<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <!-- Professional Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-6">
        <div class="max-w-6xl mx-auto">
          <div class="flex items-center justify-between">
            <!-- Brand & Navigation -->
            <div class="flex items-center space-x-6">
              <button
                @click="goBack"
                class="btn-brand-outline text-sm py-2 px-4 flex items-center"
                tabindex="0"
                aria-label="Вернуться к поиску"
                @keydown.enter="goBack"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Новый анализ
              </button>
            </div>
            
            <!-- Restaurant Info -->
            <div class="text-center flex-1 max-w-md" v-if="selectedLocation">
              <h2 class="text-xl font-bold text-gray-900">{{ selectedLocation.name }}</h2>
              <p class="text-gray-600 text-sm mt-1">{{ selectedLocation.address }}</p>
              <div class="mt-2">
                <span class="badge-info">Анализ завершен</span>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center space-x-3">
              <button
                @click="refreshAnalysis"
                :disabled="isLoading"
                class="btn-brand text-sm py-2 px-4 flex items-center"
                tabindex="0"
                aria-label="Обновить анализ"
                @keydown.enter="refreshAnalysis"
              >
                <svg class="w-4 h-4 mr-2" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                {{ isLoading ? 'Обновляем...' : 'Обновить' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <AnalysisProgress
          :selected-location="selectedLocation"
          :analysis-steps="analysisSteps"
          :map-zoom="mapZoom"
        />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Ошибка при анализе</h3>
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <button
            @click="refreshAnalysis"
            class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>

      <!-- No Data State -->
      <div v-else-if="!selectedLocation" class="text-center py-12">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Данные не найдены</h3>
          <p class="text-gray-600 mb-4">Информация о ресторане недоступна. Попробуйте выполнить новый поиск.</p>
          <div class="space-x-3">
            <button
              @click="retryLoadData"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Попробовать загрузить снова
            </button>
            <button
              @click="goBack"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Вернуться к поиску
            </button>
          </div>
        </div>
      </div>

      <!-- Results Display -->
      <div v-else-if="analysisResult" class="space-y-6">
        <AnalysisResults
          :selected-location="selectedLocation"
          :analysis-result="analysisResult"
        />
        
        <!-- Contact Form Section -->
        <div class="mt-12">
          <ContactForm 
            :selected-location="selectedLocation"
            :analysis-result="analysisResult"
            analysis-type="smart"
          />
        </div>
      </div>

      <!-- Initial State - Show Selected Restaurant -->
      <div v-else-if="selectedLocation && !analysisResult" class="space-y-6">
        <SelectedRestaurant
          :selected-location="selectedLocation"
          :is-loading="isLoading"
          @analyze="analyzeRestaurant"
        />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { LocationResult, AnalysisResult } from '@/types'
import { useRestaurantAnalysis } from '@/composables/useRestaurantAnalysis'

// Components
import SelectedRestaurant from '@/components/SelectedRestaurant.vue'
import AnalysisProgress from '@/components/AnalysisProgress.vue'
import AnalysisResults from '@/components/AnalysisResults/index.vue'
import ContactForm from '@/components/ContactForm.vue'

const router = useRouter()
const route = useRoute()

const selectedLocation = ref<LocationResult | null>(null)
const analysisResult = ref<AnalysisResult | null>(null)
const error = ref<string | null>(null)
const mapZoom = ref(12)

const { isLoading, analysisSteps, analyzeLocation } = useRestaurantAnalysis()

// Session storage keys
const STORAGE_KEYS = {
  SELECTED_LOCATION: 'restaurant_analysis_selected_location',
  ANALYSIS_RESULT: 'restaurant_analysis_result',
  LAST_ANALYSIS_TIME: 'restaurant_analysis_timestamp'
} as const

// Navigation functions
const goBack = () => {
  router.push('/')
}

const retryLoadData = () => {
  console.log('🔄 Manually retrying data load...')
  
  // Clear current state
  selectedLocation.value = null
  analysisResult.value = null
  error.value = null
  
  // Try loading again
  loadFromSessionStorage()
  
  if (!selectedLocation.value) {
    loadFromUrlParams()
  }
  
  console.log('Retry result - Location:', !!selectedLocation.value, 'Result:', !!analysisResult.value)
}

const refreshAnalysis = async () => {
  if (!selectedLocation.value) return
  
  try {
    error.value = null
    analysisResult.value = null
    
    // Clear cached result but keep location
    sessionStorage.removeItem(STORAGE_KEYS.ANALYSIS_RESULT)
    sessionStorage.removeItem(STORAGE_KEYS.LAST_ANALYSIS_TIME)
    
    await analyzeRestaurant()
  } catch (err) {
    console.error('Error refreshing analysis:', err)
    error.value = 'Не удалось обновить анализ. Попробуйте еще раз.'
  }
}

// Analysis function
const analyzeRestaurant = async () => {
  if (!selectedLocation.value) return

  try {
    error.value = null
    const result = await analyzeLocation(selectedLocation.value)
    analysisResult.value = result
    
    // Save result to session storage
    saveToSessionStorage()
    
    // Update URL with restaurant data
    updateUrlParams()
    
  } catch (err) {
    console.error('Error analyzing restaurant:', err)
    error.value = 'Произошла ошибка при анализе ресторана. Попробуйте еще раз.'
  }
}

// Session storage functions
const saveToSessionStorage = () => {
  try {
    if (selectedLocation.value) {
      sessionStorage.setItem(STORAGE_KEYS.SELECTED_LOCATION, JSON.stringify(selectedLocation.value))
      console.log('💾 Location saved to session storage')
    }
    
    if (analysisResult.value) {
      sessionStorage.setItem(STORAGE_KEYS.ANALYSIS_RESULT, JSON.stringify(analysisResult.value))
      sessionStorage.setItem(STORAGE_KEYS.LAST_ANALYSIS_TIME, Date.now().toString())
      console.log('💾 Analysis result saved to session storage')
    }
  } catch (err) {
    console.error('❌ Error saving to session storage:', err)
  }
}

const loadFromSessionStorage = () => {
  try {
    console.log('Loading data from session storage...')
    
    // Load selected location
    const savedLocation = sessionStorage.getItem(STORAGE_KEYS.SELECTED_LOCATION)
    if (savedLocation) {
      selectedLocation.value = JSON.parse(savedLocation)
      console.log('✅ Loaded location:', selectedLocation.value?.name)
    } else {
      console.log('❌ No saved location found')
    }
    
    // Load analysis result (check if it's not too old - 1 hour)
    const savedResult = sessionStorage.getItem(STORAGE_KEYS.ANALYSIS_RESULT)
    const savedTime = sessionStorage.getItem(STORAGE_KEYS.LAST_ANALYSIS_TIME)
    
    console.log('Analysis result exists:', !!savedResult)
    console.log('Analysis time exists:', !!savedTime)
    
    if (savedResult && savedTime) {
      const timeDiff = Date.now() - parseInt(savedTime)
      const oneHour = 60 * 60 * 1000
      
      console.log('Time diff (minutes):', Math.round(timeDiff / (1000 * 60)))
      
      if (timeDiff < oneHour) {
        analysisResult.value = JSON.parse(savedResult)
        console.log('✅ Loaded analysis result:', !!analysisResult.value)
      } else {
        console.log('❌ Analysis result too old, clearing...')
        // Clear old data
        sessionStorage.removeItem(STORAGE_KEYS.ANALYSIS_RESULT)
        sessionStorage.removeItem(STORAGE_KEYS.LAST_ANALYSIS_TIME)
      }
    }
  } catch (err) {
    console.error('Error loading from session storage:', err)
  }
}

// URL parameter functions
const updateUrlParams = () => {
  if (selectedLocation.value) {
    const params = new URLSearchParams()
    params.set('name', selectedLocation.value.name)
    params.set('address', selectedLocation.value.address)
    params.set('lat', selectedLocation.value.coordinates.lat.toString())
    params.set('lng', selectedLocation.value.coordinates.lng.toString())
    
    router.replace({ path: '/results', query: Object.fromEntries(params) })
  }
}

const loadFromUrlParams = () => {
  try {
    const { name, address, lat, lng } = route.query
    
    console.log('Loading from URL params:', { name, address, lat, lng })
    
    if (name && address && lat && lng) {
      selectedLocation.value = {
        id: `url_${Date.now()}`,
        name: name as string,
        address: address as string,
        city: address as string, // Use address as city fallback
        coordinates: {
          lat: parseFloat(lat as string),
          lng: parseFloat(lng as string)
        },
        source: '2gis' as const
      }
      console.log('✅ Location loaded from URL params:', selectedLocation.value.name)
    } else {
      console.log('❌ Incomplete URL params')
    }
  } catch (err) {
    console.error('❌ Error loading from URL params:', err)
  }
}

// Watch for map zoom animation during analysis
watch(isLoading, (loading) => {
  if (loading && selectedLocation.value) {
    mapZoom.value = 12
    startZoomAnimation()
  } else {
    mapZoom.value = 18
  }
})

// Smooth zoom animation during analysis
const startZoomAnimation = () => {
  const zoomInterval = setInterval(() => {
    if (!isLoading.value) {
      clearInterval(zoomInterval)
      mapZoom.value = 18
      return
    }
    
    const completedSteps = analysisSteps.value.filter(s => s.status === 'completed').length
    const totalSteps = analysisSteps.value.length
    const progress = totalSteps > 0 ? completedSteps / totalSteps : 0
    
    const targetZoom = 12 + (progress * 6)
    mapZoom.value = Math.min(18, Math.max(12, Math.round(targetZoom)))
  }, 500)
}

// Initialize page
onMounted(async () => {
  console.log('Results page mounted, initializing...')
  
  // Always try to load from session storage first
  loadFromSessionStorage()
  
  // Then try URL parameters if location not found
  if (!selectedLocation.value) {
    console.log('No location from storage, trying URL params...')
    loadFromUrlParams()
  }
  
  // Wait a bit for any async data to settle
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // Try loading from session storage again if we still don't have results
  if (selectedLocation.value && !analysisResult.value) {
    console.log('Retrying session storage load...')
    loadFromSessionStorage()
  }
  
  console.log('Final state - Location:', !!selectedLocation.value, 'Result:', !!analysisResult.value)
  
  // If still no data, redirect to home
  if (!selectedLocation.value) {
    console.log('No location found, redirecting to home...')
    router.push('/')
  }
})

// Save to session storage when data changes
watch([selectedLocation, analysisResult], () => {
  saveToSessionStorage()
}, { deep: true })

// Watch for route changes to reload data
watch(() => route.query, (newQuery) => {
  console.log('Route query changed, reloading data...')
  if (newQuery.name) {
    loadFromUrlParams()
    // Also try to load results from session storage
    if (!analysisResult.value) {
      loadFromSessionStorage()
    }
  }
}, { immediate: false })
</script> 