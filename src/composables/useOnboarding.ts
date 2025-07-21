import { ref, computed } from 'vue'
import type { OnboardingData, OnboardingRestaurantData, LocationResult, OnboardingProblems, OnboardingGoals } from '@/types'

const STORAGE_KEY = 'restaurant_onboarding_data'

export function useOnboarding() {
    // Reactive state
    const onboardingData = ref<OnboardingData>({
        restaurantData: {
            name: '',
            address: '',
            city: '',
            coordinates: { lat: 0, lng: 0 }
        },
        steps: {
            currentStep: 1,
            totalSteps: 5,
            completed: [false, false, false, false, false]
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false
    })

    // Computed properties
    const currentStep = computed(() => onboardingData.value.steps.currentStep)
    const isStepCompleted = computed(() => (step: number) =>
        onboardingData.value.steps.completed[step - 1]
    )
    const progressPercentage = computed(() =>
        (onboardingData.value.steps.completed.filter(Boolean).length / onboardingData.value.steps.totalSteps) * 100
    )

    // Step navigation
    const goToStep = (step: number) => {
        if (step >= 1 && step <= onboardingData.value.steps.totalSteps) {
            onboardingData.value.steps.currentStep = step
            saveToStorage()
        }
    }

    const nextStep = () => {
        const current = onboardingData.value.steps.currentStep
        if (current < onboardingData.value.steps.totalSteps) {
            // Mark current step as completed
            onboardingData.value.steps.completed[current - 1] = true
            // Move to next step
            onboardingData.value.steps.currentStep = current + 1
            onboardingData.value.updatedAt = new Date()
            saveToStorage()
            return true
        }
        return false
    }

    const previousStep = () => {
        const current = onboardingData.value.steps.currentStep
        if (current > 1) {
            onboardingData.value.steps.currentStep = current - 1
            saveToStorage()
            return true
        }
        return false
    }

    // Data setters
    const setRestaurantFromLocation = (location: LocationResult) => {
        onboardingData.value.selectedRestaurant = location
        onboardingData.value.restaurantData = {
            name: location.name,
            address: location.address,
            city: location.city,
            coordinates: location.coordinates,
            // Автозаполнение из 2GIS API данных
            restaurantType: location.businessType,
            cuisineType: location.cuisineType || '',
            // Initialize empty fields for user to fill
            phone: '',
            website: '',
            email: '',
            averageCheck: undefined,
            ordersPerDay: undefined,
            hasDelivery: false,
            hasTakeaway: false
        }
        saveToStorage()
    }

    const updateRestaurantData = (data: Partial<OnboardingRestaurantData>) => {
        onboardingData.value.restaurantData = {
            ...onboardingData.value.restaurantData,
            ...data
        }
        onboardingData.value.updatedAt = new Date()
        saveToStorage()
    }

    const setProblems = (problems: OnboardingProblems) => {
        onboardingData.value.problems = problems
        onboardingData.value.updatedAt = new Date()
        saveToStorage()
    }

    const setGoals = (goals: OnboardingGoals) => {
        onboardingData.value.goals = goals
        onboardingData.value.updatedAt = new Date()
        saveToStorage()
    }

    // Storage functions
    const saveToStorage = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(onboardingData.value))
            console.log('💾 Onboarding data saved to storage')
        } catch (err) {
            console.error('❌ Error saving onboarding data:', err)
        }
    }

    const loadFromStorage = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                // Convert date strings back to Date objects
                parsed.createdAt = new Date(parsed.createdAt)
                parsed.updatedAt = new Date(parsed.updatedAt)
                onboardingData.value = parsed
                console.log('✅ Onboarding data loaded from storage')
                return true
            }
        } catch (err) {
            console.error('❌ Error loading onboarding data:', err)
        }
        return false
    }

    const clearStorage = () => {
        localStorage.removeItem(STORAGE_KEY)
        // Reset to initial state
        onboardingData.value = {
            restaurantData: {
                name: '',
                address: '',
                city: '',
                coordinates: { lat: 0, lng: 0 }
            },
            steps: {
                currentStep: 1,
                totalSteps: 4,
                completed: [false, false, false, false]
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            completed: false
        }
    }

    // Validation
    const validateStep2 = () => {
        const data = onboardingData.value.restaurantData
        return !!(data.name && data.address && data.averageCheck && data.restaurantType)
    }

    const validateStep3 = () => {
        return !!(onboardingData.value.problems && onboardingData.value.goals)
    }

    // Restaurant types for forms
    const restaurantTypes = [
        { value: 'restaurant', label: 'Ресторан' },
        { value: 'cafe', label: 'Кафе' },
        { value: 'fastfood', label: 'Фастфуд' },
        { value: 'bar', label: 'Бар' },
        { value: 'bakery', label: 'Пекарня' },
        { value: 'other', label: 'Другое' }
    ]

    const cuisineTypes = [
        'Европейская', 'Казахская', 'Русская', 'Итальянская', 'Азиатская',
        'Американская', 'Японская', 'Китайская', 'Индийская', 'Мексиканская',
        'Французская', 'Грузинская', 'Узбекская', 'Турецкая', 'Другая'
    ]

    return {
        // State
        onboardingData,
        currentStep,
        isStepCompleted,
        progressPercentage,

        // Navigation
        goToStep,
        nextStep,
        previousStep,

        // Data management
        setRestaurantFromLocation,
        updateRestaurantData,
        setProblems,
        setGoals,

        // Storage
        saveToStorage,
        loadFromStorage,
        clearStorage,

        // Validation
        validateStep2,
        validateStep3,

        // Constants
        restaurantTypes,
        cuisineTypes
    }
} 