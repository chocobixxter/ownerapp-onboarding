import type { LocationResult, OnboardingData, AnalysisResult } from '@/types'

export interface ContactFormData {
    name: string
    phone: string
    position?: string
    privacyConsent: boolean
}

export interface SlackNotificationData {
    type: 'full_analysis' | 'smart_analysis'
    contactInfo: ContactFormData
    locationData: LocationResult
    timestamp: string

    // Additional data for full analysis
    onboardingData?: OnboardingData
    analysisResult?: AnalysisResult
}

class SlackService {
    private readonly bffUrl: string

    constructor() {
        this.bffUrl = import.meta.env.VITE_BFF_URL || 'http://localhost:3001'
    }

    /**
     * Send notification for full analysis completion
     */
    async sendFullAnalysisNotification(
        contactInfo: ContactFormData,
        onboardingData: OnboardingData,
        analysisResult?: AnalysisResult
    ): Promise<boolean> {
        if (!this.bffUrl) {
            console.warn('BFF URL not configured')
            return false
        }

        const locationData = onboardingData.selectedRestaurant
        if (!locationData) {
            console.error('No location data available for Slack notification')
            return false
        }

        const slackMessage = this.formatFullAnalysisMessage({
            type: 'full_analysis',
            contactInfo,
            locationData,
            onboardingData,
            analysisResult,
            timestamp: new Date().toISOString()
        })

        return this.sendSlackMessage(slackMessage)
    }

    /**
     * Send notification for smart/quick analysis completion
     */
    async sendSmartAnalysisNotification(
        contactInfo: ContactFormData,
        locationData: LocationResult,
        analysisResult?: AnalysisResult
    ): Promise<boolean> {
        if (!this.bffUrl) {
            console.warn('BFF URL not configured')
            return false
        }

        const slackMessage = this.formatSmartAnalysisMessage({
            type: 'smart_analysis',
            contactInfo,
            locationData,
            analysisResult,
            timestamp: new Date().toISOString()
        })

        return this.sendSlackMessage(slackMessage)
    }

