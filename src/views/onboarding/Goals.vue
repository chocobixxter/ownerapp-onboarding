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

          <!-- Submit Button -->
          <div class="flex justify-end mt-8">
            <button
              @click="handleSubmit"
              :disabled="!hasAnyGoals"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Перейти к анализу
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
import type { OnboardingGoals } from '@/types'
import { useOnboarding } from '@/composables/useOnboarding'
import OnboardingProgress from '@/components/OnboardingProgress.vue'

const router = useRouter()

const { 
  onboardingData, 
  currentStep, 
  progressPercentage, 
  isStepCompleted,
  setGoals,
  nextStep,
  previousStep,
  loadFromStorage
} = useOnboarding()

// Form data
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

const hasOtherGoals = ref(false)

// Goal options
const goalOptions = [
  { key: 'onlineDelivery', label: 'Онлайн доставка', description: 'Запустить службу доставки еды' },
  { key: 'takeawayOrders', label: 'Заказы на вынос', description: 'Организовать систему заказов на вынос' },
  { key: 'loyaltyProgram', label: 'Программа лояльности', description: 'Внедрить систему скидок и бонусов' },
  { key: 'reviewsManagement', label: 'Управление отзывами', description: 'Улучшить репутацию в интернете' },
  { key: 'inventoryAutomation', label: 'Автоматизация склада', description: 'Внедрить учет продуктов и запасов' },
  { key: 'mobileApp', label: 'Мобильное приложение', description: 'Создать собственное приложение' },
  { key: 'qrMenuOnlinePayment', label: 'QR-меню и онлайн оплата', description: 'Бесконтактное обслуживание' },
  { key: 'staffManagement', label: 'Управление персоналом', description: 'Улучшить работу с сотрудниками' },
  { key: 'predictiveAnalytics', label: 'Предиктивная аналитика', description: 'Прогнозирование спроса и трендов' },
  { key: 'tableReservation', label: 'Бронирование столиков', description: 'Система онлайн бронирования' }
]

// Validation
const hasAnyGoals = computed(() => {
  return Object.values(goalsForm.value).some(value => 
    typeof value === 'boolean' ? value : (typeof value === 'string' && value.trim() !== '')
  ) || hasOtherGoals.value
})

// Navigation handlers
const handlePrevious = () => {
  if (previousStep()) {
    router.push('/onboarding/problems')
  }
}

const handleSubmit = () => {
  if (!hasAnyGoals.value) return
  
  // Update goals data
  setGoals(goalsForm.value)
  
  // Move to next step
  if (nextStep()) {
    router.push('/onboarding/business-assessment')
  }
}

// Initialize form
onMounted(() => {
  loadFromStorage()
  
  // Pre-fill form if data exists
  if (onboardingData.value.goals) {
    goalsForm.value = { ...onboardingData.value.goals }
    hasOtherGoals.value = !!onboardingData.value.goals.other
  }
  
  // Redirect if no restaurant data
  if (!onboardingData.value.restaurantData?.name) {
    router.push('/')
  }
})
</script> 