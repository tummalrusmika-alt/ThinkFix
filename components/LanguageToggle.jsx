 
import { useState } from 'react'

export default function LanguageToggle() {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('thinkfix_language') || 'en'
  )

  function changeLanguage(event) {
    const selected = event.target.value
    setLanguage(selected)
    localStorage.setItem('thinkfix_language', selected)
    window.location.reload()
  }

  return (
    <label style={{ display: 'block', marginBottom: '20px' }}>
      Language / భాష:
      <select
        value={language}
        onChange={changeLanguage}
        style={{ marginLeft: '10px', padding: '8px' }}
      >
        <option value="en">English</option>
        <option value="te">తెలుగు</option>
      </select>
    </label>
  )
}