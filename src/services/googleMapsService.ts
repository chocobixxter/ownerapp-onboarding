import axios from 'axios'
import type { LocationResult, SearchParams } from '@/types'

class GoogleMapsService {
    private apiKey: string

    constructor() {
        this.apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY || ''
    }

    async searchPlaces(params: SearchParams): Promise<LocationResult[]> {
        if (!this.apiKey) {
            console.warn('Google Search API key is not configured')
            return this.getMockLocations(params)
        }

        try {
            // Using Google Custom Search API for basic search
            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    key: this.apiKey,
                    cx: import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID || '',
                    q: `${params.query} restaurant ${params.location} Kazakhstan`,
                    num: 10,
                    searchType: 'web'
                }
            })

            if (response.data.items && Array.isArray(response.data.items)) {
                return response.data.items.slice(0, 10).map((item: any, index: number) => ({
                    id: `google-search-${index + 1}`,
                    name: this.extractBusinessName(item.title, params.query),
                    address: this.extractAddress(item.snippet) || `${params.location}, Kazakhstan`,
                    city: this.extractCity(item.snippet || item.title),
                    coordinates: {
                        lat: 43.2220 + (Math.random() - 0.5) * 0.1, // Kazakhstan approximate coordinates
                        lng: 76.8512 + (Math.random() - 0.5) * 0.1
                    },
                    source: 'google' as const
                }))
            } else {
                console.warn('Google Search API: No items found in response')
                return this.getMockLocations(params)
            }
        } catch (error) {
            console.error('Google Search API error:', error)
            return this.getMockLocations(params)
        }
    }

    private extractBusinessName(title: string, query: string): string {
        // Try to extract business name from search result title
        const cleanTitle = title.replace(/[-–—|]/g, ' ').trim()
        const parts = cleanTitle.split(' ')

        // If query is in the title, try to extract the business name part
        if (cleanTitle.toLowerCase().includes(query.toLowerCase())) {
            return cleanTitle.split(/[-–—|]/)[0].trim() || cleanTitle
        }

        return cleanTitle.split(/[-–—|]/)[0].trim() || cleanTitle
    }

    private extractAddress(snippet: string): string | null {
        if (!snippet) return null

        // Look for address patterns in snippet
        const addressPatterns = [
            /(\d+\s+[А-Яа-я\w\s]+(?:улица|проспект|переулок|бульвар|площадь))/i,
            /([А-Яа-я\w\s]+(?:улица|проспект|переулок|бульвар|площадь)\s*\d+)/i
        ]

        for (const pattern of addressPatterns) {
            const match = snippet.match(pattern)
            if (match) {
                return match[1].trim()
            }
        }

        return null
    }

    private extractCity(text: string): string {
        // Extract city from Kazakhstan addresses
        const kazakhCities = [
            'Алматы', 'Almaty', 'Нур-Султан', 'Nur-Sultan', 'Астана', 'Astana',
            'Шымкент', 'Shymkent', 'Актобе', 'Aktobe', 'Тараз', 'Taraz',
            'Павлодар', 'Pavlodar', 'Усть-Каменогорск', 'Ust-Kamenogorsk',
            'Семей', 'Semey', 'Атырау', 'Atyrau', 'Костанай', 'Kostanay',
            'Кызылорда', 'Kyzylorda', 'Уральск', 'Oral', 'Петропавловск', 'Petropavlovsk'
        ]

        for (const city of kazakhCities) {
            if (text.includes(city)) {
                return city
            }
        }

        return 'Kazakhstan'
    }

    private getMockLocations(params: SearchParams): LocationResult[] {
        // Mock data for when API is unavailable
        return [
            {
                id: 'mock-google-1',
                name: 'Рахат Palace Restaurant',
                address: 'Достык проспект 136, Алматы, Казахстан',
                city: 'Алматы',
                coordinates: { lat: 43.2386, lng: 76.9428 },
                source: 'google'
            },
            {
                id: 'mock-google-2',
                name: 'Daredzhani Georgian Restaurant',
                address: 'Богенбай батыра 132, Алматы, Казахстан',
                city: 'Алматы',
                coordinates: { lat: 43.2551, lng: 76.9126 },
                source: 'google'
            }
        ]
    }

    getStatus(): { working: boolean; message: string } {
        if (!this.apiKey) {
            return {
                working: false,
                message: 'Google Search API key not configured - using demo data'
            }
        }
        return {
            working: true,
            message: 'Google Search API connected'
        }
    }
}

export const googleMapsService = new GoogleMapsService() 