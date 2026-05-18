import en from './locales/en.json'
import zh from './locales/zh.json'
import ar from './locales/ar.json'
import ru from './locales/ru.json'

export type Locale = 'en' | 'zh' | 'ar' | 'ru'

const messages: Record<Locale, Record<string, string>> = { en, zh, ar, ru }

export const RTL_LOCALES: Locale[] = ['ar']

export function isRTL(locale: Locale): boolean {
    return RTL_LOCALES.includes(locale)
}

export function t(key: string, locale: Locale): string {
    return messages[locale]?.[key] || messages['en']?.[key] || key
}

export function getMessages(locale: Locale): Record<string, string> {
    return messages[locale] || messages['en']
}
