
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getStudentSession,
  getStudentAttempts,
  getAllQuestions,
  getMistakes
} from '../lib/data'
import { getFingerprint } from '../lib/fingerprint'
import { pick, t, getLanguage } from '../lib/i18n'

const STATUS_INFO = {
  none: {
    en: 'Not assessed',
    te: 'ఇంకా అంచనా వేయలేదు',
    hi: 'अभी जाँच नहीं हुई'
  },
  active: {
    en: 'Needs practice',
    te: 'మరింత సాధన అవసరం',
    hi: 'अभ्यास की आवश्यकता है'
  },
  improving: {
    en: 'Improving',
    te: 'మెరుగుపడుతోంది',
    hi: 'सुधार हो रहा है'
  },
  provisionally_fixed: {
    en: 'Almost fixed',
    te: 'దాదాపు సరిచేయబడింది',
    hi: 'लगभग ठीक हो गया'
  },
  reopened: {
    en: 'Needs more practice',
    te: 'మరింత సాధన అవసరం',
    hi: 'और अभ्यास की आवश्यकता है'
  }
}

const STATUS_COLORS = {
  none: '#64748b',
  active: '#dc2626',
  improving: '#d97706',
  provisionally_fixed: '#16a34a',
  reopened: '#ea580c'
}

export default function Fingerprint() {
  const navigate = useNavigate()
  const language = getLanguage()

  const session = getStudentSession()

  const mistakes = getMistakes() || []
  const questions = getAllQuestions() || []

  const attempts = session?.studentUid
    ? getStudentAttempts(session.studentUid)
    : []

  const fingerprint = useMemo(() => {
    try {
      return getFingerprint(attempts, questions)
    } catch (error) {
      console.error('Fingerprint calculation failed:', error)
      return {}
    }
  }, [attempts, questions])

  if (!session?.studentUid) {
    return (
      <main style={{ maxWidth: 640, margin: '30px auto', padding: 24 }}>
        <h1>{t('student.fingerprint')}</h1>
        <p>Please join your class before viewing your fingerprint.</p>
        <button onClick={() => navigate('/join')}>
          Join class
        </button>
      </main>
    )
  }

  return (
    <main
      style={{
        maxWidth: 760,
        margin: '30px auto',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6
      }}
    >
      <h1>{t('student.fingerprint')}</h1>

      <p>
        Your mistake fingerprint shows how your understanding is
        improving as you practise.
      </p>

      <p>
        Student: <strong>{session.nickname || 'Student'}</strong>
      </p>

      {mistakes.length === 0 ? (
        <p>No mistake records are available.</p>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {mistakes.map(mistake => {
            const status = fingerprint[mistake.id] || 'none'
            const statusText =
              STATUS_INFO[status]?.[language] ||
              STATUS_INFO[status]?.en ||
              'Not assessed'

            return (
              <article
                key={mistake.id}
                style={{
                  padding: 18,
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  background: '#fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: 18 }}>
                    {mistake.id}: {pick(mistake.name, language)}
                  </h2>

                  <span
                    style={{
                      color: STATUS_COLORS[status] || '#64748b',
                      fontWeight: 'bold'
                    }}
                  >
                    {statusText}
                  </span>
                </div>

                <p style={{ marginBottom: 0 }}>
                  {pick(mistake.hint, language)}
                </p>

                <div
                  style={{
                    height: 8,
                    background: '#e2e8f0',
                    borderRadius: 8,
                    marginTop: 14,
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width:
                        status === 'provisionally_fixed'
                          ? '100%'
                          : status === 'improving'
                            ? '60%'
                            : status === 'active' || status === 'reopened'
                              ? '25%'
                              : '0%',
                      background: STATUS_COLORS[status] || '#64748b'
                    }}
                  />
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 24
        }}
      >
        <Link to="/learn">← Back to lesson</Link>

        <Link to="/test">Take another test →</Link>

        <Link to="/result">View results →</Link>
      </div>
    </main>
  )
}
