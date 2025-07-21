<template>
  <div class="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div class="container mx-auto px-4 py-3">
      <div class="max-w-3xl mx-auto">
        
        <!-- Compact Progress Bar -->
        <div class="relative">
          <!-- Background line -->
          <div class="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
          
          <!-- Progress line -->
          <div 
            class="absolute top-4 left-0 h-0.5 bg-blue-600 transition-all duration-500 ease-out"
            :style="{ width: `${progressPercentage}%` }"
          ></div>

          <!-- Steps -->
          <div class="relative flex justify-between">
            <div 
              v-for="(step, index) in steps" 
              :key="step.id"
              class="flex flex-col items-center"
            >
              <!-- Step circle -->
              <div 
                class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 bg-white"
                :class="getStepClasses(index + 1)"
              >
                <svg v-if="isStepCompleted(index + 1)" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <span v-else>{{ index + 1 }}</span>
              </div>
              
              <!-- Step label -->
              <div class="mt-2 text-center">
                <div 
                  class="text-xs font-medium transition-colors"
                  :class="{
                    'text-blue-600': currentStep === index + 1,
                    'text-green-600': isStepCompleted(index + 1),
                    'text-gray-500': currentStep !== index + 1 && !isStepCompleted(index + 1)
                  }"
                >
                  {{ step.title }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Compact Navigation -->
        <div class="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          <button
            v-if="currentStep > 1"
            @click="$emit('previous')"
            class="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            tabindex="0"
            aria-label="Предыдущий шаг"
            @keydown.enter="$emit('previous')"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span>Назад</span>
          </button>
          <div v-else></div>

          <div class="text-xs text-gray-500">
            {{ currentStep }}/{{ totalSteps }} • {{ Math.round(progressPercentage) }}%
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Step {
  id: string
  title: string
  description: string
}

interface Props {
  currentStep: number
  totalSteps: number
  progressPercentage: number
  isStepCompleted: (step: number) => boolean
}

const props = defineProps<Props>()

defineEmits<{
  previous: []
}>()

const steps: Step[] = [
  {
    id: 'search',
    title: 'Поиск',
    description: ''
  },
  {
    id: 'confirm',
    title: 'Данные',
    description: ''
  },
  {
    id: 'problems',
    title: 'Проблемы',
    description: ''
  },
  {
    id: 'goals',
    title: 'Цели',
    description: ''
  },
  {
    id: 'assessment',
    title: 'Анализ',
    description: ''
  }
]

const getStepClasses = (stepNumber: number) => {
  if (props.isStepCompleted(stepNumber)) {
    return 'border-green-500 bg-green-500 text-white'
  } else if (props.currentStep === stepNumber) {
    return 'border-blue-600 bg-blue-600 text-white'
  } else {
    return 'border-gray-300 text-gray-500'
  }
}
</script> 