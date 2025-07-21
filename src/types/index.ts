export interface LocationResult {
    id: string
    name: string
    address: string
    city: string
    coordinates: {
        lat: number
        lng: number
    }
    source: 'google' | 'yandex' | '2gis'
    // Дополнительные данные от 2GIS API
    businessType?: 'restaurant' | 'cafe' | 'fastfood' | 'bar' | 'bakery' | 'other'  // Тип заведения
    cuisineType?: string   // Тип кухни (казахская, европейская, азиатская)
    categories?: string[]  // Все рубрики от API
}

export interface RestaurantData {
    name: string
    address: string
    phone?: string
    website?: string
    rating?: number
    reviewCount?: number
    categories: string[]
    photos: string[]
    workingHours?: {
        [key: string]: string
    }
    socialLinks?: {
        facebook?: string
        instagram?: string
        vk?: string
    }
}

export interface ApiResponse {
    google?: RestaurantData
    yandex?: RestaurantData
    twoGis?: RestaurantData
    website?: WebsiteData
}

export interface WebsiteData {
    hasWebsite: boolean
    title?: string
    description?: string
    socialLinks?: {
        facebook?: string
        instagram?: string
        vk?: string
    }
    hasOnlineOrdering?: boolean
    hasDelivery?: boolean
    seoScore?: number
}

export interface ScoreCategory {
    name: string
    score: number
    maxScore: number
    status: 'excellent' | 'good' | 'fair' | 'poor'
    description: string
}

export interface SearchPresence {
    query: string
    platform: string
    ranking?: number
    found: boolean
    mapPack?: boolean
    issues: string[]
}

export interface Problem {
    id: string
    title: string
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    category: 'search_results' | 'website_experience' | 'local_listings'
    impact: string
    solution: string
}

export interface Recommendation {
    id: string
    title: string
    description: string
    priority: number
    revenueImpact: string
    category: 'visibility' | 'branding' | 'technical'
}

export interface AnalysisResult {
    totalScore: number
    overallGrade: 'excellent' | 'good' | 'fair' | 'poor'
    categories: ScoreCategory[]
    searchPresence: SearchPresence[]
    problems: Problem[]
    recommendations: Recommendation[]
    apiData: ApiResponse
}

export interface SearchParams {
    query: string
    location: string
    radius?: number
}

export interface ApiError {
    message: string
    code?: string
    source: string
}

// ============= ONBOARDING TYPES =============

export interface OnboardingRestaurantData {
    // Basic info
    name: string
    address: string
    city: string
    coordinates: {
        lat: number
        lng: number
    }

    // Business details
    phone?: string
    website?: string
    email?: string

    // Restaurant specifics
    cuisineType?: string
    restaurantType?: 'restaurant' | 'cafe' | 'fastfood' | 'bar' | 'bakery' | 'other'
    averageCheck?: number
    ordersPerDay?: number

    // Services
    hasDelivery?: boolean
    hasTakeaway?: boolean
    hasTableReservation?: boolean
    hasLoyaltyProgram?: boolean
    workingHours?: {
        [key: string]: string // "monday": "09:00-22:00"
    }

    // Online presence
    socialMedia?: {
        instagram?: string
        facebook?: string
        vk?: string
        telegram?: string
    }

    // Ratings from platforms
    ratings?: {
        google?: number
        yandex?: number
        twoGis?: number
        average?: number
    }
    reviewsCount?: number
}

export interface OnboardingProblems {
    lowProfit: boolean
    noClients: boolean
    hardToTrackMetrics: boolean
    noDelivery: boolean
    noCrmLoyalty: boolean
    highStaffTurnover: boolean
    staffRecruitment: boolean
    noMobileApp: boolean
    reportingIssues: boolean
    noControlOverLocations: boolean
    highPurchaseCosts: boolean
    supplierQualityIssues: boolean
    marketingDifficulties: boolean
    highCompetition: boolean
    other: string
}

export interface OnboardingGoals {
    onlineDelivery: boolean
    takeawayOrders: boolean
    loyaltyProgram: boolean
    reviewsManagement: boolean
    inventoryAutomation: boolean
    mobileApp: boolean
    qrMenuOnlinePayment: boolean
    staffManagement: boolean
    predictiveAnalytics: boolean
    tableReservation: boolean
    other: string
}

export interface OnboardingSteps {
    currentStep: number
    totalSteps: number
    completed: boolean[]
}

export interface BusinessAssessment {
    overallScore: number
    maxScore: number
    grade: 'beginner' | 'developing' | 'advanced' | 'expert'

    // Financial metrics
    currentRevenue?: number
    potentialGrowth: number
    potentialRevenueIncrease: number

    // Category scores
    onlinePresence: number
    automation: number
    reputation: number
    teamMotivation: number

    // Recommendations with priority
    recommendations: BusinessRecommendation[]

    // Analysis details
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
}

export interface BusinessRecommendation {
    id: string
    title: string
    description: string
    priority: 'critical' | 'high' | 'medium' | 'low'
    category: 'analytics' | 'mobile' | 'reputation' | 'staff' | 'automation'
    expectedEffect: string
    revenueIncrease?: number
    implementationTime: string
    actionLabel: string
}

export interface OnboardingData {
    id?: string
    userId?: string

    // Step 1: Restaurant selection & autofill
    selectedRestaurant?: LocationResult

    // Step 2: Confirmation & correction
    restaurantData: OnboardingRestaurantData

    // Step 3: Problems & goals
    problems?: OnboardingProblems
    goals?: OnboardingGoals

    // Step 4: Business assessment
    assessment?: BusinessAssessment

    // Meta
    steps: OnboardingSteps
    createdAt: Date
    updatedAt: Date
    completed: boolean
} 