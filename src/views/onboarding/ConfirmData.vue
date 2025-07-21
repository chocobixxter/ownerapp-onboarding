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
      <div class="max-w-2xl mx-auto">
        
        <!-- Main Form Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Подтвердите данные о ресторане</h2>
            <p class="text-gray-600">Проверьте автозаполненную информацию и дополните недостающие данные</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6">
            
            <!-- Basic Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">Основная информация</h3>
              
              <!-- Restaurant Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                  Название ресторана <span class="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Введите название ресторана"
                />
              </div>

              <!-- Address -->
              <div>
                <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
                  Адрес <span class="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  v-model="formData.address"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Полный адрес ресторана"
                />
              </div>

              <!-- Restaurant Type & Cuisine Type -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="restaurantType" class="block text-sm font-medium text-gray-700 mb-2">
                    Тип заведения <span class="text-red-500">*</span>
                    <span v-if="formData.restaurantType && onboardingData.selectedRestaurant?.businessType" 
                          class="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Автозаполнено 2GIS
                    </span>
                  </label>
                  <select
                    id="restaurantType"
                    v-model="formData.restaurantType"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Выберите тип</option>
                    <option v-for="type in restaurantTypes" :key="type.value" :value="type.value">
                      {{ type.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label for="cuisineType" class="block text-sm font-medium text-gray-700 mb-2">
                    Тип кухни
                    <span v-if="formData.cuisineType && onboardingData.selectedRestaurant?.cuisineType" 
                          class="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Автозаполнено 2GIS
                    </span>
                  </label>
                  <select
                    id="cuisineType"
                    v-model="formData.cuisineType"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Выберите кухню</option>
                    <option v-for="cuisine in cuisineTypes" :key="cuisine" :value="cuisine">
                      {{ cuisine }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Business Metrics -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">Показатели бизнеса</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="averageCheck" class="block text-sm font-medium text-gray-700 mb-2">
                    Средний чек <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="averageCheck"
                      v-model.number="formData.averageCheck"
                      type="number"
                      min="0"
                      required
                      class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="3000"
                    />
                    <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">₸</span>
                  </div>
                </div>

                <div>
                  <label for="ordersPerDay" class="block text-sm font-medium text-gray-700 mb-2">
                    Заказов в день
                  </label>
                  <input
                    id="ordersPerDay"
                    v-model.number="formData.ordersPerDay"
                    type="number"
                    min="0"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>

            <!-- Services -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">Услуги</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    v-model="formData.hasDelivery"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700">Есть доставка</span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    v-model="formData.hasTakeaway"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700">Есть навынос</span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    v-model="formData.hasTableReservation"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700">Бронь столов</span>
                </label>

                <label class="flex items-center space-x-3 cursor-pointer">
                  <input
                    v-model="formData.hasLoyaltyProgram"
                    type="checkbox"
                    class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span class="text-sm text-gray-700">Программа лояльности</span>
                </label>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-between items-center pt-6 border-t border-gray-100">
              <button
                type="button"
                @click="handlePrevious"
                class="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Назад
              </button>

              <button
                type="submit"
                :disabled="!isFormValid"
                class="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                Подтвердить данные и продолжить →
              </button>
            </div>
          </form>
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
import type { OnboardingRestaurantData } from '@/types'

const router = useRouter()
const { 
  onboardingData, 
  currentStep, 
  isStepCompleted, 
  progressPercentage,
  updateRestaurantData, 
  nextStep, 
  previousStep,
  validateStep2,
  restaurantTypes,
  cuisineTypes,
  loadFromStorage
} = useOnboarding()

// Form data
const formData = ref<OnboardingRestaurantData>({
  name: '',
  address: '',
  city: '',
  coordinates: { lat: 0, lng: 0 },
  phone: '',
  website: '',
  email: '',
  restaurantType: undefined,
  cuisineType: '',
  averageCheck: undefined,
  ordersPerDay: undefined,
  hasDelivery: false,
  hasTakeaway: false,
  hasTableReservation: false,
  hasLoyaltyProgram: false
})

// Form validation
const isFormValid = computed(() => {
  return !!(
    formData.value.name && 
    formData.value.address && 
    formData.value.restaurantType && 
    formData.value.averageCheck
  )
})

// Navigation handlers
const handlePrevious = () => {
  if (previousStep()) {
    router.push('/')
  }
}

const handleSubmit = () => {
  if (!isFormValid.value) return
  
  // Update onboarding data
  updateRestaurantData(formData.value)
  
  // Move to next step
  if (nextStep()) {
    router.push('/onboarding/problems')
  }
}

// Initialize form with saved data
onMounted(() => {
  loadFromStorage()
  
  // Check if we have restaurant data
  if (onboardingData.value.restaurantData) {
    formData.value = { ...onboardingData.value.restaurantData }
  }
  
  // Debug: log 2GIS autofill data
  if (onboardingData.value.selectedRestaurant) {
    console.log('🏪 2GIS данные для автозаполнения:', {
      businessType: onboardingData.value.selectedRestaurant.businessType,
      cuisineType: onboardingData.value.selectedRestaurant.cuisineType,
      categories: onboardingData.value.selectedRestaurant.categories
    })
  }
  
  // If no restaurant selected, redirect to home
  if (!onboardingData.value.selectedRestaurant && !formData.value.name) {
    router.push('/')
  }
})
</script> 