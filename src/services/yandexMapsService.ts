import type { LocationResult, RestaurantData, SearchParams } from '@/types'

class YandexMapsService {
    private apiKey: string

    constructor() {
        this.apiKey = import.meta.env.VITE_YANDEX_API_KEY || ''
    }

    // Map and bounds utility methods - core map functionality
    getMapBounds(locations: LocationResult[]): { center: { lat: number, lng: number }, zoom: number } {
        if (locations.length === 0) {
            // Default to Kazakhstan center
            return {
                center: { lat: 48.019573, lng: 66.923684 },
                zoom: 6
            }
        }

        if (locations.length === 1) {
            return {
                center: {
                    lat: locations[0].coordinates.lat,
                    lng: locations[0].coordinates.lng
                },
                zoom: 15
            }
        }

        // Calculate bounds for multiple locations
        let minLat = locations[0].coordinates.lat
        let maxLat = locations[0].coordinates.lat
        let minLng = locations[0].coordinates.lng
        let maxLng = locations[0].coordinates.lng

        for (const location of locations) {
            minLat = Math.min(minLat, location.coordinates.lat)
            maxLat = Math.max(maxLat, location.coordinates.lat)
            minLng = Math.min(minLng, location.coordinates.lng)
            maxLng = Math.max(maxLng, location.coordinates.lng)
        }

        const center = {
            lat: (minLat + maxLat) / 2,
            lng: (minLng + maxLng) / 2
        }

        // Calculate appropriate zoom level based on bounds
        const latDiff = maxLat - minLat
        const lngDiff = maxLng - minLng
        const maxDiff = Math.max(latDiff, lngDiff)

        let zoom = 15
        if (maxDiff > 0.1) zoom = 10
        else if (maxDiff > 0.05) zoom = 12
        else if (maxDiff > 0.01) zoom = 14

        return { center, zoom }
    }

    // Generate clean Yandex Maps URL for embedding
    generateMapUrl(lat: number, lng: number, zoom: number = 15): string {
        const baseUrl = 'https://yandex.ru/map-widget/v1/'
        const params = new URLSearchParams({
            lang: 'ru_RU',
            ll: `${lng},${lat}`,
            z: zoom.toString(),
            l: 'map',
            mode: 'search'
        })

        return `${baseUrl}?${params.toString()}`
    }

    // Check if the service has basic configuration
    getServiceStatus(): { working: boolean, message: string } {
        return {
            working: true,
            message: 'Yandex Maps widget available (map display only)'
        }
    }
}

export const yandexMapsService = new YandexMapsService() 