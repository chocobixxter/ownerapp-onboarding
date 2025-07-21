import { ref } from 'vue'
import type { LocationResult, AnalysisResult, SearchParams } from '@/types'
import { googleMapsService } from '@/services/googleMapsService'
import { yandexMapsService } from '@/services/yandexMapsService'
import { twoGisService } from '@/services/twoGisService'
import { websiteAnalysisService } from '@/services/websiteAnalysisService'
import { scoringService } from '@/services/scoringService'

export interface AnalysisStep {
    id: string
    title: string
    description: string
    status: 'pending' | 'running' | 'completed' | 'error'
    progress: number
    duration: number // в миллисекундах
}

export function useRestaurantAnalysis() {
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const analysisSteps = ref<AnalysisStep[]>([])
    const currentStepIndex = ref(0)

    const initializeAnalysisSteps = () => {
        analysisSteps.value = [
            {
                id: 'platform-search',
                title: 'Поиск по платформам',
                description: 'Проверяем Google Search и 2GIS для вашего ресторана...',
                status: 'pending',
                progress: 0,
                duration: 2500
            },
            {
                id: 'data-extraction',
                title: 'Извлечение данных о бизнесе',
                description: 'Собираем рейтинги, отзывы и контактную информацию из 2GIS...',
                status: 'pending',
                progress: 0,
                duration: 3000
            },
            {
                id: 'website-analysis',
                title: 'Анализ онлайн-присутствия',
                description: 'Оцениваем качество сайта и SEO показатели...',
                status: 'pending',
                progress: 0,
                duration: 2000
            },
            {
                id: 'competitor-research',
                title: 'Исследование конкурентов',
                description: 'Сравниваем вашу видимость с местными конкурентами...',
                status: 'pending',
                progress: 0,
                duration: 2500
            },
            {
                id: 'scoring-analysis',
                title: 'Расчет баллов',
                description: 'Генерируем баллы видимости и брендинга с рекомендациями...',
                status: 'pending',
                progress: 0,
                duration: 1500
            }
        ]
        currentStepIndex.value = 0
    }

    const runAnalysisStep = async (step: AnalysisStep): Promise<void> => {
        step.status = 'running'

        // Симулируем реалистичный прогресс с несколькими шагами
        const progressIncrements = 10
        const incrementDelay = step.duration / progressIncrements

        for (let i = 0; i <= progressIncrements; i++) {
            step.progress = (i / progressIncrements) * 100
            await new Promise(resolve => setTimeout(resolve, incrementDelay))
        }

        step.status = 'completed'
        step.progress = 100
    }

    const getApiStatus = () => {
        const googleKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY
        const yandexStatus = yandexMapsService.getServiceStatus()
        const twoGisStatus = twoGisService.getServiceStatus()

        return {
            google: {
                working: !!googleKey,
                keyType: googleKey ? 'search' : 'none',
                message: googleKey ? 'Google Search API настроен (только поиск)' : 'Google API ключ не настроен'
            },
            yandex: {
                working: yandexStatus.working,
                keyType: 'map',
                message: 'Виджет Яндекс.Карт доступен (только отображение карты)'
            },
            twoGis: twoGisStatus,
            overall: {
                workingServices: [!!googleKey, twoGisStatus.working].filter(Boolean).length,
                totalServices: 2,
                message: twoGisStatus.keyType === 'mapgl'
                    ? 'Примечание: Сервис 2GIS использует демо данные, так как MapGL ключи не могут получить доступ к Catalog API'
                    : 'Доступные сервисы работают'
            }
        }
    }

    const searchLocations = async (query: string): Promise<LocationResult[]> => {
        isLoading.value = true
        error.value = null

        try {
            const searchParams: SearchParams = {
                query,
                location: 'Kazakhstan',
                radius: 50000 // 50km radius
            }

            // Логируем статус API для отладки
            const apiStatus = getApiStatus()
            console.log('Статус API:', apiStatus)

            // Поиск параллельно по доступным сервисам с улучшенной обработкой ошибок
            const [googleResults, twoGisResults] = await Promise.allSettled([
                googleMapsService.searchPlaces(searchParams),
                twoGisService.searchPlaces(searchParams).catch((error: any) => {
                    console.warn('Поиск 2GIS не удался, используем резервный вариант:', error.message)
                    return []
                })
            ])

            const allResults: LocationResult[] = []

            // Обрабатываем результаты Google
            if (googleResults.status === 'fulfilled') {
                console.log('Результаты Google:', googleResults.value.length)
                allResults.push(...googleResults.value)
            } else {
                console.warn('Поиск Google не удался:', googleResults.reason)
            }

            // Обрабатываем результаты 2GIS
            if (twoGisResults.status === 'fulfilled') {
                console.log('Результаты 2GIS:', twoGisResults.value.length)
                allResults.push(...twoGisResults.value)
            } else {
                console.warn('Поиск 2GIS не удался:', twoGisResults.reason)
            }

            // Удаляем дубликаты на основе сходства имени и адреса
            const uniqueResults = removeDuplicateLocations(allResults)

            console.log('Всего уникальных результатов:', uniqueResults.length)
            return uniqueResults.slice(0, 10) // Возвращаем топ 10 результатов
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Не удалось найти места'
            error.value = errorMessage
            console.error('Ошибка поиска:', errorMessage)
            return []
        } finally {
            isLoading.value = false
        }
    }

    // НОВОЕ: Поиск конкурентов вокруг локации
    const searchCompetitors = async (location: LocationResult, radius: number = 500): Promise<LocationResult[]> => {
        try {
            console.log(`🔍 Ищем конкурентов вокруг ${location.name} в радиусе ${radius}м`)

            // Определяем поисковые запросы для разных типов заведений питания
            const competitorQueries = [
                'ресторан',
                'кафе',
                'столовая',
                'быстрое питание',
                'фастфуд',
                'пиццерия',
                'суши',
                'бар'
            ]

            const competitors: LocationResult[] = []

            // Ищем каждый тип заведения
            for (const query of competitorQueries) {
                try {
                    const searchParams: SearchParams = {
                        query,
                        location: `${location.coordinates.lat},${location.coordinates.lng}`,
                        radius
                    }

                    // Используем 2GIS как основной источник для поиска конкурентов
                    const results = await twoGisService.searchPlaces(searchParams)

                    // Фильтруем оригинальный ресторан и добавляем валидных конкурентов
                    const filteredResults = results.filter(result => {
                        // Не включаем тот же ресторан
                        if (result.name.toLowerCase() === location.name.toLowerCase()) {
                            return false
                        }

                        // Проверяем, действительно ли находится в радиусе, используя координаты
                        const distance = calculateDistance(
                            location.coordinates.lat,
                            location.coordinates.lng,
                            result.coordinates.lat,
                            result.coordinates.lng
                        )

                        return distance <= radius
                    })

                    competitors.push(...filteredResults)
                } catch (err) {
                    console.warn(`Не удалось найти ${query}:`, err)
                }
            }

            // Удаляем дубликаты и сортируем по расстоянию
            const uniqueCompetitors = removeDuplicateLocations(competitors)

            // Сортируем по расстоянию от оригинальной локации
            const sortedCompetitors = uniqueCompetitors
                .map(competitor => ({
                    ...competitor,
                    distance: calculateDistance(
                        location.coordinates.lat,
                        location.coordinates.lng,
                        competitor.coordinates.lat,
                        competitor.coordinates.lng
                    )
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 15) // Ограничиваем до 15 ближайших конкурентов
                .map(({ distance, ...competitor }) => competitor) // Удаляем свойство distance

            console.log(`✅ Найдено ${sortedCompetitors.length} конкурентов вокруг ${location.name}`)

            return sortedCompetitors
        } catch (err) {
            console.error('Ошибка поиска конкурентов:', err)
            return []
        }
    }

    // Рассчитываем расстояние между двумя координатами (формула Хаверсина)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371e3 // Радиус Земли в метрах
        const φ1 = lat1 * Math.PI / 180
        const φ2 = lat2 * Math.PI / 180
        const Δφ = (lat2 - lat1) * Math.PI / 180
        const Δλ = (lng2 - lng1) * Math.PI / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c // Расстояние в метрах
    }

    const analyzeLocation = async (location: LocationResult): Promise<AnalysisResult> => {
        isLoading.value = true
        error.value = null

        try {
            // Инициализируем шаги анализа
            initializeAnalysisSteps()

            console.log('Начинаем комплексный анализ для:', location.name, 'из', location.source)

            // Шаг 1: Поиск по платформам
            currentStepIndex.value = 0
            await runAnalysisStep(analysisSteps.value[0])

            // Шаг 2: Извлечение данных
            currentStepIndex.value = 1
            const dataExtractionPromise = runAnalysisStep(analysisSteps.value[1])

            // Получаем детальные данные из доступных источников с улучшенной обработкой ошибок
            const [twoGisData, websiteData] = await Promise.allSettled([
                twoGisService.getPlaceDetails(location.id).catch((error: any) => {
                    console.warn('Получение данных места 2GIS не удалось:', error.message)
                    return undefined
                }),
                websiteAnalysisService.analyzeWebsite(location.name, location.address).catch((error: any) => {
                    console.warn('Анализ сайта не удался:', error.message)
                    return undefined
                })
            ])

            await dataExtractionPromise

            // Шаг 3: Анализ сайта
            currentStepIndex.value = 2
            await runAnalysisStep(analysisSteps.value[2])

            // Шаг 4: Исследование конкурентов
            currentStepIndex.value = 3
            await runAnalysisStep(analysisSteps.value[3])

            // Шаг 5: Анализ оценок
            currentStepIndex.value = 4
            const scoringPromise = runAnalysisStep(analysisSteps.value[4])

            const apiResponse = {
                twoGis: twoGisData.status === 'fulfilled' ? twoGisData.value : undefined,
                website: websiteData.status === 'fulfilled' ? websiteData.value : undefined
            }

            console.log('Сводка ответа API:', {
                twoGis: !!apiResponse.twoGis,
                website: !!apiResponse.website
            })

            // Рассчитываем баллы и генерируем рекомендации
            const analysisResult = await scoringService.calculateScore(apiResponse)

            await scoringPromise

            return analysisResult
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Не удалось проанализировать ресторан'
            error.value = errorMessage
            console.error('Ошибка анализа:', errorMessage)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const removeDuplicateLocations = (locations: LocationResult[]): LocationResult[] => {
        const seen = new Set<string>()
        return locations.filter(location => {
            // Создаем более сложный ключ для обнаружения дубликатов
            const normalizedName = location.name.toLowerCase().replace(/[^\w\s]/g, '').trim()
            const normalizedAddress = location.address.toLowerCase().replace(/[^\w\s]/g, '').trim()
            const key = `${normalizedName}_${normalizedAddress}_${location.city.toLowerCase()}`

            if (seen.has(key)) {
                return false
            }
            seen.add(key)
            return true
        })
    }

    return {
        isLoading,
        error,
        analysisSteps,
        currentStepIndex,
        searchLocations,
        analyzeLocation,
        searchCompetitors, // НОВОЕ: Экспортируем функцию поиска конкурентов
        getApiStatus
    }
} 