import type { ApiResponse, AnalysisResult, Recommendation, ScoreCategory, SearchPresence, Problem } from '@/types'

class ScoringService {
    async calculateScore(apiResponse: ApiResponse): Promise<AnalysisResult> {
        // Рассчитываем оценки по категориям
        const searchResultsCategory = this.calculateSearchResultsScore(apiResponse)
        const websiteExperienceCategory = this.calculateWebsiteExperienceScore(apiResponse)
        const localListingsCategory = this.calculateLocalListingsScore(apiResponse)

        const categories = [searchResultsCategory, websiteExperienceCategory, localListingsCategory]

        // Рассчитываем общую оценку и класс
        const totalScore = Math.round(
            (searchResultsCategory.score + websiteExperienceCategory.score + localListingsCategory.score) /
            (searchResultsCategory.maxScore + websiteExperienceCategory.maxScore + localListingsCategory.maxScore) * 100
        )

        const overallGrade = this.getGradeFromScore(totalScore)

        // Анализируем присутствие в поиске
        const searchPresence = this.analyzeSearchPresence(apiResponse)

        // Выявляем проблемы
        const problems = this.identifyProblems(apiResponse, categories)

        // Генерируем рекомендации
        const recommendations = this.generateRecommendations(apiResponse, problems)

        return {
            totalScore,
            overallGrade,
            categories,
            searchPresence,
            problems,
            recommendations,
            apiData: apiResponse
        }
    }

    private calculateSearchResultsScore(apiResponse: ApiResponse): ScoreCategory {
        let score = 0
        const maxScore = 30

        // Присутствие на платформах (20 баллов)
        if (apiResponse.yandex) score += 12
        if (apiResponse.twoGis) score += 8

        // Моделирование поисковых рейтингов (10 баллов)
        // В реальной реализации проверялись бы фактические поисковые рейтинги
        const platforms = [apiResponse.yandex, apiResponse.twoGis].filter(Boolean)
        if (platforms.length >= 2) score += 5 // Найден на нескольких платформах
        if (platforms.some(p => p?.rating && p.rating > 4.0)) score += 3 // Высокий рейтинг
        if (platforms.some(p => p?.reviewCount && p.reviewCount > 20)) score += 2 // Хорошее количество отзывов

        const status = this.getStatusFromScore(score, maxScore)

        return {
            name: 'Результаты поиска',
            score,
            maxScore,
            status,
            description: `Насколько хорошо вы появляетесь когда клиенты ищут рестораны в вашем районе`
        }
    }

    private calculateWebsiteExperienceScore(apiResponse: ApiResponse): ScoreCategory {
        let score = 0
        const maxScore = 40

        const website = apiResponse.website

        // Присутствие веб-сайта (15 баллов)
        if (website?.hasWebsite) {
            score += 10
            if (website.seoScore && website.seoScore > 70) score += 5
        }

        // Онлайн-заказы и доставка (10 баллов)
        if (website?.hasOnlineOrdering) score += 5
        if (website?.hasDelivery) score += 5

        // Интеграция с социальными сетями (8 баллов)
        const socialLinks = this.getAllSocialLinks(apiResponse)
        if (socialLinks.instagram) score += 3
        if (socialLinks.facebook) score += 3
        if (socialLinks.vk) score += 2

        // Мобильный опыт (7 баллов) - моделируется на основе наличия веб-сайта
        if (website?.hasWebsite) score += 7

        const status = this.getStatusFromScore(score, maxScore)

        return {
            name: 'Опыт веб-сайта',
            score,
            maxScore,
            status,
            description: `Качество вашего веб-сайта и онлайн-опыта клиентов`
        }
    }

