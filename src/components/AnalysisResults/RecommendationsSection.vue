<template>
  <div class="bg-card rounded-lg p-6 shadow-sm border">
    <h3 class="text-lg font-semibold text-foreground mb-4">Приоритетные рекомендации</h3>
    <div class="space-y-4">
      <div 
        v-for="recommendation in analysisResult.recommendations"
        :key="recommendation.id"
        class="p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <div class="flex items-start space-x-3">
          <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {{ recommendation.priority }}
          </div>
          <div class="flex-1">
            <h4 class="font-medium text-blue-900">{{ recommendation.title }}</h4>
            <p class="text-sm text-blue-700 mt-1">{{ recommendation.description }}</p>
            <div class="text-xs text-blue-600 mt-2 font-medium">
              Потенциальное влияние: {{ recommendation.revenueImpact }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalysisResult } from '@/types'

interface Props {
  analysisResult: AnalysisResult
}

defineProps<Props>()
</script> 