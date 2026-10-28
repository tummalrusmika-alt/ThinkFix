
import en from '../translations/en.json'
import te from '../translations/te.json'
import hi from '../translations/hi.json'

const SUPPORTED_LANGUAGES = ['en', 'te', 'hi']

function getDictionary(lang) {
  if (lang === 'te') return te
  if (lang === 'hi') return hi
  return en
}

export function getLanguage() {
  try {
    const lang = localStorage.getItem('thinkfix_language')
    return SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en'
  } catch {
    return 'en'
  }
}

// Supports plain strings and localized objects such as { en, te, hi }.
export function pick(value, lang = getLanguage()) {
  if (value == null) return ''
  if (typeof value === 'string') return value

  if (typeof value !== 'object') return ''

  return value[lang] ?? value.en ?? value.te ?? value.hi ?? ''
}

export function t(key) {
  const lang = getLanguage()
  const dictionary = getDictionary(lang)

  return dictionary[key] ?? en[key] ?? key
}

// Browser text-to-speech. Available voices depend on the device/browser.
export function speak(text, lang = getLanguage()) {
  if (typeof window === 'undefined') return false
  if (!('speechSynthesis' in window)) return false
  if (typeof text !== 'string' || !text.trim()) return false

  const localeByLanguage = {
    en: 'en-IN',
    te: 'te-IN',
    hi: 'hi-IN'
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = localeByLanguage[lang] || 'en-IN'

  window.speechSynthesis.speak(utterance)
  return true
}
