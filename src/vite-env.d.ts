/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_SEARCH_API_KEY: string
    readonly VITE_TWOGIS_API_KEY: string
    readonly VITE_YANDEX_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
} 