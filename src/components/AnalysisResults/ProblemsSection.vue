<template>
  <div class="bg-card rounded-lg p-6 shadow-sm border">
    <div class="grid grid-cols-1 gap-4">
      <div 
        v-for="problem in analysisResult.problems.slice(0, 8)"
        :key="problem.id"
        class="p-4 border border-red-200 rounded-lg bg-red-50"
      >
        <div class="flex items-start space-x-3">
          <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
            <span class="text-white text-xs">⚠</span>
          </div>
          <div class="flex-1">
            <h4 class="font-medium text-red-900">{{ problem.title }}</h4>
            <p class="text-sm text-red-700 mt-1">{{ problem.description }}</p>
            <div class="text-xs text-red-600 mt-2">
              <span class="font-medium">Влияние:</span> {{ problem.impact }}
            </div>
          </div>
          <div 
            class="px-2 py-1 rounded text-xs font-medium"
            :class="{
              'bg-red-200 text-red-800': problem.severity === 'critical',
              'bg-orange-200 text-orange-800': problem.severity === 'high',
              'bg-yellow-200 text-yellow-800': problem.severity === 'medium',
              'bg-blue-200 text-blue-800': problem.severity === 'low'
            }"
          >
            {{ problem.severity }}
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