    private calculateLocalListingsScore(apiResponse: ApiResponse): ScoreCategory {
        let score = 0
        const maxScore = 20

        const platforms = [apiResponse.yandex, apiResponse.twoGis].filter(Boolean)

        // Полнота справочника (12 баллов)
        for (const platform of platforms) {
            if (platform?.phone) score += 1.5
            if (platform?.website) score += 1.5
            if (platform?.photos?.length) score += 1.5
            if (platform?.workingHours) score += 1.5
        }

        // Управление отзывами (8 баллов)
        const avgRating = platforms.reduce((sum, p) => sum + (p?.rating || 0), 0) / platforms.length
        const totalReviews = platforms.reduce((sum, p) => sum + (p?.reviewCount || 0), 0)

        if (avgRating > 4.0) score += 4
        else if (avgRating > 3.5) score += 2

        if (totalReviews > 50) score += 4
        else if (totalReviews > 20) score += 2

        const status = this.getStatusFromScore(score, maxScore)

        return {
            name: 'Местные справочники',
            score,
            maxScore,
            status,
            description: `Точность и полнота информации о вашем бизнесе на платформах`
        }
    }

    private analyzeSearchPresence(apiResponse: ApiResponse): SearchPresence[] {
        const presence: SearchPresence[] = []

        // Моделируем поисковые запросы и рейтинги
        const queries = ['ресторан', 'кафе', 'доставка еды']
        const platforms = [
            { name: 'Yandex', data: apiResponse.yandex },
            { name: '2GIS', data: apiResponse.twoGis }
        ]

        for (const query of queries) {
            for (const platform of platforms) {
                const issues: string[] = []
                let ranking: number | undefined

                if (!platform.data) {
                    issues.push('Не найден на платформе')
                } else {
                    // Моделируем рейтинг на основе оценки и количества отзывов
                    const rating = platform.data.rating || 0
                    const reviews = platform.data.reviewCount || 0

                    if (rating < 3.5) issues.push('Низкий рейтинг')
                    if (reviews < 10) issues.push('Мало отзывов')
                    if (!platform.data.photos?.length) issues.push('Нет фотографий')

                    // Моделируем рейтинг (1-10, где 1-3 - топ результаты)
                    if (rating > 4.0 && reviews > 20) ranking = Math.floor(Math.random() * 3) + 1
                    else if (rating > 3.5 && reviews > 10) ranking = Math.floor(Math.random() * 5) + 3
                    else ranking = Math.floor(Math.random() * 5) + 6
                }

                presence.push({
                    query,
                    platform: platform.name,
                    ranking,
                    found: !!platform.data,
                    mapPack: ranking ? ranking <= 3 : false,
                    issues
                })
            }
        }

        return presence
    }

    private identifyProblems(apiResponse: ApiResponse, categories: ScoreCategory[]): Problem[] {
        const problems: Problem[] = []

        // Проблемы с результатами поиска
        if (categories[0].status === 'poor' || categories[0].status === 'fair') {
            if (!apiResponse.yandex) {
                problems.push({
                    id: 'no-yandex-presence',
                    title: 'Отсутствие в Яндекс.Картах',
                    description: 'Ваш ресторан не найден в Яндекс.Картах',
                    severity: 'critical',
                    category: 'search_results',
                    impact: 'Потеря до 50% местных клиентов',
                    solution: 'Добавить заведение в Яндекс.Справочник'
                })
            }

            if (!apiResponse.twoGis) {
                problems.push({
                    id: 'no-twogis-presence',
                    title: 'Отсутствие в 2ГИС',
                    description: 'Ваш ресторан не найден в справочнике 2ГИС',
                    severity: 'high',
                    category: 'search_results',
                    impact: 'Потеря до 30% потенциальных клиентов',
                    solution: 'Зарегистрировать заведение в 2ГИС'
                })
            }
        }

        // Проблемы с опытом веб-сайта
        if (categories[1].status === 'poor') {
            if (!apiResponse.website?.hasWebsite) {
                problems.push({
                    id: 'no-website',
                    title: 'Отсутствие собственного сайта',
                    description: 'У ресторана нет собственного веб-сайта',
                    severity: 'high',
                    category: 'website_experience',
                    impact: 'Снижение доверия клиентов на 45%',
                    solution: 'Создать современный сайт с меню и онлайн-заказами'
                })
            }

            if (!apiResponse.website?.hasOnlineOrdering) {
                problems.push({
                    id: 'no-online-ordering',
                    title: 'Нет онлайн-заказов',
                    description: 'Клиенты не могут заказать онлайн',
                    severity: 'medium',
                    category: 'website_experience',
                    impact: 'Потеря до 30% заказов',
                    solution: 'Интегрировать систему онлайн-заказов'
                })
            }
        }

        // Проблемы местных справочников
        const platforms = [apiResponse.yandex, apiResponse.twoGis].filter(Boolean)
        const incompleteProfiles = platforms.filter(p =>
            !p?.phone || !p?.website || !p?.photos?.length || !p?.workingHours
        )

        if (incompleteProfiles.length > 0) {
            problems.push({
                id: 'incomplete-profiles',
                title: 'Неполная информация в справочниках',
                description: `Не хватает информации в ${incompleteProfiles.length} профилях`,
                severity: 'medium',
                category: 'local_listings',
                impact: 'Снижение конверсии на 25%',
                solution: 'Заполнить все поля: телефон, сайт, фото, часы работы'
            })
        }

        return problems.slice(0, 12) // Ограничиваем до 12 проблем как на скриншоте
    }

