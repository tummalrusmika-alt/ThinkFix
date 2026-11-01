import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import questions from '../questions.json'

import {
  getClass,
  getStudents,
  getStudentAttempts,
  getMistakes,
} from '../lib/teacherData'

import { getFingerprint } from '../lib/fingerprint'

const TEXT = {
  en: {
    title: 'Student Detail',
    back: 'Back to Dashboard',
    student: 'Student',
    totalAttempts: 'Total Attempts',
    correct: 'Correct Answers',
    accuracy: 'Accuracy',
    mistakes: 'Mistake Fingerprint',
    history: 'Attempt History',
    question: 'Question',
    mistake: 'Mistake',
    result: 'Result',
    date: 'Date',
    correctLabel: 'Correct',
    incorrect: 'Incorrect',
    noAttempts: 'No attempts recorded yet.',
    noMistakes: 'No mistake data available.',
    loading: 'Loading student details...',
    notFound: 'Student not found in your class.',
    error: 'Could not load student details.',
    logout: 'Logout',
    language: 'Language',
    active: 'Active',
    improving: 'Improving',
    fixed: 'Provisionally Fixed',
    reopened: 'Reopened',
    none: 'Not observed',
    class: 'Class',
    sample: 'Live Data',
    selected: 'Selected heatmap mistake',
    incorrectWord: 'incorrect',
    attemptWord: 'attempt',
    attemptsWord: 'attempts',
    selectedNote:
      "This count includes this student's incorrect attempts in this mistake category, including different questions mapped to the same category.",
    noSelected: 'No recorded attempts were found for',
  },
  te: {
    title: 'విద్యార్థి వివరాలు',
    back: 'డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి',
    student: 'విద్యార్థి',
    totalAttempts: 'మొత్తం ప్రయత్నాలు',
    correct: 'సరైన సమాధానాలు',
    accuracy: 'కచ్చితత్వం',
    mistakes: 'తప్పుల వివరాలు',
    history: 'ప్రయత్నాల చరిత్ర',
    question: 'ప్రశ్న',
    mistake: 'తప్పు',
    result: 'ఫలితం',
    date: 'తేదీ',
    correctLabel: 'సరైనది',
    incorrect: 'తప్పు',
    noAttempts: 'ఇంకా ప్రయత్నాలు నమోదు కాలేదు.',
    noMistakes: 'తప్పుల వివరాలు అందుబాటులో లేవు.',
    loading: 'విద్యార్థి వివరాలు లోడ్ అవుతున్నాయి...',
    notFound: 'మీ తరగతిలో విద్యార్థి కనిపించలేదు.',
    error: 'విద్యార్థి వివరాలను లోడ్ చేయలేకపోయాము.',
    logout: 'లాగ్‌అవుట్',
    language: 'భాష',
    active: 'ఇంకా వస్తున్న తప్పు',
    improving: 'మెరుగుపడుతున్నారు',
    fixed: 'తాత్కాలికంగా సరిచేశారు',
    reopened: 'మళ్లీ వచ్చిన తప్పు',
    none: 'గమనించలేదు',
    class: 'తరగతి',
    sample: 'లైవ్ డేటా',
    selected: 'ఎంచుకున్న హీట్‌మ్యాప్ తప్పు',
    incorrectWord: 'తప్పు',
    attemptWord: 'ప్రయత్నం',
    attemptsWord: 'ప్రయత్నాలు',
    selectedNote:
      'ఈ లెక్కలో ఈ విద్యార్థి ఈ తప్పు వర్గంలో చేసిన తప్పు ప్రయత్నాలు ఉంటాయి.',
    noSelected: 'ఎటువంటి ప్రయత్నాలు నమోదు కాలేదు:',
  },
  hi: {
    title: 'विद्यार्थी का विवरण',
    back: 'डैशबोर्ड पर वापस जाएँ',
    student: 'विद्यार्थी',
    totalAttempts: 'कुल प्रयास',
    correct: 'सही उत्तर',
    accuracy: 'सटीकता',
    mistakes: 'गलतियों का विवरण',
    history: 'प्रयासों का इतिहास',
    question: 'प्रश्न',
    mistake: 'गलती',
    result: 'परिणाम',
    date: 'तारीख',
    correctLabel: 'सही',
    incorrect: 'गलत',
    noAttempts: 'अभी तक कोई प्रयास दर्ज नहीं हुआ है।',
    noMistakes: 'गलतियों का विवरण उपलब्ध नहीं है।',
    loading: 'विद्यार्थी का विवरण लोड हो रहा है...',
    notFound: 'आपकी कक्षा में विद्यार्थी नहीं मिला।',
    error: 'विद्यार्थी का विवरण लोड नहीं हो सका।',
    logout: 'लॉग आउट',
    language: 'भाषा',
    active: 'गलती अभी भी हो रही है',
    improving: 'सुधार हो रहा है',
    fixed: 'अस्थायी रूप से ठीक',
    reopened: 'गलती फिर से हुई',
    none: 'अभी तक नहीं देखा गया',
    class: 'कक्षा',
    sample: 'लाइव डेटा',
    selected: 'चुनी गई हीटमैप गलती',
    incorrectWord: 'गलत',
    attemptWord: 'प्रयास',
    attemptsWord: 'प्रयास',
    selectedNote:
      'इस गिनती में इस विद्यार्थी के इस गलती वर्ग के गलत प्रयास शामिल हैं।',
    noSelected: 'कोई प्रयास दर्ज नहीं मिला:',
  },
}

