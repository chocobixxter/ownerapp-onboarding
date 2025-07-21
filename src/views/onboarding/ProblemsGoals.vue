<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Progress Header -->
    <OnboardingProgress
      :current-step="currentStep"
      :total-steps="4"
      :progress-percentage="progressPercentage"
      :is-step-completed="isStepCompleted"
      @previous="handlePrevious"
    />

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto space-y-8">
        
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
        </div>

        <!-- Goals Form -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Что вы хотите внедрить или улучшить?</h2>
            <p class="text-gray-600">Выберите направления для развития вашего бизнеса</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label v-for="goal in goalOptions" :key="goal.key" class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer">
              <input
                v-model="goalsForm[goal.key as keyof OnboardingGoals]"
                type="checkbox"
                class="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 mt-0.5"
              />
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ goal.label }}</div>
                <div class="text-sm text-gray-600">{{ goal.description }}</div>
              </div>
            </label>
          </div>

          <!-- Other Goals -->
          <div class="mt-6">
            <label class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
              <input
                v-model="hasOtherGoals"
                type="checkbox"
                class="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 mt-0.5"
              />
              <div class="flex-1">
                <div class="font-medium text-gray-900">Другое (пожалуйста, уточните)</div>
                <textarea
                  v-if="hasOtherGoals"
                  v-model="goalsForm.other"
                  rows="3"
                  class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Опишите ваши цели..."
                ></textarea>
              </div>
            </label>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-between items-center pt-6">
          <button
            @click="handlePrevious"
            class="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Назад
          </button>

          <button
            @click="handleSubmit"
            :disabled="!isFormValid"
            class="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Перейти к анализу →
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboarding } from '@/composables/useOnboarding'
import OnboardingProgress from '@/components/OnboardingProgress.vue'
import type { OnboardingProblems, OnboardingGoals } from '@/types'

const router = useRouter()
const { 
  onboardingData,
  currentStep, 
  isStepCompleted, 
  progressPercentage,
  nextStep, 
  previousStep,
  setProblems,
  setGoals,
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

const goalsForm = ref<OnboardingGoals>({
  onlineDelivery: false,
  takeawayOrders: false,
  loyaltyProgram: false,
  reviewsManagement: false,
  inventoryAutomation: false,
  mobileApp: false,
  qrMenuOnlinePayment: false,
  staffManagement: false,
  predictiveAnalytics: false,
  tableReservation: false,
  other: ''
})

const hasOtherProblems = ref(false)
const hasOtherGoals = ref(false)

// Problem options
const problemOptions = [
  { key: 'lowProfit', label: 'Низкая прибыль', description: 'Выручка не покрывает расходы' },
  { key: 'noClients', label: 'Мало клиентов', description: 'Низкая посещаемость ресторана' },
  { key: 'hardToTrackMetrics', label: 'Сложно отслеживать показатели', description: 'Нет аналитики и KPI' },
  { key: 'noDelivery', label: 'Нет доставки', description: 'Отсутствует сервис доставки' },
  { key: 'noCrmLoyalty', label: 'Нет CRM/лояльности', description: 'Нет системы работы с клиентами' },
  { key: 'highStaffTurnover', label: 'Высокая текучка персонала', description: 'Сотрудники часто увольняются' },
  { key: 'staffRecruitment', label: 'Сложности с поиском персонала', description: 'Трудно найти хороших сотрудников' },
  { key: 'noMobileApp', label: 'Нет мобильного приложения', description: 'Отсутствует мобильное приложение' },
  { key: 'reportingIssues', label: 'Проблемы с отчетами', description: 'Сложности с финансовой отчетностью' },
  { key: 'noControlOverLocations', label: 'Не понимаю, что происходит в точках', description: 'Нет контроля над филиалами' },
  { key: 'highPurchaseCosts', label: 'Высокие цены на закупки', description: 'Дорогие поставщики продуктов' },
  { key: 'supplierQualityIssues', label: 'Проблемы с качеством от поставщиков', description: 'Низкое качество продуктов' },
  { key: 'marketingDifficulties', label: 'Сложности с маркетингом', description: 'Не знаю как привлекать клиентов' },
  { key: 'highCompetition', label: 'Высокая конкуренция', description: 'Много конкурентов поблизости' }
]

// Goal options  
const goalOptions = [
  { key: 'onlineDelivery', label: 'Онлайн-доставка', description: 'Запустить доставку с сайта/приложения' },
  { key: 'takeawayOrders', label: 'Заказ навынос', description: 'Принимать заказы на вынос онлайн' },
  { key: 'loyaltyProgram', label: 'Программа лояльности', description: 'Система скидок и бонусов' },
  { key: 'reviewsManagement', label: 'Управление отзывами', description: 'Мониторинг и ответы на отзывы' },
  { key: 'inventoryAutomation', label: 'Автоматизация запасов', description: 'Учет остатков продуктов' },
  { key: 'mobileApp', label: 'Мобильное приложение', description: 'Собственное приложение ресторана' },
  { key: 'qrMenuOnlinePayment', label: 'QR-меню и онлайн-оплата', description: 'Бесконтактное меню и оплата' },
  { key: 'staffManagement', label: 'Управление персоналом', description: 'Система мотивации сотрудников' },
  { key: 'predictiveAnalytics', label: 'Предиктивная аналитика', description: 'Прогнозирование спроса и продаж' },
  { key: 'tableReservation', label: 'Бронирование стола', description: 'Онлайн бронирование столиков' }
]

// Form validation
const isFormValid = computed(() => {
  const hasProblems = Object.values(problemsForm.value).some(value => 
    typeof value === 'boolean' ? value : false
  ) || (hasOtherProblems.value && problemsForm.value.other.trim())
  
  const hasGoals = Object.values(goalsForm.value).some(value => 
    typeof value === 'boolean' ? value : false
  ) || (hasOtherGoals.value && goalsForm.value.other.trim())
  
  return hasProblems && hasGoals
})

// Navigation handlers
const handlePrevious = () => {
  if (previousStep()) {
    router.push('/onboarding/confirm-data')
  }
}

const handleSubmit = () => {
  if (!isFormValid.value) return
  
  // Clean up other fields if not selected
  if (!hasOtherProblems.value) {
    problemsForm.value.other = ''
  }
  
  if (!hasOtherGoals.value) {
    goalsForm.value.other = ''
  }
  
  // Save problems and goals
  setProblems(problemsForm.value)
  setGoals(goalsForm.value)
  
  // Move to next step
  if (nextStep()) {
    router.push('/onboarding/assessment')
  }
}

// Initialize form with saved data
onMounted(() => {
  loadFromStorage()
  
  // Load existing problems/goals if available
  if (onboardingData.value.problems) {
    problemsForm.value = { ...onboardingData.value.problems }
    hasOtherProblems.value = !!onboardingData.value.problems.other
  }
  
  if (onboardingData.value.goals) {
    goalsForm.value = { ...onboardingData.value.goals }
    hasOtherGoals.value = !!onboardingData.value.goals.other
  }
  
  // If no restaurant data, redirect to confirm page
  if (!onboardingData.value.restaurantData?.name) {
    router.push('/onboarding/confirm-data')
  }
})
</script> 