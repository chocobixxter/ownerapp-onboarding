import axios from 'axios'
import type { WebsiteData } from '@/types'

class WebsiteAnalysisService {
    constructor() {
        // Конструктор больше не использует Google API
    }

    async analyzeWebsite(restaurantName: string, address: string): Promise<WebsiteData> {
        try {
            // Поиск официального сайта ресторана
            const website = await this.findRestaurantWebsite(restaurantName, address)

            if (!website) {
                return {
                    hasWebsite: false,
                    seoScore: 0
                }
            }

            // Анализ веб-сайта
            const websiteData = await this.analyzeWebsiteContent(website)

            return {
                hasWebsite: true,
                ...websiteData
            }
        } catch (error) {
            console.error('Ошибка анализа веб-сайта:', error)
            return {
                hasWebsite: false,
                seoScore: 0
            }
        }
    }

    private async findRestaurantWebsite(restaurantName: string, address: string): Promise<string | null> {
        try {
            // Моделируем поиск веб-сайта ресторана
            // В реальной реализации можно использовать другие поисковые API или методы

            // Для демонстрации возвращаем моковый сайт с вероятностью 70%
            const hasWebsite = Math.random() > 0.3

            if (hasWebsite) {
                // Генерируем правдоподобный URL на основе названия ресторана
                const normalizedName = restaurantName.toLowerCase()
                    .replace(/[^\w\s]/gi, '')
                    .replace(/\s+/g, '-')

                return `https://${normalizedName}.kz`
            }

            return null
        } catch (error) {
            console.error('Ошибка поиска веб-сайта ресторана:', error)
            return null
        }
    }

    private isLikelyOfficialWebsite(url: string, restaurantName: string): boolean {
        const domain = url.toLowerCase()
        const name = restaurantName.toLowerCase().replace(/\s+/g, '')

        // Исключаем социальные сети и сайты отзывов
        const excludedDomains = [
            'facebook.com', 'instagram.com', 'vk.com', 'twitter.com',
            'tripadvisor.com', 'yelp.com', 'foursquare.com',
            '2gis.com', 'yandex.com'
        ]

        for (const excluded of excludedDomains) {
            if (domain.includes(excluded)) {
                return false
            }
        }

        // Проверяем, содержит ли домен название ресторана
        return domain.includes(name) || name.includes(domain.split('.')[0])
    }

    private async analyzeWebsiteContent(url: string): Promise<Partial<WebsiteData>> {
        try {
            // В реальной реализации здесь будет анализ содержимого веб-сайта
            // Пока возвращаем моковые данные анализа
            const mockAnalysis = {
                title: 'Веб-сайт ресторана',
                description: 'Отличный ресторан в Казахстане',
                socialLinks: {
                    facebook: 'https://facebook.com/restaurant',
                    instagram: 'https://instagram.com/restaurant'
                },
                hasOnlineOrdering: Math.random() > 0.5,
                hasDelivery: Math.random() > 0.3,
                seoScore: Math.floor(Math.random() * 40) + 60 // Случайный балл от 60 до 100
            }

            return mockAnalysis
        } catch (error) {
            console.error('Ошибка анализа содержимого веб-сайта:', error)
            return {
                seoScore: 40
            }
        }
    }

    private async fetchWebsiteMetadata(url: string): Promise<any> {
        try {
            // В реальной реализации можно использовать:
            // - Puppeteer для скрапинга веб-сайта
            // - Сторонний API типа LinkPreview или Microlink
            // - Серверный скрапинг с cheerio

            // Пока возвращаем моковые метаданные
            return {
                title: 'Веб-сайт ресторана',
                description: 'Отличный ресторан',
                ogImage: 'https://example.com/image.jpg',
                hasSchema: true,
                hasGoogleAnalytics: true,
                hasContact: true,
                hasMenu: true,
                hasBooking: false,
                hasDelivery: true,
                socialLinks: []
            }
        } catch (error) {
            console.error('Ошибка получения метаданных веб-сайта:', error)
            return null
        }
    }

    private calculateSeoScore(metadata: any): number {
        let score = 0

        // Основные SEO элементы
        if (metadata.title) score += 15
        if (metadata.description) score += 15
        if (metadata.ogImage) score += 10
        if (metadata.hasSchema) score += 20
        if (metadata.hasGoogleAnalytics) score += 10

        // Элементы специфичные для ресторанов
        if (metadata.hasContact) score += 10
        if (metadata.hasMenu) score += 10
        if (metadata.hasBooking) score += 5
        if (metadata.hasDelivery) score += 5

        return Math.min(score, 100)
    }
}

export const websiteAnalysisService = new WebsiteAnalysisService() 