// Safely reads both ordinary strings and translated objects.
function getLocalizedText(value, language = 'en') {
  if (typeof value === 'string') return value

  if (Array.isArray(value)) {
    return value
      .map((item) => getLocalizedText(item, language))
      .join(', ')
  }

  if (value && typeof value === 'object') {
    return getLocalizedText(value[language] ?? value.en ?? '', language)
  }

  return ''
}

function getStatusLabel(status, labels) {
  const statusLabels = {
    active: labels.active,
    improving: labels.improving,
    provisionally_fixed: labels.fixed,
    reopened: labels.reopened,
    none: labels.none,
  }

  return statusLabels[status] ?? labels.none
}

const STATUS_STYLE = {
  none: { badge: 'bg-[#EEF3F0] text-[#718582]', bar: 'bg-[#B7C6C1]', width: '0%' },
  active: { badge: 'bg-[#FDE3DE] text-[#B3402B]', bar: 'bg-[#E8735F]', width: '25%' },
  improving: { badge: 'bg-[#FFF0BD] text-[#8A6A24]', bar: 'bg-[#F6C453]', width: '60%' },
  provisionally_fixed: { badge: 'bg-[#DDEFEF] text-[#254C49]', bar: 'bg-[#397F78]', width: '100%' },
  reopened: { badge: 'bg-[#E8E2FA] text-[#65569A]', bar: 'bg-[#8C7AD1]', width: '25%' },
}

