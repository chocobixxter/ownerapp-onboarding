import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Results from '../views/Results.vue'
import OnboardingConfirm from '../views/onboarding/ConfirmData.vue'
import OnboardingProblems from '../views/onboarding/Problems.vue'
import OnboardingGoals from '../views/onboarding/Goals.vue'
import OnboardingAssessment from '../views/onboarding/BusinessAssessment.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/results',
            name: 'results',
            component: Results
        },
        // Onboarding routes
        {
            path: '/onboarding/confirm-data',
            name: 'onboarding-confirm',
            component: OnboardingConfirm
        },
        {
            path: '/onboarding/problems',
            name: 'onboarding-problems',
            component: OnboardingProblems
        },
        {
            path: '/onboarding/goals',
            name: 'onboarding-goals',
            component: OnboardingGoals
        },
        {
            path: '/onboarding/business-assessment',
            name: 'onboarding-assessment',
            component: OnboardingAssessment
        }
    ]
})

export default router 