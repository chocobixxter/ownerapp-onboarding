<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Progress Header -->
    <OnboardingProgress
      :current-step="currentStep"
      :total-steps="5"
      :progress-percentage="100"
      :is-step-completed="isStepCompleted"
      @previous="handlePrevious"
    />

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto space-y-8">
        
        <!-- Loading State -->
        <div v-if="isCalculating" class="text-center py-12">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Анализируем ваш бизнес...</h2>
          <p class="text-gray-600">Рассчитываем персональную оценку и рекомендации</p>
        </div>

        <!-- Assessment Results -->
        <div v-else class="space-y-8">
          
          <!-- Hero Section -->
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 text-center">
            <div class="mb-6">
              <h1 class="text-3xl font-bold mb-2">Отличные новости! 🎉</h1>
              <p class="text-xl opacity-90">Мы проанализировали ваш ресторан и видим огромный потенциал для роста</p>
            </div>
            
            <div class="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <p class="text-lg mb-4">💡 Наша оценка: У вас есть все предпосылки для увеличения выручки на 25-40% в ближайшие 3 месяца</p>
              
              <!-- Score Display -->
              <div class="flex items-center justify-center space-x-8">
                <div class="text-center">
                  <div class="text-4xl font-bold">{{ assessment.overallScore }}</div>
                  <div class="text-sm opacity-75">Ваш текущий балл</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl">+{{ (85 - assessment.overallScore).toFixed(1) }}</div>
                  <div class="text-sm opacity-75">Потенциал роста</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl">+{{ assessment.potentialRevenueIncrease.toLocaleString() }} ₸</div>
                  <div class="text-sm opacity-75">в месяц</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Analysis -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">📊 Детальный анализ вашего бизнеса</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Current Metrics -->
              <div class="bg-blue-50 rounded-xl p-6">
                <h3 class="font-semibold text-blue-900 mb-4">💰 Финансовые показатели</h3>
                <div class="space-y-3">
                  <div>
                    <div class="text-sm text-blue-700">Средний чек:</div>
                                         <div class="text-xl font-bold text-blue-900">{{ restaurantData.averageCheck?.toLocaleString() }} ₸</div>
                  </div>
                  <div>
                    <div class="text-sm text-blue-700">Бенчмарк рынка:</div>
                    <div class="text-lg font-semibold text-blue-800">{{ getBenchmarkCheck() }} ₸</div>
                  </div>
                  <div>
                    <div class="text-sm text-blue-700">Потенциал роста:</div>
                    <div class="text-lg font-semibold text-green-600">+{{ getCheckGrowthPotential() }}%</div>
                  </div>
                </div>
              </div>

              <!-- Current Status -->
              <div class="bg-orange-50 rounded-xl p-6">
                <h3 class="font-semibold text-orange-900 mb-4">🎯 Зоны роста</h3>
                <div class="space-y-2 text-sm">
                  <div v-for="weakness in assessment.weaknesses" :key="weakness" class="flex items-start space-x-2">
                    <div class="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                    <span class="text-orange-800">{{ weakness }}</span>
                  </div>
                </div>
              </div>

              <!-- Opportunities -->
              <div class="bg-green-50 rounded-xl p-6">
                <h3 class="font-semibold text-green-900 mb-4">💡 Возможности</h3>
                <div class="space-y-2 text-sm">
                  <div v-for="opportunity in assessment.opportunities" :key="opportunity" class="flex items-start space-x-2">
                    <div class="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                    <span class="text-green-800">{{ opportunity }}</span>
                  </div>
                </div>
                <div class="mt-4 p-3 bg-green-100 rounded-lg">
                  <p class="text-xs text-green-800">💡 <strong>Хорошая новость:</strong> Все эти проблемы решаемы! Рестораны с похожими показателями после внедрения наших решений увеличивают выручку в среднем на 32% за первые 3 месяца.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Personalized Recommendations -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">🚀 Персональные рекомендации для вашего роста</h2>
            <p class="text-gray-600 mb-6">На основе анализа вашего бизнеса мы подобрали решения, которые принесут максимальную отдачу</p>
            
            <div class="space-y-6">
              <div 
                v-for="recommendation in assessment.recommendations" 
                :key="recommendation.id"
                class="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-3">
                      <div 
                        class="px-3 py-1 rounded-full text-xs font-medium"
                        :class="{
                          'bg-red-100 text-red-800': recommendation.priority === 'critical',
                          'bg-orange-100 text-orange-800': recommendation.priority === 'high',
                          'bg-yellow-100 text-yellow-800': recommendation.priority === 'medium',
                          'bg-blue-100 text-blue-800': recommendation.priority === 'low'
                        }"
                      >
                        {{ getPriorityLabel(recommendation.priority) }}
                      </div>
                      <div class="text-sm text-gray-500">{{ recommendation.category }}</div>
                    </div>
                    
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ recommendation.title }}</h3>
                    <p class="text-gray-600 mb-4">{{ recommendation.description }}</p>
                    
                    <div class="flex items-center space-x-6 text-sm">
                      <div>
                        <span class="text-gray-500">Ожидаемый эффект:</span>
                        <span class="font-semibold text-green-600 ml-1">{{ recommendation.expectedEffect }}</span>
                      </div>
                      <div v-if="recommendation.revenueIncrease">
                        <span class="text-gray-500">Доход:</span>
                        <span class="font-semibold text-blue-600 ml-1">+{{ recommendation.revenueIncrease.toLocaleString() }} ₸/мес</span>
                      </div>
                    </div>
                  </div>
                  
                  <button class="ml-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap">
                    {{ recommendation.actionLabel }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ContactForm 
            :selected-location="onboardingData.selectedRestaurant"
            :analysis-result="null"
            analysis-type="full"
            :onboarding-data="onboardingData"
          />

          <!-- Action Buttons -->
          <div class="flex justify-between items-center pt-6">
            <button
              @click="handlePrevious"
              class="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Назад
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
import { useOnboarding } from '@/composables/useOnboarding'
import OnboardingProgress from '@/components/OnboardingProgress.vue'
import type { BusinessAssessment, BusinessRecommendation } from '@/types'
import ContactForm from '@/components/ContactForm.vue'

const router = useRouter()
const { 
  onboardingData,
  currentStep, 
  isStepCompleted, 
  previousStep,
  loadFromStorage
} = useOnboarding()

const isCalculating = ref(true)

// Mock business assessment based on onboarding data
const assessment = ref<BusinessAssessment>({
  overallScore: 37,
  maxScore: 100,
  grade: 'developing',
  potentialGrowth: 48,
  potentialRevenueIncrease: 110000,
  onlinePresence: 25,
  automation: 15,
  reputation: 45,
  teamMotivation: 30,
  recommendations: [],
  strengths: ['Хорошее расположение', 'Качественная кухня'],
  weaknesses: ['Онлайн-присутствие слабое', 'Автоматизация отсутствует', 'Репутация не отслеживается', 'Команда не мотивирована'],
  opportunities: ['Запуск доставки', 'Создание мобильного приложения', 'Внедрение аналитики', 'Программа лояльности']
})

const restaurantData = computed(() => onboardingData.value.restaurantData)

  // Calculate benchmark and growth potential
 const getBenchmarkCheck = () => {
   const current = restaurantData.value.averageCheck || 3000
   return Math.round(current * 1.4) // 40% higher than current
 }

const getCheckGrowthPotential = () => {
  return 68 // Based on benchmark comparison
}

// Generate personalized recommendations based on problems and goals
const generateRecommendations = (): BusinessRecommendation[] => {
  const problems = onboardingData.value.problems
  const goals = onboardingData.value.goals
  const recommendations: BusinessRecommendation[] = []

  // Analytics recommendation (always high priority)
  recommendations.push({
    id: 'analytics',
    title: 'Аналитика и KPI',
    description: 'Увеличение среднего чека на 25-30%, оптимизация меню и цен, прогнозирование спроса',
    priority: 'critical',
    category: 'analytics',
    expectedEffect: '+180,000 ₸ к месячной выручке',
    revenueIncrease: 180000,
    implementationTime: '2-3 недели',
    actionLabel: 'Начать анализ бизнеса'
  })

  // Mobile app recommendation if goals include it
  if (goals?.mobileApp || goals?.qrMenuOnlinePayment) {
    recommendations.push({
      id: 'mobile-app',
      title: 'Мобильное приложение',
      description: 'Прямые заказы без комиссий агрегаторов, QR-меню и бесконтактные заказы, программа лояльности',
      priority: 'high',
      category: 'mobile',
      expectedEffect: 'Экономия до 15% с каждого заказа',
      revenueIncrease: 85000,
      implementationTime: '4-6 недель',
      actionLabel: 'Создать приложение'
    })
  }

  // Reputation management if problems with marketing
  if (problems?.marketingDifficulties || problems?.noClients) {
    recommendations.push({
      id: 'reputation',
      title: 'Управление репутацией',
      description: 'Автосбор отзывов с 2GIS, Google, Yandex, AI-ответы на негативные отзывы, программы лояльности для недовольных',
      priority: 'high',
      category: 'reputation',
      expectedEffect: 'Рейтинг выше 4.3 = +20% новых клиентов',
      revenueIncrease: 65000,
      implementationTime: '1-2 недели',
      actionLabel: 'Улучшить репутацию'
    })
  }

  // Staff motivation if high turnover
  if (problems?.highStaffTurnover || problems?.staffRecruitment) {
    recommendations.push({
      id: 'staff-motivation',
      title: 'Мотивация персонала',
      description: 'Индивидуальные KPI для каждого сотрудника, система наград и достижений, конкурсы между сотрудниками',
      priority: 'medium',
      category: 'staff',
      expectedEffect: 'Продажи растут на 15% при мотивированном персонале',
      revenueIncrease: 45000,
      implementationTime: '2-4 недели',
      actionLabel: 'Мотивировать команду'
    })
  }

  return recommendations
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    critical: 'Критично важно',
    high: 'Быстрый результат',
    medium: 'Долгосрочный эффект',
    low: 'Дополнительно'
  }
  return labels[priority as keyof typeof labels] || priority
}

// Navigation handlers
const handlePrevious = () => {
  if (previousStep()) {
    router.push('/onboarding/problems-goals')
  }
}

const downloadReport = () => {
  // TODO: Generate and download PDF report
  console.log('Downloading business assessment report...')
}

const proceedToDashboard = () => {
  // Mark onboarding as completed
  onboardingData.value.completed = true
  onboardingData.value.steps.completed = [true, true, true, true]
  
  // TODO: Redirect to OwnerApp Dashboard
  console.log('Proceeding to OwnerApp Dashboard...')
  alert('Переход в панель управления (OwnerApp Dashboard)')
}

// Initialize assessment
onMounted(async () => {
  loadFromStorage()
  
  // If no data, redirect to start
  if (!onboardingData.value.restaurantData?.name) {
    router.push('/')
    return
  }
  
  // Simulate calculation time
  setTimeout(() => {
    assessment.value.recommendations = generateRecommendations()
    isCalculating.value = false
  }, 2000)
})
</script> 