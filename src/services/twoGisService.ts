import axios from 'axios'
import type { LocationResult, RestaurantData, SearchParams } from '@/types'

class TwoGisService {
    private apiKey: string
    private useMapGLFallback: boolean = false

    constructor() {
        // Use the same key format as the working example
        this.apiKey = import.meta.env.VITE_TWOGIS_API_KEY || import.meta.env.VITE_MAP_KEY || ''
    }

    async searchPlaces(params: SearchParams): Promise<LocationResult[]> {
        if (!this.apiKey) {
            console.warn('2GIS API key is not configured')
            return this.getMockSearchResults(params.query)
        }

        // If we've determined that the key is for MapGL, skip API calls and use mock data
        if (this.useMapGLFallback) {
            console.info('Using 2GIS mock data - MapGL key detected')
            return this.getMockSearchResults(params.query)
        }

        try {
            // Try the public 2GIS Catalog API endpoint with better search parameters
            const searchQuery = `${params.query}`
            const response = await axios.get('https://catalog.api.2gis.com/3.0/items', {
                params: {
                    key: this.apiKey,
                    q: 'г. Алматы ' + searchQuery,
                    type: 'branch',
                    fields: 'items.point,items.address,items.full_address_name,items.contact_groups,items.rubrics,items.name',
                    page_size: 10,
                    locale: 'ru_KZ',
                },
                timeout: 8000 // 8 second timeout
            })

            console.log('2GIS API Response status:', response.status)
            console.log('2GIS API Response data structure:', {
                hasResult: !!response.data?.result,
                hasItems: !!response.data?.result?.items,
                itemCount: response.data?.result?.items?.length || 0
            })

            const results: LocationResult[] = []
            const items = response.data?.result?.items || []

            if (items.length === 0) {
                console.warn('2GIS API: No items found for query:', searchQuery)
            }

            for (const item of items) {
                const location = this.extractLocationFromItem(item)
                if (location) {
                    results.push(location)
                }
            }

            console.log(`2GIS API: Successfully extracted ${results.length} locations`)
            return results
        } catch (error) {
            console.error('2GIS Catalog API error:', error)

            // Handle specific authorization errors
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    console.warn('2GIS Catalog API: Authorization error (403)')
                    console.warn('This means your API key is likely for 2GIS MapGL SDK, not the Catalog API')
                    console.warn('MapGL keys cannot access Catalog API endpoints')
                    console.warn('Using demo data instead of real API data')

                    // Mark that this is a MapGL key so we don't try API calls again
                    this.useMapGLFallback = true
                } else if (error.response?.status === 400) {
                    console.error('2GIS API Bad Request (400):', error.response?.data)
                } else if (error.response?.status === 401) {
                    console.error('2GIS API Unauthorized (401): Invalid API key')
                } else if (error.response?.status === 429) {
                    console.error('2GIS API Rate Limit (429): Too many requests')
                } else {
                    console.error('2GIS API Error:', error.response?.status, error.response?.data)
                }
            } else {
                console.error('2GIS Network/Connection error:', error instanceof Error ? error.message : 'Unknown error')
            }

