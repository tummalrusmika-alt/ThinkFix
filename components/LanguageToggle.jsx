import { useState } from 'react'
import { getLanguage } from '../lib/i18n'

export default function LanguageToggle() {
  const [language, setLanguage] = useState(getLanguage)

  function changeLanguage(event) {
    const selected = event.target.value
    localStorage.setItem('thinkfix_language', selected)
    setLanguage(selected)
    window.location.reload()
  }

  return (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <span>Language / భాష / भाषा</span>
      <select
        value={language}
        onChange={changeLanguage}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2"
      >
        <option value="en">English</option>
        <option value="te">తెలుగు</option>
        <option value="hi">हिन्दी</option>
      </select>
    </label>
  )
}