
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClasses, saveStudentSession } from '../lib/data'
import { t } from '../lib/i18n'
import LanguageToggle from '../components/LanguageToggle'

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export default function Join() {
  const navigate = useNavigate()
  const [classCode, setClassCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')

  function handleJoin(event) {
    event.preventDefault()
    setMessage('')

    const cleanCode = classCode.trim().toLowerCase()
    const cleanNickname = nickname.trim()

    if (!cleanNickname) {
      setMessage('Please enter a nickname.')
      return
    }

    if (!cleanCode) {
      setMessage('Please enter a class code.')
      return
    }

    try {
      const foundClass = getClasses().find(
        item =>
          item.classCode?.trim().toLowerCase() === cleanCode
      )

      if (!foundClass) {
        setMessage('Class not found. Please check your class code.')
        return
      }

      const studentUid = createId()

      saveStudentSession({
        id: studentUid,
        studentUid,
        nickname: cleanNickname,
        classId: foundClass.id,
        diagnosticRunId: createId()
      })

      navigate('/solve')
    } catch (error) {
      console.error('Join failed:', error)
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', padding: 24 }}>
      <LanguageToggle />

      <h1>{t('student.title')}</h1>
      <p>Join your class to start learning.</p>

      <form onSubmit={handleJoin}>
        <label htmlFor="classCode">
          {t('student.classCode')}
        </label>
        <input
          id="classCode"
          value={classCode}
          onChange={event => setClassCode(event.target.value)}
          placeholder="Enter your class code"
          autoComplete="off"
          required
          style={{
            display: 'block',
            width: '100%',
            padding: 12,
            marginBottom: 16
          }}
        />

        <label htmlFor="nickname">
          {t('student.nickname')}
        </label>
        <input
          id="nickname"
          value={nickname}
          onChange={event => setNickname(event.target.value)}
          placeholder="Enter a nickname"
          maxLength={30}
          autoComplete="nickname"
          required
          style={{
            display: 'block',
            width: '100%',
            padding: 12,
            marginBottom: 16
          }}
        />

        <button
          type="submit"
          style={{
            padding: '12px 24px',
            background: '#2563eb',
            color: '#fff',
            border: 0,
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          {t('student.join')}
        </button>
      </form>

      {message && <p role="alert">{message}</p>}
    </main>
  )
}
