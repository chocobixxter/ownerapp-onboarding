<template>
  <div class="bg-card rounded-lg p-6 shadow-sm border">
    <h3 class="text-lg font-semibold text-foreground mb-4">Присутствие в справочниках</h3>
    <p class="text-sm text-muted-foreground mb-6">Информация о вашем ресторане в бизнес-справочнике</p>
    
    <div class="flex justify-center">
      <!-- 2GIS -->
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 max-w-md w-full">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-green-900 text-lg">2ГИС</h4>
            <p class="text-sm text-green-600">Ведущий бизнес-справочник Казахстана</p>
          </div>
        </div>
        
        <div v-if="analysisResult.apiData.twoGis" class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-green-700">Рейтинг</span>
            <div class="flex items-center space-x-2">
              <span class="font-semibold text-green-900 text-lg">{{ analysisResult.apiData.twoGis.rating || 'N/A' }}</span>
              <div class="flex">
                <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="analysisResult.apiData.twoGis.rating && i <= analysisResult.apiData.twoGis.rating ? 'text-yellow-400' : 'text-gray-300'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-green-700">Отзывы</span>
            <span class="font-semibold text-green-900 text-lg">{{ analysisResult.apiData.twoGis.reviewCount || 0 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-green-700">Статус</span>
            <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">✓ Найден</span>
          </div>
          <div v-if="analysisResult.apiData.twoGis.website" class="flex items-center justify-between">
            <span class="text-sm text-green-700">Сайт</span>
            <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">✓ Указан</span>
          </div>
          <div v-if="analysisResult.apiData.twoGis.phone" class="flex items-center justify-between">
            <span class="text-sm text-green-700">Телефон</span>
            <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">✓ Указан</span>
          </div>
        </div>
        <div v-else class="text-center py-6">
          <span class="px-4 py-2 bg-red-100 text-red-800 text-sm rounded-full font-medium">⚠ Не найден</span>
          <p class="text-sm text-green-600 mt-3">Ресторан не найден в 2ГИС</p>
          <p class="text-xs text-gray-500 mt-1">Рекомендуем добавить заведение в справочник</p>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="mt-8 bg-gray-50 rounded-lg p-6">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
        <div>
          <div class="text-3xl font-bold text-foreground">{{ getRating() }}</div>
          <div class="text-sm text-muted-foreground">Рейтинг в 2ГИС</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-foreground">{{ getReviewCount() }}</div>
          <div class="text-sm text-muted-foreground">Количество отзывов</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-foreground">{{ getPresenceStatus().label }}</div>
          <div class="text-sm text-muted-foreground">Статус присутствия</div>
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

const props = defineProps<Props>()

// Methods for 2GIS data only
const getRating = () => {
  if (!props.analysisResult?.apiData?.twoGis?.rating) return 'N/A'
  return props.analysisResult.apiData.twoGis.rating.toFixed(1)
}

const getReviewCount = () => {
  if (!props.analysisResult?.apiData?.twoGis?.reviewCount) return 0
  return props.analysisResult.apiData.twoGis.reviewCount
}

const getPresenceStatus = () => {
  if (props.analysisResult?.apiData?.twoGis) {
    return { label: 'Найден', color: 'green' }
  }
  return { label: 'Не найден', color: 'red' }
}
</script> 