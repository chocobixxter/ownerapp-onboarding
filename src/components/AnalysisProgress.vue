<template>
  <div class="bg-card rounded-lg p-8 shadow-sm border mb-8">
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-foreground mb-2">Анализируем {{ selectedLocation?.name }}</h2>
      <p class="text-muted-foreground">Мы проводим комплексный анализ онлайн-присутствия вашего ресторана</p>
    </div>

    <!-- Progress Steps -->
    <div class="space-y-4">
      <div 
        v-for="(step, index) in analysisSteps" 
        :key="step.id"
        class="relative"
      >
        <!-- Step Header -->
        <div class="flex items-center space-x-4 mb-2">
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
            :class="{
              'bg-blue-500 text-white': step.status === 'running',
              'bg-green-500 text-white': step.status === 'completed',
              'bg-gray-200 text-gray-600': step.status === 'pending',
              'bg-red-500 text-white': step.status === 'error'
            }"
          >
            <span v-if="step.status === 'completed'">✓</span>
            <span v-else-if="step.status === 'error'">✗</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-foreground">{{ step.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ step.description }}</p>
          </div>
          <div 
            v-if="step.status === 'running'"
            class="text-sm font-medium text-blue-600"
          >
            {{ Math.round(step.progress) }}%
          </div>
        </div>

        <!-- Progress Bar -->
        <div 
          v-if="step.status === 'running' || step.status === 'completed'"
          class="ml-12 mb-4"
        >
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300"
              :class="{
                'bg-blue-500': step.status === 'running',
                'bg-green-500': step.status === 'completed'
              }"
              :style="{ width: `${step.progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Connection Line -->
        <div 
          v-if="index < analysisSteps.length - 1"
          class="absolute left-4 top-8 w-px h-8 bg-gray-200"
        ></div>
      </div>
    </div>

    <!-- Overall Progress -->
    <div class="mt-8 pt-6 border-t">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-foreground">Общий прогресс</span>
        <span class="text-sm font-medium text-blue-600">
          {{ Math.round((analysisSteps.filter(s => s.status === 'completed').length / analysisSteps.length) * 100) }}%
        </span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div 
          class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
          :style="{ width: `${(analysisSteps.filter(s => s.status === 'completed').length / analysisSteps.length) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Professional Message -->
    <div class="mt-6 text-center">
      <p class="text-sm text-muted-foreground">
        Комплексный анализ обычно занимает 10-15 секунд для получения точных результатов
      </p>
    </div>

    <!-- Yandex Map -->
    <YandexMap 
      v-if="selectedLocation"
      :location="selectedLocation"
      :map-zoom="mapZoom"
      :is-loading="true"
    />
  </div>
</template>

<script setup lang="ts">
import YandexMap from './YandexMap.vue'
import type { LocationResult } from '@/types'

interface AnalysisStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
}

interface Props {
  selectedLocation: LocationResult | null
  analysisSteps: AnalysisStep[]
  mapZoom: number
}

defineProps<Props>()
</script> 