            // Return mock data for demonstration when API fails
            return this.getMockSearchResults(params.query)
        }
    }

    async getPlaceDetails(placeId: string): Promise<RestaurantData> {
        if (!this.apiKey || this.useMapGLFallback) {
            console.info('Using 2GIS mock restaurant data')
            return this.getMockRestaurantData()
        }

        try {
            // Try to get place details using the Catalog API
            const response = await axios.get(`https://catalog.api.2gis.com/3.0/items/byid`, {
                params: {
                    key: this.apiKey,
                    id: placeId,
                    fields: 'items.point,items.address,items.full_address_name,items.contact_groups,items.rubrics,items.schedule,items.schedule_special,items.reviews,items.photos,items.name_ex,items.delivery,items.order_with_cart'
                },
                timeout: 5000 // 5 second timeout
            })

            const item = response.data?.result?.items?.[0]
            if (!item) {
                throw new Error('Place not found')
            }

            return this.extractRestaurantData(item)
        } catch (error) {
            console.error('2GIS Place Details API error:', error)

            // Handle specific authorization errors
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 403) {
                    console.warn('2GIS Catalog API: MapGL key detected, using demo data')
                    this.useMapGLFallback = true
                }
            }

            // Return mock data as fallback
            return this.getMockRestaurantData()
        }
    }

    // Check if the service is working properly
    getServiceStatus(): { working: boolean, keyType: string, message: string } {
        if (!this.apiKey) {
            return {
                working: false,
                keyType: 'none',
                message: 'No API key configured'
            }
        }

        if (this.useMapGLFallback) {
            return {
                working: false,
                keyType: 'mapgl',
                message: 'MapGL key detected - using demo data. For real data, a Catalog API key is needed.'
            }
        }

        return {
            working: true,
            keyType: 'catalog',
            message: 'Catalog API key configured'
        }
    }

    // Alternative method: Use 2GIS Geocoding API (if available with MapGL key)
    async searchPlacesAlternative(params: SearchParams): Promise<LocationResult[]> {
        if (!this.apiKey) {
            return []
        }

        try {
            // Try using the geocoding endpoint instead
            const response = await axios.get('https://catalog.api.2gis.com/2.0/geo/search', {
                params: {
                    key: this.apiKey,
                    q: `${params.query} restaurant Kazakhstan`,
                    fields: 'items.point,items.adm_div,items.full_name,items.purpose_name',
                    limit: 10
                },
                timeout: 5000
            })

            const results: LocationResult[] = []
            const items = response.data?.result?.items || []

            for (const item of items) {
                const location = this.extractLocationFromGeoItem(item)
                if (location) {
                    results.push(location)
                }
            }

            return results
        } catch (error) {
            console.error('2GIS Geocoding API error:', error)
            return []
        }
    }

    private extractLocationFromGeoItem(item: any): LocationResult | null {
        try {
            const id = item.id || Math.random().toString()
            const name = item.full_name || item.name || ''
            const address = item.full_name || ''
            const city = item.adm_div?.[0]?.name || 'Kazakhstan'
            const coordinates = item.point

            return {
                id,
                name,
                address,
                city,
                coordinates: {
                    lat: coordinates?.lat || 0,
                    lng: coordinates?.lon || 0
                },
                source: '2gis'
            }
        } catch (error) {
            console.error('Error extracting location from 2GIS geo item:', error)
            return null
        }
    }

    private getMockSearchResults(query: string): LocationResult[] {
        console.info(`Generating mock 2GIS results for: ${query}`)

        // Generate Kazakhstan-specific mock results
        const kazakhstanCities = ['Almaty', 'Nur-Sultan', 'Shymkent', 'Aktobe', 'Taraz']
        const restaurantTypes = ['Restaurant', 'Cafe', 'Fast Food', 'Traditional Kitchen']

        return kazakhstanCities.slice(0, 3).map((city, index) => ({
            id: `mock-2gis-${index + 1}`,
            name: `${query} ${restaurantTypes[index % restaurantTypes.length]} (Demo)`,
            address: `${Math.floor(Math.random() * 999) + 1} Respublika Avenue, ${city}, Kazakhstan`,
            city,
            coordinates: {
                lat: 43.2220 + (Math.random() - 0.5) * 10, // Vary around Kazakhstan coordinates
                lng: 76.8512 + (Math.random() - 0.5) * 20
            },
            source: '2gis'
        }))
    }

    private getMockRestaurantData(): RestaurantData {
        const mockNames = ['Dastarkhan Restaurant', 'Almaty Kitchen', 'Traditional Taste', 'Modern Bistro']
        const mockName = mockNames[Math.floor(Math.random() * mockNames.length)]

        return {
            name: `${mockName} (Demo - 2GIS)`,
            address: '123 Republic Avenue, Almaty, Kazakhstan',
            phone: '+7 (727) 555-0123',
            website: 'https://demo-restaurant.com',
            rating: Number((3.5 + Math.random() * 1.5).toFixed(1)), // Random rating between 3.5-5.0
            reviewCount: Math.floor(Math.random() * 300) + 50, // Random review count 50-350
            categories: ['Restaurant', 'Kazakh Cuisine', 'Traditional Food'],
            photos: [
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
                'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400'
            ],
            workingHours: {
                'Monday': '11:00 - 23:00',
                'Tuesday': '11:00 - 23:00',
                'Wednesday': '11:00 - 23:00',
                'Thursday': '11:00 - 23:00',
                'Friday': '11:00 - 01:00',
                'Saturday': '11:00 - 01:00',
                'Sunday': '11:00 - 22:00'
            },
            socialLinks: {
                instagram: 'https://instagram.com/demo_restaurant',
                facebook: 'https://facebook.com/demo_restaurant'
            }
        }
    }

    private extractLocationFromItem(item: any): LocationResult | null {
        try {
            const id = item.id || Math.random().toString()
            const name = item.name || ''
            // Use full_address_name for complete address as specified
            const address = item.full_address_name || item.address?.name || ''
            const city = item.address?.city_name || 'Kazakhstan'
            const coordinates = item.point

            // Извлекаем рубрики (категории заведения)
            const rubrics = item.rubrics || []
            const categories = rubrics.map((rubric: any) => rubric.name).filter(Boolean)

            // Определяем тип заведения и кухни из рубрик
            const { businessType, cuisineType } = this.classifyRubrics(categories)

            return {
                id,
                name,
                address, // Now shows full address in search results
                city,
                coordinates: {
                    lat: coordinates?.lat || 0,
                    lng: coordinates?.lon || 0
                },
                source: '2gis',
                businessType,
                cuisineType,
                categories
            }
        } catch (error) {
            console.error('Error extracting location from 2GIS item:', error)
            return null
        }
    }

    private classifyRubrics(categories: string[]): {
        businessType?: 'restaurant' | 'cafe' | 'fastfood' | 'bar' | 'bakery' | 'other',
        cuisineType?: string
    } {
        const lowerCategories = categories.map(cat => cat.toLowerCase())

        // Определяем тип заведения (совместимо с OnboardingRestaurantData)
        let businessType: 'restaurant' | 'cafe' | 'fastfood' | 'bar' | 'bakery' | 'other' | undefined

        if (lowerCategories.some(cat => cat.includes('ресторан') || cat.includes('restaurant'))) {
            businessType = 'restaurant'
        } else if (lowerCategories.some(cat => cat.includes('кафе') || cat.includes('cafe') || cat.includes('кофе'))) {
            businessType = 'cafe'
        } else if (lowerCategories.some(cat => cat.includes('быстр') || cat.includes('fast') || cat.includes('фаст'))) {
            businessType = 'fastfood'
        } else if (lowerCategories.some(cat => cat.includes('бар') || cat.includes('bar'))) {
            businessType = 'bar'
        } else if (lowerCategories.some(cat => cat.includes('пиц') || cat.includes('pizz') || cat.includes('пекарн') || cat.includes('bakery'))) {
            businessType = 'bakery'
        } else if (lowerCategories.some(cat => cat.includes('столовая') || cat.includes('canteen'))) {
            businessType = 'other'
        }

        // Определяем тип кухни
        let cuisineType: string | undefined

        if (lowerCategories.some(cat => cat.includes('казах') || cat.includes('kazakh'))) {
            cuisineType = 'Казахская'
        } else if (lowerCategories.some(cat => cat.includes('европ') || cat.includes('europ'))) {
            cuisineType = 'Европейская'
        } else if (lowerCategories.some(cat => cat.includes('азиат') || cat.includes('asian') || cat.includes('восточ'))) {
            cuisineType = 'Азиатская'
        } else if (lowerCategories.some(cat => cat.includes('итальян') || cat.includes('italian'))) {
            cuisineType = 'Итальянская'
        } else if (lowerCategories.some(cat => cat.includes('китай') || cat.includes('chinese'))) {
            cuisineType = 'Китайская'
        } else if (lowerCategories.some(cat => cat.includes('японс') || cat.includes('japanese') || cat.includes('суши') || cat.includes('sushi'))) {
            cuisineType = 'Японская'
        } else if (lowerCategories.some(cat => cat.includes('узбек') || cat.includes('uzbek'))) {
            cuisineType = 'Узбекская'
        } else if (lowerCategories.some(cat => cat.includes('кавказ') || cat.includes('caucas') || cat.includes('грузин'))) {
            cuisineType = 'Кавказская'
        } else if (lowerCategories.some(cat => cat.includes('американ') || cat.includes('american'))) {
            cuisineType = 'Американская'
        } else if (lowerCategories.some(cat => cat.includes('мекси') || cat.includes('mexic'))) {
            cuisineType = 'Мексиканская'
        }

        return { businessType, cuisineType }
    }

    private extractRestaurantData(item: any): RestaurantData {
        const contactGroups = item.contact_groups || []
        const phoneGroup = contactGroups.find((group: any) => group.type === 'phone')
        const websiteGroup = contactGroups.find((group: any) => group.type === 'website')

        const phone = phoneGroup?.contacts?.[0]?.value || ''
        const website = websiteGroup?.contacts?.[0]?.value || ''

        // Extract rubrics (cuisine types) as specified
        const rubrics = item.rubrics || []
        const categories = rubrics.map((rubric: any) => rubric.name).slice(0, 3)

        // Add cuisine type from name_ex.extension if available
        if (item.name_ex?.extension) {
            categories.unshift(item.name_ex.extension)
        }

        // Extract rating using the correct field paths
        const reviews = item.reviews || {}
        const rating = reviews.rating || reviews.org_rating || 0
        const reviewCount = reviews.general_review_count || reviews.review_count || 0

        // Extract schedule information
        const schedule = item.schedule || item.schedule_special || {}
        const workingHours: { [key: string]: string } = {}

        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        // Handle different schedule formats
        if (schedule.Everyday) {
            dayNames.forEach(day => {
                workingHours[day] = schedule.Everyday
            })
        } else {
            // Extract individual day schedules
            dayKeys.forEach((dayKey, index) => {
                if (schedule[dayKey]) {
                    const daySchedule = schedule[dayKey]
                    if (daySchedule.working_hours) {
                        const hours = daySchedule.working_hours.map((h: any) => `${h.from} - ${h.to}`).join(', ')
                        workingHours[dayNames[index]] = hours
                    }
                }
            })
        }

        // Extract photos
        const photos = item.photos ? item.photos.map((photo: any) => photo.url).slice(0, 5) : []

        // Add delivery and ordering info to categories if available
        if (item.delivery || item.order_with_cart) {
            categories.push('Delivery Available')
        }
        if (item.order_with_cart) {
            categories.push('Online Ordering')
        }

        return {
            name: item.name || '',
            address: item.full_address_name || item.address?.name || '', // Use full address
            phone,
            website,
            rating: Number(rating) || 0,
            reviewCount: Number(reviewCount) || 0,
            categories: categories.filter(Boolean), // Remove empty categories
            photos,
            workingHours,
            socialLinks: {}
        }
    }
}

export const twoGisService = new TwoGisService() 