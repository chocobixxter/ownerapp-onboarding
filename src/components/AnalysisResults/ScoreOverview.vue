<template>
  <div class="bg-card rounded-lg p-6 shadow-sm border mb-6">
    <!-- Overall Score Circle -->
    <div class="text-center mb-6">
      <div class="relative w-32 h-32 mx-auto">
        <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          <!-- Background circle -->
          <circle cx="60" cy="60" r="54" stroke="#e5e7eb" stroke-width="8" fill="none"/>
          <!-- Progress circle with animation -->
          <circle 
            cx="60" 
            cy="60" 
            r="54" 
            stroke="#f59e0b" 
            stroke-width="8" 
            fill="none"
            :stroke-dasharray="339.292"
            :stroke-dashoffset="339.292 - (339.292 * analysisResult.totalScore / 100)"
            class="transition-all duration-2000 ease-out"
            style="animation: drawCircle 2s ease-out"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <div class="text-3xl font-bold text-foreground">{{ analysisResult.totalScore }}</div>
            <div class="text-xs text-muted-foreground">/100</div>
          </div>
        </div>
      </div>
      <div class="mt-4">
        <div class="text-sm text-muted-foreground">Онлайн-рейтинг</div>
        <div class="text-lg font-semibold text-foreground capitalize">{{ analysisResult.overallGrade }}</div>
      </div>
    </div>

    <!-- Category Scores -->
    <div class="space-y-4">
      <div 
        v-for="category in analysisResult.categories"
        :key="category.name"
        class="flex items-center justify-between"
      >
        <div class="flex items-center space-x-3">
          <div 
            class="w-3 h-3 rounded-full"
            :class="{
              'bg-green-500': category.status === 'excellent' || category.status === 'good',
              'bg-yellow-500': category.status === 'fair',
              'bg-red-500': category.status === 'poor'
            }"
          />
          <div>
            <div class="text-sm font-medium text-foreground">{{ category.name }}</div>
            <div class="text-xs text-muted-foreground capitalize">{{ category.status }}</div>
          </div>
        </div>
        <div class="text-sm font-medium text-foreground">{{ category.score }}/{{ category.maxScore }}</div>
      </div>
    </div>

    <!-- Action Button -->
    <div class="mt-6 pt-6 border-t">
      <div class="text-sm text-muted-foreground mb-3">Хотите, чтобы мы сделали это за вас?</div>
      <button class="w-full bg-black text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
        Записаться на консультацию  →
      </button>
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

<style scoped>
@keyframes drawCircle {
  from {
    stroke-dashoffset: 339.292;
  }
  to {
    stroke-dashoffset: calc(339.292 - (339.292 * var(--score) / 100));
  }
}
</style> 