function formatDate(dateValue, language) {
  if (!dateValue) return '—'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return '—'

  const locale = {
    en: 'en-IN',
    te: 'te-IN',
    hi: 'hi-IN',
  }[language] ?? 'en-IN'

  return date.toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// Resolve the mistake category using the same fields used by the question flow.
function getAttemptMistakeId(attempt) {
  if (!attempt || attempt.isCorrect === true) return null

  const question = questions.find((item) => item.id === attempt.questionId)

  return (
    attempt.mistakeId ||
    question?.mistakeByOption?.[attempt.selectedOptionId] ||
    question?.mistakeId ||
    null
  )
}

function getAttemptDateValue(attempt) {
  const value = attempt?.createdAt ?? attempt?.timestamp
  if (value?.toDate) return value.toDate()
  if (value?.seconds) return new Date(value.seconds * 1000)
  return value
}

export default function StudentDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const selectedMistakeId = searchParams.get('mistake')

  const [language, setLanguage] = useState('en')
  const [student, setStudent] = useState(null)
  const [classInfo, setClassInfo] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [fingerprint, setFingerprint] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const labels = TEXT[language] ?? TEXT.en

  useEffect(() => {
    let cancelled = false

    async function loadStudentDetails() {
      setLoading(true)
      setError('')

      try {
        const teacherUid = sessionStorage.getItem('thinkfixTeacherUid')

        if (!teacherUid) {
          navigate('/teacher/login', { replace: true })
          return
        }

        const currentClass = await getClass(teacherUid)

        if (!currentClass) {
          throw new Error('CLASS_NOT_FOUND')
        }

        const classStudents = await getStudents(currentClass.id)

        const currentStudent = classStudents.find(
          (item) => item.id === id || item.authUid === id
        )

        if (!currentStudent) {
          throw new Error('STUDENT_NOT_FOUND')
        }

        const studentAttempts = await getStudentAttempts(
          currentStudent.authUid
        )

        const classMistakes = await getMistakes(currentClass.id)

        // Do not pass the mistake records as questions.
        // The fingerprint function should receive the student's attempts.
        const studentFingerprint = getFingerprint(studentAttempts)

        if (cancelled) return

        setClassInfo(currentClass)
        setStudent(currentStudent)
        setAttempts(studentAttempts)
        setMistakes(classMistakes)
        setFingerprint(studentFingerprint)
      } catch (err) {
        if (cancelled) return

        if (err.message === 'STUDENT_NOT_FOUND') {
          setError('STUDENT_NOT_FOUND')
        } else if (err.message === 'CLASS_NOT_FOUND') {
          setError('CLASS_NOT_FOUND')
        } else {
          console.error('Student detail loading error:', err)
          setError('LOAD_ERROR')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadStudentDetails()

    return () => {
      cancelled = true
    }
  }, [id, navigate])

  function handleLogout() {
    sessionStorage.removeItem('thinkfixTeacherUid')
    navigate('/teacher/login', { replace: true })
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF5] p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-[#254C49] text-2xl font-black text-white">
            T
          </div>
          <p className="font-semibold text-[#718582]">{labels.loading}</p>
        </div>
      </main>
    )
  }

  if (error || !student) {
    const message =
      error === 'STUDENT_NOT_FOUND' ? labels.notFound : labels.error

    return (
      <main className="min-h-screen bg-[#FFFCF5] p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#F3C9C0] bg-white p-8 shadow-sm">
          <p className="mb-5 text-lg font-bold text-[#C0432E]">{message}</p>

          <button
            type="button"
            onClick={() => navigate('/teacher/dashboard')}
            className="rounded-xl bg-[#397F78] px-5 py-2.5 font-bold text-white transition hover:bg-[#2F6A64]"
          >
            {labels.back}
          </button>
        </div>
      </main>
    )
  }

  const correctCount = attempts.filter(
    (attempt) => attempt.isCorrect === true
  ).length

  const accuracy =
    attempts.length > 0
      ? Math.round((correctCount / attempts.length) * 100)
      : 0

  const selectedMistake = mistakes.find(
    (mistake) => mistake.id === selectedMistakeId
  )
  const selectedMistakeAttempts = selectedMistakeId
    ? attempts.filter(
        (attempt) => getAttemptMistakeId(attempt) === selectedMistakeId
      )
    : []
  const selectedMistakeIncorrectCount = selectedMistakeAttempts.filter(
    (attempt) => attempt.isCorrect !== true
  ).length

  const nickname = getLocalizedText(student.nickname, language) || 'Student'

  const statCards = [
    { label: labels.totalAttempts, value: attempts.length, icon: '✏️', tint: 'bg-[#FFF0BD]', color: 'text-[#254C49]' },
    { label: labels.correct, value: correctCount, icon: '✅', tint: 'bg-[#DDEFEF]', color: 'text-[#397F78]' },
    { label: labels.accuracy, value: `${accuracy}%`, icon: '🎯', tint: 'bg-[#E8E2FA]', color: 'text-[#254C49]', bar: true },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFCF5] px-4 py-6 sm:px-6">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#DDEFEF] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#FFF0BD] opacity-60 blur-3xl" />

      <div className="relative mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/teacher/dashboard')}
            className="rounded-xl border border-[#DCE7E2] bg-white px-4 py-2.5 text-sm font-bold text-[#254C49] transition hover:bg-[#EAF4F1]"
          >
            ← {labels.back}
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[#718582]">
              {labels.language}
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-xl border border-[#DCE7E2] bg-white px-3 py-2 font-semibold text-[#254C49] outline-none focus:border-[#397F78] focus:ring-2 focus:ring-[#DDEFEF]"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिन्दी</option>
              </select>
            </label>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#DCE7E2] bg-white px-4 py-2.5 text-sm font-semibold text-[#254C49] transition hover:bg-[#EAF4F1]"
            >
              {labels.logout}
            </button>
          </div>
        </header>

        {/* Student banner */}
        <section className="overflow-hidden rounded-[2rem] border border-[#DCE7E2] bg-white shadow-sm">
          <div className="relative bg-gradient-to-br from-[#254C49] via-[#2F6A64] to-[#397F78] px-6 py-7 text-white sm:px-8">
            <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl font-black ring-1 ring-white/30">
                  {Array.from(nickname)[0] || 'S'}
                </div>

                <div>
                  <p className="text-xs font-bold tracking-[0.25em] text-[#CDE6E1]">
                    {labels.student.toUpperCase()}
                  </p>
                  <h1 className="mt-1 text-3xl font-black tracking-tight">
                    {nickname}
                  </h1>
                  <p className="mt-1 text-[#CDE6E1]">
                    {labels.class}: {classInfo?.className ?? '—'}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/30">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#9FE0CF]" />
                {labels.sample}
              </span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="rounded-3xl border border-[#DCE7E2] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${card.tint}`}
              >
                {card.icon}
              </div>
              <p className="mt-4 text-sm font-medium text-[#718582]">
                {card.label}
              </p>
              <p className={`mt-1 text-4xl font-black ${card.color}`}>
                {card.value}
              </p>

              {card.bar && (
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-[#EAF4F1]"
                  role="progressbar"
                  aria-valuenow={accuracy}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#397F78] to-[#6FB5A8] transition-all duration-500"
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
              )}
            </article>
          ))}
        </section>

        {/* Selected heatmap mistake */}
        {selectedMistakeId && (
          <section
            id="selected-mistake-history"
            className="rounded-[2rem] border border-[#F2E3A8] bg-[#FFF8DC] p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#8A6A24]">
                  {labels.selected}
                </p>
                <h2 className="mt-1 text-xl font-black text-[#254C49]">
                  {selectedMistakeId}
                  {selectedMistake
                    ? ` · ${getLocalizedText(selectedMistake.name, language)}`
                    : ''}
                </h2>
              </div>

              <span className="rounded-full bg-[#FFF0BD] px-3 py-1 text-xs font-bold text-[#8A6A24]">
                {selectedMistakeIncorrectCount} {labels.incorrectWord}{' '}
                {selectedMistakeIncorrectCount === 1
                  ? labels.attemptWord
                  : labels.attemptsWord}
              </span>
            </div>

            <p className="mt-3 text-sm text-[#6F6A4D]">{labels.selectedNote}</p>

            {selectedMistakeAttempts.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-white/80 p-4 text-sm text-[#6F6A4D]">
                {labels.noSelected} {selectedMistakeId}.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl bg-white/80">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#EFE3B4] text-[#8A6A24]">
                      <th className="px-4 py-3 font-bold">{labels.question}</th>
                      <th className="px-4 py-3 font-bold">{labels.result}</th>
                      <th className="px-4 py-3 font-bold">{labels.date}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMistakeAttempts.map((attempt) => (
                      <tr
                        key={attempt.id}
                        className="border-b border-[#F5EBC3] last:border-0"
                      >
                        <td className="px-4 py-3 font-semibold text-[#254C49]">
                          {attempt.questionId ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              attempt.isCorrect === true
                                ? 'bg-[#DDEFEF] text-[#254C49]'
                                : 'bg-[#FDE3DE] text-[#B3402B]'
                            }`}
                          >
                            {attempt.isCorrect === true
                              ? labels.correctLabel
                              : labels.incorrect}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#718582]">
                          {formatDate(getAttemptDateValue(attempt), language)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Mistake fingerprint */}
        <section className="rounded-[2rem] border border-[#DCE7E2] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 text-2xl font-black text-[#254C49]">
            {labels.mistakes}
          </h2>

          {mistakes.length === 0 ? (
            <p className="text-[#718582]">{labels.noMistakes}</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {mistakes.map((mistake) => {
                const statusKey = fingerprint[mistake.id] ?? 'none'
                const style = STATUS_STYLE[statusKey] || STATUS_STYLE.none
                const isSelected = selectedMistakeId === mistake.id

                return (
                  <article
                    key={mistake.id}
                    className={`rounded-3xl border p-5 transition ${
                      isSelected
                        ? 'border-[#397F78] bg-[#F4F9F7] ring-2 ring-[#397F78]/30'
                        : 'border-[#DCE7E2] bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-lg font-black text-[#254C49]">
                        {mistake.id}: {getLocalizedText(mistake.name, language)}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}
                      >
                        {getStatusLabel(statusKey, labels)}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#EAF4F1]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
                        style={{ width: style.width }}
                      />
                    </div>

                    <p className="mt-3 rounded-xl bg-[#FFF8DC] p-3 text-sm text-[#6F6A4D]">
                      💡 {getLocalizedText(mistake.hint, language)}
                    </p>

                    <p className="mt-3 text-sm leading-6 text-[#4B5A57]">
                      {getLocalizedText(mistake.explanation, language)}
                    </p>

                    {(() => {
                      const steps =
                        mistake.buddySteps?.[language] ??
                        mistake.buddySteps?.en ??
                        mistake.buddySteps

                      const safeSteps = Array.isArray(steps) ? steps : []

                      return safeSteps.length > 0 ? (
                        <ol className="mt-3 space-y-1.5">
                          {safeSteps.map((step, index) => (
                            <li
                              key={`${mistake.id}-${index}`}
                              className="flex gap-2 text-sm text-[#4B5A57]"
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DDEFEF] text-xs font-bold text-[#254C49]">
                                {index + 1}
                              </span>
                              {getLocalizedText(step, language)}
                            </li>
                          ))}
                        </ol>
                      ) : null
                    })()}

                    {getLocalizedText(
                      mistake.activity ?? mistake.activities,
                      language
                    ) && (
                      <p className="mt-3 rounded-xl bg-[#DDEFEF] p-3 text-sm font-semibold text-[#254C49]">
                        🧩{' '}
                        {getLocalizedText(
                          mistake.activity ?? mistake.activities,
                          language
                        )}
                      </p>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Attempt history */}
        <section className="rounded-[2rem] border border-[#DCE7E2] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 text-2xl font-black text-[#254C49]">
            {labels.history}
          </h2>

          {attempts.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDEFEF] text-2xl">
                📝
              </div>
              <p className="mt-3 font-semibold text-[#718582]">
                {labels.noAttempts}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#DCE7E2] text-xs uppercase tracking-wider text-[#91A19C]">
                    <th className="px-3 py-3 font-bold">{labels.question}</th>
                    <th className="px-3 py-3 font-bold">{labels.mistake}</th>
                    <th className="px-3 py-3 font-bold">{labels.result}</th>
                    <th className="px-3 py-3 font-bold">{labels.date}</th>
                  </tr>
                </thead>

                <tbody>
                  {attempts.map((attempt) => (
                    <tr
                      key={attempt.id}
                      className="border-b border-[#EEF3F0] transition last:border-0 hover:bg-[#F4F9F7]"
                    >
                      <td className="px-3 py-3 font-bold text-[#254C49]">
                        {attempt.questionId}
                      </td>
                      <td className="px-3 py-3 text-[#718582]">
                        {attempt.mistakeId ?? '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                            attempt.isCorrect
                              ? 'bg-[#DDEFEF] text-[#254C49]'
                              : 'bg-[#FDE3DE] text-[#B3402B]'
                          }`}
                        >
                          {attempt.isCorrect ? '✓' : '✗'}{' '}
                          {attempt.isCorrect
                            ? labels.correctLabel
                            : labels.incorrect}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[#718582]">
                        {formatDate(attempt.createdAt, language)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="pb-4 pt-4 text-center text-sm text-[#91A19C]">
          THINKFIX · Don't just mark the mistake. Understand it.
        </p>
      </div>
    </main>
  )
}