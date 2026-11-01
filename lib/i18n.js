
import en from '../translations/en.json'
import te from '../translations/te.json'
import hi from '../translations/hi.json'

const dictionaries = { en, te, hi }

const dashboardLabels = {
  'dashboard.learn.cards': {
    en: 'Learn',
    te: 'నేర్చుకోండి',
    hi: 'सीखें'
  },
  'dashboard.solve.cards': {
    en: 'Solve',
    te: 'పరిష్కరించండి',
    hi: 'हल करें'
  },
  'dashboard.buddy.cards': {
    en: 'Fix the Buddy',
    te: 'బడ్డీని సరిచేయండి',
    hi: 'बडी को सुधारें'
  },
  'dashboard.fingerprint.cards': {
    en: 'My Fingerprint',
    te: 'నా ఫింగర్‌ప్రింట్',
    hi: 'मेरा फिंगरप्रिंट'
  },
  'dashboard.test.cards': {
    en: 'Test Yourself',
    te: 'మిమ్మల్ని మీరు పరీక్షించుకోండి',
    hi: 'अपना परीक्षण करें'
  },
  'dashboard.result.cards': {
    en: 'My Results',
    te: 'నా ఫలితాలు',
    hi: 'मेरे परिणाम'
  }
}

export function getLanguage() {
  try {
    const saved = localStorage.getItem('thinkfix_language')
    return dictionaries[saved] ? saved : 'en'
  } catch {
    return 'en'
  }
}

export function t(key) {
  const language = getLanguage()

  return (
    dictionaries[language]?.[key] ??
    dictionaries.en?.[key] ??
    dashboardLabels[key]?.[language] ??
    key
  )
}

export function pick(value, language = getLanguage()) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return ''

  return value[language] ?? value.en ?? value.te ?? value.hi ?? ''
}

export function speak(text, language = getLanguage()) {
  if (typeof window === 'undefined') return false
  if (!('speechSynthesis' in window)) return false
  if (typeof text !== 'string' || !text.trim()) return false

  const locales = {
    en: 'en-IN',
    te: 'te-IN',
    hi: 'hi-IN'
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = locales[language] || 'en-IN'
  window.speechSynthesis.speak(utterance)

  return true
}
