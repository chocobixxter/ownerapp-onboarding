<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Progress Header -->
    <OnboardingProgress
      :current-step="currentStep"
      :total-steps="5"
      :progress-percentage="progressPercentage"
      :is-step-completed="isStepCompleted"
      @previous="handlePrevious"
    />

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-3xl mx-auto">
        
        <!-- Problems Form -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">С какими проблемами вы сталкиваетесь?</h2>
            <p class="text-gray-600">Выберите все актуальные для вашего ресторана проблемы</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label v-for="problem in problemOptions" :key="problem.key" class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer">
              <input
                v-model="problemsForm[problem.key as keyof OnboardingProblems]"
                type="checkbox"
                class="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500 mt-0.5"
              />
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ problem.label }}</div>
                <div class="text-sm text-gray-600">{{ problem.description }}</div>
              </div>
            </label>
          </div>

          <!-- Other Problems -->
          <div class="mt-6">
            <label class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
              <input
                v-model="hasOtherProblems"
                type="checkbox"
                class="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500 mt-0.5"
              />
              <div class="flex-1">
                <div class="font-medium text-gray-900">Другое (пожалуйста, уточните)</div>
                <textarea
                  v-if="hasOtherProblems"
                  v-model="problemsForm.other"
                  rows="3"
                  class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Опишите вашу проблему..."
                ></textarea>
              </div>
            </label>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end mt-8">
            <button
              @click="handleSubmit"
              :disabled="!hasAnyProblems"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Продолжить к целям
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { OnboardingProblems } from '@/types'
import { useOnboarding } from '@/composables/useOnboarding'
import OnboardingProgress from '@/components/OnboardingProgress.vue'

const router = useRouter()

const { 
  onboardingData, 
  currentStep, 
  progressPercentage, 
  isStepCompleted,
  setProblems,
  nextStep,
  previousStep,
  loadFromStorage
} = useOnboarding()

// Form data
const problemsForm = ref<OnboardingProblems>({
  lowProfit: false,
  noClients: false,
  hardToTrackMetrics: false,
  noDelivery: false,
  noCrmLoyalty: false,
  highStaffTurnover: false,
  staffRecruitment: false,
  noMobileApp: false,
  reportingIssues: false,
  noControlOverLocations: false,
  highPurchaseCosts: false,
  supplierQualityIssues: false,
  marketingDifficulties: false,
  highCompetition: false,
  other: ''
})

const hasOtherProblems = ref(false)

// Problem options
const problemOptions = [
  { key: 'lowProfit', label: 'Низкая прибыль', description: 'Доходы не покрывают расходы' },
  { key: 'noClients', label: 'Мало клиентов', description: 'Низкая посещаемость ресторана' },
  { key: 'hardToTrackMetrics', label: 'Сложно отслеживать метрики', description: 'Нет понимания ключевых показателей' },
  { key: 'noDelivery', label: 'Нет доставки', description: 'Отсутствует служба доставки' },
  { key: 'noCrmLoyalty', label: 'Нет CRM и программы лояльности', description: 'Нет системы управления клиентами' },
  { key: 'highStaffTurnover', label: 'Высокая текучка персонала', description: 'Сотрудники часто увольняются' },
  { key: 'staffRecruitment', label: 'Сложности с наймом', description: 'Трудно найти хороший персонал' },
  { key: 'noMobileApp', label: 'Нет мобильного приложения', description: 'Отсутствует собственное приложение' },
  { key: 'reportingIssues', label: 'Проблемы с отчетностью', description: 'Сложно анализировать данные' },
  { key: 'noControlOverLocations', label: 'Нет контроля над локациями', description: 'Сложно управлять филиалами' },
  { key: 'highPurchaseCosts', label: 'Высокие закупочные цены', description: 'Дорогие поставщики продуктов' },
  { key: 'supplierQualityIssues', label: 'Проблемы качества поставок', description: 'Ненадежные поставщики' },
  { key: 'marketingDifficulties', label: 'Сложности с маркетингом', description: 'Неэффективная реклама' },
  { key: 'highCompetition', label: 'Высокая конкуренция', description: 'Много конкурентов в районе' }
]

// Validation
const hasAnyProblems = computed(() => {
  return Object.values(problemsForm.value).some(value => 
    typeof value === 'boolean' ? value : (typeof value === 'string' && value.trim() !== '')
  ) || hasOtherProblems.value
})

// Navigation handlers
const handlePrevious = () => {
  if (previousStep()) {
    router.push('/onboarding/confirm-data')
  }
}

const handleSubmit = () => {
  if (!hasAnyProblems.value) return
  
  // Update problems data
  setProblems(problemsForm.value)
  
  // Move to next step
  if (nextStep()) {
    router.push('/onboarding/goals')
  }
}

// Initialize form
onMounted(() => {
  loadFromStorage()
  
  // Pre-fill form if data exists
  if (onboardingData.value.problems) {
    problemsForm.value = { ...onboardingData.value.problems }
    hasOtherProblems.value = !!onboardingData.value.problems.other
  }
  
  // Redirect if no restaurant data
  if (!onboardingData.value.restaurantData?.name) {
    router.push('/')
  }
})
</script> 