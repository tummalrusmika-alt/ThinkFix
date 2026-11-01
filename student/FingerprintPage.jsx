import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getStudentSession,
  getStudentAttempts,
  getAllMistakes,
  setFocusMistake,
} from '../lib/data'
import { getFingerprint } from '../lib/fingerprint'
import { pick, t, getLanguage } from '../lib/i18n'

const STATUS = {
  none: {
    key: 'none',
    color: '#94A3B8',
    bg: '#F1F5F9',
    width: '0%',
  },
  active: {
    key: 'active',
    color: '#EF4444',
    bg: '#FEE2E2',
    width: '25%',
  },
  improving: {
    key: 'improving',
    color: '#EAB308',
    bg: '#FEF3C7',
    width: '60%',
  },
  provisionally_fixed: {
    key: 'provisionally_fixed',
    color: '#16A34A',
    bg: '#DCFCE7',
    width: '100%',
  },
  reopened: {
    key: 'reopened',
    color: '#EF4444',
    bg: '#FEE2E2',
    width: '25%',
  },
}

export default function FingerprintPage() {
  const navigate = useNavigate()
  const language = getLanguage()
  const session = getStudentSession()
  const mistakes = getAllMistakes()

  const fingerprint = useMemo(() => {
    if (!session?.studentUid) return {}

    try {
      const attempts = getStudentAttempts(session.studentUid)
      return getFingerprint(attempts)
    } catch (error) {
      console.error('Fingerprint calculation failed:', error)
      return {}
    }
  }, [session?.studentUid])

  if (!session?.studentUid) {
    return (
      <main
        style={{
          maxWidth: 640,
          margin: '30px auto',
          padding: 24,
          background: '#FFFCF5',
          borderRadius: 20,
          color: '#345B59',
        }}
      >
        <h1>{t('student.fingerprint')}</h1>
        <p>{t('fingerprint.joinFirst')}</p>
        <button
          onClick={() => navigate('/join')}
          style={{
            padding: '10px 18px',
            background: '#477C72',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
          }}
        >
          {t('fingerprint.joinClass')}
        </button>
      </main>
    )
  }

  const fixedCount = mistakes.filter(
    mistake => fingerprint[mistake.id] === 'provisionally_fixed'
  ).length

  const assessedCount = mistakes.filter(
    mistake => (fingerprint[mistake.id] || 'none') !== 'none'
  ).length

  function openLesson(id) {
    setFocusMistake(id)
    navigate('/learn')
  }

  return (
    <main
      style={{
        maxWidth: 760,
        margin: '30px auto',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6,
        background: '#FFFCF5',
        borderRadius: 20,
        color: '#344F50',
      }}
    >
      <h1 style={{ color: '#477C72' }}>
        {t('student.fingerprint')} 🎯
      </h1>

      <p>
        {t('fingerprint.intro').replace(
          '{name}',
          session.nickname || t('fingerprint.student')
        )}
      </p>

      <p>
        {t('fingerprint.almostFixed')} <strong>{fixedCount}</strong>{' '}
        {language === 'en' ? 'of' : language === 'te' ? 'లో' : 'में से'}{' '}
        {mistakes.length}
        {' · '}
        {t('fingerprint.conceptsChecked')} <strong>{assessedCount}</strong>
      </p>

      {assessedCount === 0 && (
        <p
          style={{
            color: '#B45309',
            background: '#FFF0BD',
            padding: 12,
            borderRadius: 10,
          }}
        >
          {t('fingerprint.nothingChecked')}
        </p>
      )}

      <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
        {mistakes.map(mistake => {
          const status =
            STATUS[fingerprint[mistake.id] || 'none'] || STATUS.none

          return (
            <article
              key={mistake.id}
              style={{
                padding: 18,
                border: '1px solid #D7E8E3',
                borderTop: `4px solid ${status.color}`,
                borderRadius: 16,
                background: '#F0F7F5',
                boxShadow: '0 3px 12px rgba(71, 124, 114, 0.07)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    color: '#345B59',
                  }}
                >
                  {mistake.id}: {pick(mistake.name, language)}
                </h2>

                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: status.bg,
                    color: status.color,
                    fontWeight: 'bold',
                    fontSize: 14,
                  }}
                >
                  {t(`fingerprint.status.${status.key}`)}
                </span>
              </div>

              <p style={{ margin: '8px 0', color: '#536B69' }}>
                {pick(mistake.hint, language)}
              </p>

              <div
                style={{
                  height: 8,
                  background: '#E4EAE8',
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: status.width,
                    background: status.color,
                    borderRadius: 8,
                    transition: 'width 0.3s',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => openLesson(mistake.id)}
                style={{
                  marginTop: 12,
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid #B8DCD5',
                  background: '#DDEFEF',
                  color: '#345B59',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {t('fingerprint.learnConcept')}
              </button>
            </article>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 24,
        }}
      >
        <Link
          to="/test"
          style={{
            padding: '9px 14px',
            borderRadius: 10,
            background: '#E8E2FA',
            color: '#65558F',
            textDecoration: 'none',
          }}
        >
          {t('fingerprint.takeTest')}
        </Link>

        <Link
          to="/solve"
          style={{
            padding: '9px 14px',
            borderRadius: 10,
            background: '#FFE3CC',
            color: '#985B32',
            textDecoration: 'none',
          }}
        >
          {t('fingerprint.practiceMore')}
        </Link>

        <Link
          to="/student/dashboard"
          style={{
            padding: '9px 14px',
            borderRadius: 10,
            background: '#DDEFEF',
            color: '#345B59',
            textDecoration: 'none',
          }}
        >
          {t('fingerprint.backDashboard')}
        </Link>
      </div>
    </main>
  )
}