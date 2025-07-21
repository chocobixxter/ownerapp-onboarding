<template>
  <div class="space-y-6">
    <!-- Success Animation -->
    <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200 mb-6">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-green-800">Анализ завершен!</h3>
          <p class="text-green-700">Мы нашли несколько возможностей для улучшения онлайн-присутствия вашего ресторана.</p>
        </div>
      </div>
    </div>

    <!-- Header with Restaurant Info -->
    <div class="bg-card rounded-lg p-6 shadow-sm border">
      <div class="flex items-center space-x-4 mb-4">
        <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
          <span class="text-2xl">🍽️</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-foreground">{{ selectedLocation?.name }}</h2>
          <p class="text-sm text-muted-foreground">{{ selectedLocation?.address }}</p>
        </div>
      </div>
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 class="font-semibold text-orange-800 mb-2">Мы нашли {{ analysisResult.problems.length }} проблем{{ analysisResult.problems.length === 1 ? 'у' : analysisResult.problems.length < 5 ? 'ы' : '' }} с вашим онлайн-присутствием</h3>
        <p class="text-orange-700 text-sm">Вы теряете продажи, пока не исправите это</p>
      </div>
    </div>

    <!-- Platform Comparison Block -->
    <PlatformComparison :analysis-result="analysisResult" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Score Overview -->
      <div class="lg:col-span-1">
        <ScoreOverview :analysis-result="analysisResult" />
      </div>

      <!-- Right Column: Detailed Analysis -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Search Presence Section -->
        <SearchPresence :analysis-result="analysisResult" />

        <!-- Problems Section -->
        <ProblemsSection :analysis-result="analysisResult" />

              <!-- Recommendations Section -->
      <RecommendationsSection :analysis-result="analysisResult" />
    </div>
  </div>

  <!-- Competitor Map Section -->
  <div v-if="selectedLocation" class="mt-6">
    <CompetitorMap
      :location="selectedLocation"
      :competitors="competitors"
      :radius="competitorRadius"
      :is-loading="isLoadingCompetitors"
    />
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PlatformComparison from './PlatformComparison.vue'
import ScoreOverview from './ScoreOverview.vue'
import SearchPresence from './SearchPresence.vue'
import ProblemsSection from './ProblemsSection.vue'
import RecommendationsSection from './RecommendationsSection.vue'
import CompetitorMap from '@/components/CompetitorMap.vue'
import { useRestaurantAnalysis } from '@/composables/useRestaurantAnalysis'
import type { LocationResult, AnalysisResult } from '@/types'

interface Props {
  selectedLocation: LocationResult | null
  analysisResult: AnalysisResult
}

const props = defineProps<Props>()

// Competitor analysis
const { searchCompetitors } = useRestaurantAnalysis()
const competitors = ref<LocationResult[]>([])
const competitorRadius = ref(500) // 500 meters radius
const isLoadingCompetitors = ref(false)

// Load competitors when component mounts
onMounted(async () => {
  if (props.selectedLocation) {
    isLoadingCompetitors.value = true
    try {
      const foundCompetitors = await searchCompetitors(props.selectedLocation, competitorRadius.value)
      competitors.value = foundCompetitors
      console.log(`✅ Found ${foundCompetitors.length} competitors for map display`)
    } catch (error) {
      console.error('Error loading competitors for map:', error)
    } finally {
      isLoadingCompetitors.value = false
    }
  }
})
</script> 