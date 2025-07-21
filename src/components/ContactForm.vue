<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Получите персональные рекомендации</h2>
      <p class="text-gray-600">Оставьте свои контакты, и мы вышлем детальный отчет с индивидуальными рекомендациями для вашего ресторана</p>
    </div>

    <!-- Contact Form -->
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="contact-name" class="block text-sm font-medium text-gray-700 mb-2">
            Имя <span class="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            v-model="contactForm.name"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Ваше имя"
          />
        </div>

        <div>
          <label for="contact-phone" class="block text-sm font-medium text-gray-700 mb-2">
            Телефон <span class="text-red-500">*</span>
          </label>
          <input
            id="contact-phone"
            v-model="contactForm.phone"
            type="tel"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="+7 (777) 123-45-67"
          />
        </div>
      </div>

      <div>
        <label for="contact-position" class="block text-sm font-medium text-gray-700 mb-2">
          Должность
        </label>
        <input
          id="contact-position"
          v-model="contactForm.position"
          type="text"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Управляющий, директор..."
        />
      </div>

      <!-- Privacy Notice -->
      <div class="flex items-start space-x-3">
        <input
          id="privacy-consent"
          v-model="contactForm.privacyConsent"
          type="checkbox"
          required
          class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mt-0.5"
        />
        <label for="privacy-consent" class="text-sm text-gray-600">
          Я согласен на обработку персональных данных и получение информационных материалов <span class="text-red-500">*</span>
        </label>
      </div>

      <!-- Submit Button -->
      <div class="pt-4">
        <button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          <span v-if="isSubmitting" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Отправляем...
          </span>
          <span v-else class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            Получить персональные рекомендации
          </span>
        </button>
      </div>
    </form>

    <!-- Success Message -->
    <div v-if="isSubmitted" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <p class="text-green-700 font-medium">Спасибо! Ваши контакты получены.</p>
      </div>
      <p class="text-green-600 text-sm mt-1">Мы свяжемся с вами в ближайшее время для предоставления детального отчета.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { slackService, type ContactFormData as SlackContactFormData } from '@/services/slackService'
import type { LocationResult, AnalysisResult, OnboardingData } from '@/types'

interface ContactFormData {
  name: string
  phone: string
  position: string
  privacyConsent: boolean
}

interface Props {
  selectedLocation?: LocationResult | null
  analysisResult?: AnalysisResult | null
  analysisType?: 'full' | 'smart'
  onboardingData?: OnboardingData | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedLocation: null,
  analysisResult: null,
  analysisType: 'smart',
  onboardingData: null
})

// Form data
const contactForm = ref<ContactFormData>({
  name: '',
  phone: '',
  position: '',
  privacyConsent: false
})

// Form state
const isSubmitting = ref(false)
const isSubmitted = ref(false)

// Form validation
const isFormValid = computed(() => {
  return !!(
    contactForm.value.name &&
    contactForm.value.phone &&
    contactForm.value.privacyConsent
  )
})

// Submit handler
const handleSubmit = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Prepare contact data for Slack
    const slackContactData: SlackContactFormData = {
      name: contactForm.value.name,
      phone: contactForm.value.phone,
      position: contactForm.value.position,
      privacyConsent: contactForm.value.privacyConsent
    }
    
    // Log contact data (in real app, send to backend)
    console.log('Contact form submitted:', {
      ...contactForm.value,
      timestamp: new Date().toISOString(),
      restaurantContext: `${props.analysisType} analysis submission`,
      location: props.selectedLocation?.name
    })

    // Send Slack notification based on analysis type
    if (props.analysisType === 'full' && props.onboardingData) {
      try {
        await slackService.sendFullAnalysisNotification(
          slackContactData,
          props.onboardingData,
          props.analysisResult || undefined
        )
        console.log('✅ Full analysis Slack notification sent')
      } catch (slackError) {
        console.error('❌ Failed to send full analysis Slack notification:', slackError)
        // Don't block the form submission if Slack fails
      }
    } else if (props.analysisType === 'smart' && props.selectedLocation) {
      try {
        await slackService.sendSmartAnalysisNotification(
          slackContactData,
          props.selectedLocation,
          props.analysisResult || undefined
        )
        console.log('✅ Smart analysis Slack notification sent')
      } catch (slackError) {
        console.error('❌ Failed to send smart analysis Slack notification:', slackError)
        // Don't block the form submission if Slack fails
      }
    }

    // Show success state
    isSubmitted.value = true
    
    // Optional: Send to analytics or backend
    // await submitContactForm(contactForm.value)
    
  } catch (error) {
    console.error('Error submitting contact form:', error)
    // Handle error (could show error message)
  } finally {
    isSubmitting.value = false
  }
}
</script> 