    private generateRecommendations(apiResponse: ApiResponse, problems: Problem[]): Recommendation[] {
        const recommendations: Recommendation[] = []

        // Высокоэффективные рекомендации на основе проблем
        if (problems.some(p => p.id === 'no-yandex-presence')) {
            recommendations.push({
                id: 'create-yandex-listing',
                title: 'Создать профиль в Яндекс.Картах',
                description: 'Зарегистрируйте ресторан в Яндекс.Справочнике и получите верификацию',
                priority: 1,
                revenueImpact: '+40% новых клиентов',
                category: 'visibility'
            })
        }

        if (problems.some(p => p.id === 'no-twogis-presence')) {
            recommendations.push({
                id: 'create-twogis-listing',
                title: 'Добавить заведение в 2ГИС',
                description: 'Создайте полный профиль в справочнике 2ГИС',
                priority: 2,
                revenueImpact: '+25% местных клиентов',
                category: 'visibility'
            })
        }

        if (problems.some(p => p.id === 'no-website')) {
            recommendations.push({
                id: 'build-website',
                title: 'Создать современный сайт',
                description: 'Разработайте сайт с меню, фотографиями и онлайн-заказами',
                priority: 3,
                revenueImpact: '+25% онлайн-заказов',
                category: 'branding'
            })
        }

        if (problems.some(p => p.id === 'incomplete-profiles')) {
            recommendations.push({
                id: 'complete-profiles',
                title: 'Заполнить профили в справочниках',
                description: 'Добавьте полную информацию во все справочники и карты',
                priority: 4,
                revenueImpact: '+15% конверсии',
                category: 'visibility'
            })
        }

        // Дополнительные рекомендации
        const platforms = [apiResponse.yandex, apiResponse.twoGis].filter(Boolean)
        const avgRating = platforms.reduce((sum, p) => sum + (p?.rating || 0), 0) / platforms.length

        if (avgRating < 4.0) {
            recommendations.push({
                id: 'improve-reviews',
                title: 'Улучшить управление отзывами',
                description: 'Активно просите довольных клиентов оставлять отзывы',
                priority: 5,
                revenueImpact: '+20% доверия клиентов',
                category: 'branding'
            })
        }

        return recommendations.slice(0, 8)
    }

    private getAllSocialLinks(apiResponse: ApiResponse) {
        const socialLinks = { facebook: '', instagram: '', vk: '' }
        const platforms = [apiResponse.yandex, apiResponse.twoGis, apiResponse.website].filter(Boolean)

        for (const platform of platforms) {
            if (platform?.socialLinks) {
                socialLinks.facebook = socialLinks.facebook || platform.socialLinks.facebook || ''
                socialLinks.instagram = socialLinks.instagram || platform.socialLinks.instagram || ''
                socialLinks.vk = socialLinks.vk || platform.socialLinks.vk || ''
            }
        }

        return socialLinks
    }

    private getStatusFromScore(score: number, maxScore: number): 'excellent' | 'good' | 'fair' | 'poor' {
        const percentage = (score / maxScore) * 100
        if (percentage >= 85) return 'excellent'
        if (percentage >= 70) return 'good'
        if (percentage >= 50) return 'fair'
        return 'poor'
    }

    private getGradeFromScore(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
        if (score >= 85) return 'excellent'
        if (score >= 70) return 'good'
        if (score >= 50) return 'fair'
        return 'poor'
    }
}

export const scoringService = new ScoringService() 