    /**
     * Format Slack message for full analysis
     */
    private formatFullAnalysisMessage(data: SlackNotificationData): any {
        const { contactInfo, locationData, onboardingData, analysisResult } = data
        const restaurantData = onboardingData?.restaurantData

        const blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "🎯 Новый полный анализ завершён"
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Имя:*\n${contactInfo.name}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Телефон:*\n${contactInfo.phone}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Должность:*\n${contactInfo.position || 'Not specified'}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Дата подачи:*\n${new Date(data.timestamp).toLocaleString('ru-RU')}`
                    }
                ]
            },
            {
                type: "divider"
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*🏪 Информация о ресторане*"
                },
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Название:*\n${locationData.name}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Адрес:*\n${locationData.address}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Город:*\n${locationData.city}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Координаты:*\n${locationData.coordinates.lat}, ${locationData.coordinates.lng}`
                    }
                ]
            }
        ]

        // Add business details if available
        if (restaurantData) {
            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*💼 Детали бизнеса*"
                },
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Телефон:*\n${restaurantData.phone || 'Не указан'}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Email:*\n${restaurantData.email || 'Не указан'}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Сайт:*\n${restaurantData.website || 'Не указан'}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Тип:*\n${this.formatRestaurantType(restaurantData.restaurantType)}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Кухня:*\n${restaurantData.cuisineType || 'Не указана'}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Средний чек:*\n${restaurantData.averageCheck ? `${restaurantData.averageCheck} ₸` : 'Не указан'}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Заказов в день:*\n${restaurantData.ordersPerDay || 'Не указано'}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Услуги:*\n${this.formatServices(restaurantData)}`
                    }
                ]
            })
        }

        // Add problems and goals
        if (onboardingData?.problems && onboardingData?.goals) {
            const problemsList = this.formatProblemsGoals(onboardingData.problems, 'problems')
            const goalsList = this.formatProblemsGoals(onboardingData.goals, 'goals')

            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*🎯 Проблемы и цели*"
                },
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Проблемы:*\n${problemsList}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Цели:*\n${goalsList}`
                    }
                ]
            })
        }

        // Add analysis results if available
        if (analysisResult) {
            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*📊 Результаты анализа*"
                },
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Общий балл:*\n${analysisResult.totalScore}/100`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Оценка:*\n${this.formatGrade(analysisResult.overallGrade)}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Проблем найдено:*\n${analysisResult.problems.length}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Рекомендаций:*\n${analysisResult.recommendations.length}`
                    }
                ]
            })
        }

        return {
            text: `Новый полный анализ: ${contactInfo.name} - ${locationData.name}`,
            blocks
        }
    }

    /**
 * Format Slack message for smart analysis
 */
    private formatSmartAnalysisMessage(data: SlackNotificationData): any {
        const { contactInfo, locationData, analysisResult } = data

        const blocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "⚡ Новый быстрый анализ завершён"
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Контактное лицо:*\n${contactInfo.name}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Телефон:*\n${contactInfo.phone}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Должность:*\n${contactInfo.position || 'Не указана'}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Время:*\n${new Date(data.timestamp).toLocaleString('ru-RU')}`
                    }
                ]
            },
            {
                type: "divider"
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*🏪 Restaurant Information*"
                },
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Name:*\n${locationData.name}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Address:*\n${locationData.address}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*City:*\n${locationData.city}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Coordinates:*\n${locationData.coordinates.lat}, ${locationData.coordinates.lng}`
                    }
                ]
            }
        ]

        // Add analysis results if available
        if (analysisResult) {
            blocks.push({
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: "*📊 Результаты быстрого анализа*"
                },
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Общий балл:*\n${analysisResult.totalScore}/100`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Оценка:*\n${this.formatGrade(analysisResult.overallGrade)}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Проблем найдено:*\n${analysisResult.problems.length}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Рекомендаций:*\n${analysisResult.recommendations.length}`
                    }
                ]
            })
        }

        return {
            text: `Новый быстрый анализ: ${contactInfo.name} - ${locationData.name}`,
            blocks
        }
    }

    /**
 * Helper method to format services
 */
    private formatServices(restaurantData: any): string {
        const services = []
        if (restaurantData.hasDelivery) services.push('Доставка')
        if (restaurantData.hasTakeaway) services.push('Самовывоз')
        if (restaurantData.hasTableReservation) services.push('Бронирование столов')
        if (restaurantData.hasLoyaltyProgram) services.push('Программа лояльности')

        return services.length > 0 ? services.join(', ') : 'Не указаны'
    }

    /**
     * Helper method to format restaurant type
     */
    private formatRestaurantType(type: string | undefined): string {
        const types: { [key: string]: string } = {
            'restaurant': 'Ресторан',
            'cafe': 'Кафе',
            'fastfood': 'Фастфуд',
            'bar': 'Бар',
            'bakery': 'Пекарня',
            'other': 'Другое'
        }

        return type ? types[type] || type : 'Не указан'
    }

    /**
     * Helper method to format grade
     */
    private formatGrade(grade: string): string {
        const grades: { [key: string]: string } = {
            'excellent': 'Отлично',
            'good': 'Хорошо',
            'fair': 'Удовлетворительно',
            'poor': 'Плохо'
        }

        return grades[grade] || grade
    }

    /**
 * Helper method to format problems and goals
 */
    private formatProblemsGoals(data: any, type: 'problems' | 'goals'): string {
        const items: string[] = []

        const labels = type === 'problems' ? {
            lowProfit: 'Низкая прибыль',
            noClients: 'Нет клиентов',
            hardToTrackMetrics: 'Сложно отслеживать метрики',
            noDelivery: 'Нет доставки',
            noCrmLoyalty: 'Нет CRM/лояльности',
            highStaffTurnover: 'Высокая текучка кадров',
            staffRecruitment: 'Проблемы с наймом',
            noMobileApp: 'Нет мобильного приложения',
            reportingIssues: 'Проблемы с отчётностью',
            noControlOverLocations: 'Нет контроля над локациями',
            highPurchaseCosts: 'Высокие закупочные цены',
            supplierQualityIssues: 'Проблемы качества поставок',
            marketingDifficulties: 'Сложности с маркетингом',
            highCompetition: 'Высокая конкуренция'
        } : {
            onlineDelivery: 'Онлайн доставка',
            takeawayOrders: 'Заказы на вынос',
            loyaltyProgram: 'Программа лояльности',
            reviewsManagement: 'Управление отзывами',
            inventoryAutomation: 'Автоматизация склада',
            mobileApp: 'Мобильное приложение',
            qrMenuOnlinePayment: 'QR-меню и онлайн оплата',
            staffManagement: 'Управление персоналом',
            predictiveAnalytics: 'Прогнозная аналитика',
            tableReservation: 'Бронирование столов'
        }

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'other' && value && typeof value === 'string') {
                items.push(`Другое: ${value}`)
            } else if (value === true) {
                const label = labels[key as keyof typeof labels]
                if (label) {
                    items.push(label)
                }
            }
        })

        return items.length > 0 ? items.join('\n• ') : 'Не указаны'
    }

    /**
     * Send message to Slack via BFF
     */
    private async sendSlackMessage(message: any): Promise<boolean> {
        try {
            const response = await fetch(`${this.bffUrl}/api/slack/webhook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message)
            })

            if (response.ok) {
                const result = await response.json()
                console.log('✅ Slack notification sent successfully via BFF:', result.message)
                return true
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                console.error('❌ Failed to send Slack notification via BFF:', response.status, response.statusText, errorData)
                return false
            }
        } catch (error) {
            console.error('❌ Error sending Slack notification via BFF:', error)
            return false
        }
    }

    /**
     * Test Slack integration via BFF
     */
    async testSlackIntegration(): Promise<boolean> {
        if (!this.bffUrl) {
            console.warn('BFF URL not configured')
            return false
        }

        try {
            const response = await fetch(`${this.bffUrl}/api/slack/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (response.ok) {
                const result = await response.json()
                console.log('✅ Slack test integration successful via BFF:', result.message)
                return true
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                console.error('❌ Slack test integration failed via BFF:', response.status, response.statusText, errorData)
                return false
            }
        } catch (error) {
            console.error('❌ Error testing Slack integration via BFF:', error)
            return false
        }
    }
}

// Export singleton instance
export const slackService = new SlackService() 