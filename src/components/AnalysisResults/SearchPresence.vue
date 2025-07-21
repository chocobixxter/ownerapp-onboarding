<template>
  <div class="bg-card rounded-lg p-6 shadow-sm border">
    <h3 class="text-lg font-semibold text-foreground mb-4">Как дела у вас в интернете</h3>
    <p class="text-sm text-muted-foreground mb-6">Где вы появляетесь, когда клиенты ищут вас рядом с конкурентами</p>
    
    <div class="space-y-3">
      <div 
        v-for="presence in analysisResult.searchPresence.slice(0, 6)"
        :key="`${presence.platform}-${presence.query}`"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div class="flex items-center space-x-3">
          <div class="text-sm">{{ presence.platform }}</div>
          <div class="text-sm text-muted-foreground">{{ presence.query }}</div>
        </div>
        <div class="flex items-center space-x-2">
          <span 
            v-if="presence.ranking"
            class="text-sm font-medium"
            :class="{
              'text-green-600': presence.ranking <= 3,
              'text-yellow-600': presence.ranking <= 6,
              'text-red-600': presence.ranking > 6
            }"
          >
            #{{ presence.ranking }}
          </span>
          <span 
            v-if="presence.mapPack" 
            class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
          >
            На карте
          </span>
          <span 
            v-else-if="!presence.found"
            class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
          >
            Не найден
          </span>
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