import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getClass,
  getStudents,
  getClassAttempts,
  getMistakes,
} from './lib/teacherData'

import { getFingerprint } from './lib/fingerprint'
import questions from './questions.json'

const MISTAKE_IDS = ['M1', 'M2', 'M3', 'M4', 'M5']

const STATUS_STYLES = {
  active: 'bg-red-100 text-red-800',
  improving: 'bg-amber-100 text-amber-800',
  provisionally_fixed: 'bg-green-100 text-green-800',
  reopened: 'bg-purple-100 text-purple-800',
  none: 'bg-slate-100 text-slate-500',
}

const TILE_STYLES = {
  active: 'bg-[#E8735F] text-white shadow-sm shadow-[#E8735F]/30',
  improving: 'bg-[#F6C453] text-[#6B4A00] shadow-sm shadow-[#F6C453]/40',
  provisionally_fixed: 'bg-[#397F78] text-white shadow-sm shadow-[#397F78]/30',
  reopened: 'bg-[#8C7AD1] text-white shadow-sm shadow-[#8C7AD1]/30',
  none: 'bg-[#EEF3F0] text-[#B7C6C1]',
}

const AVATAR_RING = 2 * Math.PI * 17

function StatusGlyph({ status, className = 'h-6 w-6' }) {
  const common = {
    viewBox: '0 0 24 24',
    className,
    'aria-hidden': true,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (status === 'active') {
    return (
      <svg {...common}>
        <path d="M12 5v9" />
        <circle cx="12" cy="19" r="0.6" fill="currentColor" />
      </svg>
    )
  }

  if (status === 'improving') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" />
      </svg>
    )
  }

  if (status === 'provisionally_fixed') {
    return (
      <svg {...common}>
        <path d="M5.5 12.5l4.2 4.2L18.5 8" />
      </svg>
    )
  }

  if (status === 'reopened') {
    return (
      <svg {...common}>
        <path d="M5 12a7 7 0 1 0 2.2-5.1" />
        <path d="M5 4.5v4h4" />
      </svg>
    )
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  )
}

function getLocalizedText(value, language = 'en') {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map((item) => getLocalizedText(item, language)).join(', ')
  }

  if (value && typeof value === 'object') {
    return getLocalizedText(value[language] ?? value.en ?? '', language)
  }

  return ''
}

const LABELS = {
  en: {
    teacher: 'TEACHER',
    class: 'Class 6A · Fractions',
    logout: 'Log out',
    refresh: 'Refresh',
    students: 'Students',
    attempted: 'Students with attempts',
    tracked: 'Mistake patterns tracked',
    heatmap: 'Mistake Heatmap',
    heatmapHelp: 'Select a student to view their learning details.',
    student: 'Student',
    active: 'Active',
    improving: 'Improving',
    fixed: 'Provisionally fixed',
    reopened: 'Reopened',
    none: 'Not seen',
    plan: "Tomorrow's Plan",
    insufficient: 'Collect attempts from at least 3 students before recommending a class activity.',
    focus: 'Focus on',
    affected: 'students are Active or Reopened for this mistake.',
    noPlan: 'No activity recommendation is available yet.',
    noStudents: 'No students have joined yet.',
    loadError: 'Could not load the dashboard. Please try again.',
    noClass: 'No class is linked to this teacher.',
    loading: 'Loading dashboard...',
    language: 'Language',
    sample: 'LIVE DATA',
    progress: 'Class Progress',
    attemptedCount: 'students have recorded attempts.',
    totalAttempts: 'Recorded attempts',
  },
  te: {
    teacher: 'ఉపాధ్యాయులు',
    class: '6A తరగతి · భిన్నాలు',
    logout: 'లాగ్ అవుట్',
    refresh: 'రిఫ్రెష్',
    students: 'విద్యార్థులు',
    attempted: 'ప్రయత్నాలు చేసిన విద్యార్థులు',
    tracked: 'గుర్తించిన తప్పుల నమూనాలు',
    heatmap: 'తప్పుల హీట్‌మ్యాప్',
    heatmapHelp: 'విద్యార్థి అభ్యాస వివరాలను చూడటానికి వారి పేరును ఎంచుకోండి.',
    student: 'విద్యార్థి',
    active: 'ప్రస్తుతం ఉంది',
    improving: 'మెరుగుపడుతోంది',
    fixed: 'తాత్కాలికంగా సరిచేయబడింది',
    reopened: 'మళ్లీ కనిపించింది',
    none: 'ఇంకా గుర్తించలేదు',
    plan: 'రేపటి ప్రణాళిక',
    insufficient: 'తరగతి కార్యకలాపాన్ని సూచించే ముందు కనీసం 3 మంది విద్యార్థుల ప్రయత్నాలు సేకరించండి.',
    focus: 'దీనిపై దృష్టి పెట్టండి:',
    affected: 'మంది విద్యార్థులకు ఈ తప్పు ఇంకా ఉంది లేదా మళ్లీ కనిపించింది.',
    noPlan: 'ఇంకా కార్యకలాప సూచన అందుబాటులో లేదు.',
    noStudents: 'ఇంకా విద్యార్థులు చేరలేదు.',
    loadError: 'డాష్‌బోర్డ్‌ను తెరవలేకపోయాం. మళ్లీ ప్రయత్నించండి.',
    noClass: 'ఈ ఉపాధ్యాయుడికి తరగతి అనుసంధానించబడలేదు.',
    loading: 'డాష్‌బోర్డ్ లోడ్ అవుతోంది...',
    language: 'భాష',
    sample: 'లైవ్ డేటా',
    progress: 'తరగతి పురోగతి',
    attemptedCount: 'మంది విద్యార్థులు ప్రయత్నాలు నమోదు చేశారు.',
    totalAttempts: 'నమోదైన ప్రయత్నాలు',
  },
  hi: {
    teacher: 'शिक्षक',
    class: 'कक्षा 6A · भिन्न',
    logout: 'लॉग आउट',
    refresh: 'रिफ्रेश',
    students: 'विद्यार्थी',
    attempted: 'प्रयास करने वाले विद्यार्थी',
    tracked: 'पहचाने गए गलती के प्रकार',
    heatmap: 'गलतियों का हीटमैप',
    heatmapHelp: 'विद्यार्थी की सीखने की जानकारी देखने के लिए उसका नाम चुनें।',
    student: 'विद्यार्थी',
    active: 'सक्रिय',
    improving: 'सुधार हो रहा है',
    fixed: 'अस्थायी रूप से ठीक',
    reopened: 'फिर से दिखाई दी',
    none: 'अभी तक नहीं देखा',
    plan: 'कल की योजना',
    insufficient: 'कक्षा की गतिविधि सुझाने से पहले कम से कम 3 विद्यार्थियों के प्रयास दर्ज करें।',
    focus: 'इस पर ध्यान दें:',
    affected: 'विद्यार्थियों में यह गलती सक्रिय है या फिर से दिखाई दी है।',
    noPlan: 'अभी कोई गतिविधि सुझाव उपलब्ध नहीं है।',
    noStudents: 'अभी तक कोई विद्यार्थी नहीं जुड़ा है।',
    loadError: 'डैशबोर्ड लोड नहीं हो सका। कृपया फिर कोशिश करें।',
    noClass: 'इस शिक्षक से कोई कक्षा नहीं जुड़ी है।',
    loading: 'डैशबोर्ड लोड हो रहा है...',
    language: 'भाषा',
    sample: 'लाइव डेटा',
    progress: 'कक्षा की प्रगति',
    attemptedCount: 'विद्यार्थियों ने प्रयास दर्ज किए हैं।',
    totalAttempts: 'दर्ज किए गए प्रयास',
  },
}

const STATUS_KEYS = {
  active: 'active',
  improving: 'improving',
  provisionally_fixed: 'fixed',
  reopened: 'reopened',
  none: 'none',
}

export default function TeacherDashboard() {
  const navigate = useNavigate()

  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorDetail, setErrorDetail] = useState('')
  const [classInfo, setClassInfo] = useState(null)
  const [students, setStudents] = useState([])
  const [attempts, setAttempts] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [fingerprints, setFingerprints] = useState({})
  const [hoverColumn, setHoverColumn] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const hasLoadedOnce = useRef(false)
  const labels = LABELS[language] || LABELS.en

  function t(key) {
    const keyMap = {
      'teacher.dashboard.title': 'teacher',
      'teacher.heatmap.title': 'heatmap',
      'teacher.students.empty': 'noStudents',
      'teacher.plan.title': 'plan',
    }

    const labelKey = keyMap[key]
    return (labelKey && labels[labelKey]) || key
  }

  function statusLabel(status) {
    return labels[STATUS_KEYS[status] || 'none']
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshKey((value) => value + 1)
    }, 15000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      if (!hasLoadedOnce.current) setLoading(true)
      setError('')
      setErrorDetail('')

      try {
        const teacherUid = sessionStorage.getItem('thinkfixTeacherUid')

        if (!teacherUid) {
          navigate('/teacher/login', { replace: true })
          return
        }

        const currentClass = await getClass(teacherUid)

        if (!currentClass) {
          if (!cancelled) setError('NO_CLASS')
          return
        }

        const [classStudents, classAttempts, classMistakes] =
          await Promise.all([
            getStudents(currentClass.id),
            getClassAttempts(currentClass.id),
            getMistakes(currentClass.id),
          ])

        const nextFingerprints = {}

        for (const student of classStudents) {
          const studentUid = student.authUid || student.id
          const studentAttempts = classAttempts.filter(
            (attempt) => attempt.studentUid === studentUid
          )

          nextFingerprints[student.id] = getFingerprint(
            studentAttempts,
            questions
          )
        }

        if (!cancelled) {
          setClassInfo(currentClass)
          setStudents(classStudents)
          setAttempts(classAttempts)
          setMistakes(classMistakes)
          setFingerprints(nextFingerprints)
          hasLoadedOnce.current = true
        }
      } catch (err) {
        console.error('Dashboard loading error:', err)

        if (!cancelled) {
          setError('LOAD_ERROR')
          setErrorDetail(err?.message || String(err))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [navigate, refreshKey])

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

  if (error) {
    const errorMessage =
      error === 'NO_CLASS' ? labels.noClass : labels.loadError

    return (
      <main className="min-h-screen bg-[#FFFCF5] p-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-[#F3C9C0] bg-white p-8 shadow-sm">
          <p role="alert" className="text-lg font-bold text-[#C0432E]">
            {errorMessage}
          </p>

          {errorDetail && (
            <p className="mt-2 text-sm text-[#718582]">{errorDetail}</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="rounded-xl bg-[#397F78] px-5 py-2.5 font-bold text-white transition hover:bg-[#2F6A64]"
            >
              {labels.refresh}
            </button>

            <button
              type="button"
              onClick={() => navigate('/teacher/login')}
              className="rounded-xl border border-[#DCE7E2] bg-white px-5 py-2.5 font-semibold text-[#254C49] transition hover:bg-[#EAF4F1]"
            >
              {labels.logout}
            </button>
          </div>
        </div>
      </main>
    )
  }

  const studentsWithAttempts = students.filter((student) =>
    attempts.some(
      (attempt) => attempt.studentUid === (student.authUid || student.id)
    )
  ).length

  const confidenceAttempts = attempts.filter(
    (attempt) =>
      ['guess', 'somewhat', 'sure'].includes(attempt.confidence) &&
      typeof attempt.isCorrect === 'boolean'
  )

  const confidenceCounts = {
    guessedCorrect: confidenceAttempts.filter(
      (attempt) => attempt.confidence === 'guess' && attempt.isCorrect
    ).length,
    somewhatCorrect: confidenceAttempts.filter(
      (attempt) => attempt.confidence === 'somewhat' && attempt.isCorrect
    ).length,
    sureIncorrect: confidenceAttempts.filter(
      (attempt) => attempt.confidence === 'sure' && !attempt.isCorrect
    ).length,
  }

  const activeCounts = Object.fromEntries(
    MISTAKE_IDS.map((mistakeId) => [
      mistakeId,
      students.filter((student) =>
        ['active', 'reopened'].includes(
          fingerprints[student.id]?.[mistakeId]
        )
      ).length,
    ])
  )

  const tomorrowMistakeId = [...MISTAKE_IDS].sort(
    (a, b) => activeCounts[b] - activeCounts[a] || a.localeCompare(b)
  )[0]

  const tomorrowMistake = mistakes.find(
    (mistake) => mistake.id === tomorrowMistakeId
  )

  const showRecommendation = studentsWithAttempts >= 3

  const tomorrowMistakeName = getLocalizedText(
    tomorrowMistake?.name,
    language
  )

  const tomorrowActivity = getLocalizedText(
    tomorrowMistake?.activity ??
      tomorrowMistake?.activities ??
      tomorrowMistake?.hint ??
      '',
    language
  )

  const statCards = [
    { label: labels.students, value: students.length, icon: '🎓', tint: 'bg-[#DDEFEF]' },
    { label: labels.attempted, value: studentsWithAttempts, icon: '✏️', tint: 'bg-[#FFF0BD]' },
    { label: labels.tracked, value: MISTAKE_IDS.length, icon: '🎯', tint: 'bg-[#E8E2FA]' },
    { label: labels.totalAttempts, value: attempts.length, icon: '📊', tint: 'bg-[#E4EDC9]' },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFCF5] p-4 sm:p-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#DDEFEF] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#FFF0BD] opacity-60 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#254C49] text-2xl font-black text-white shadow-lg">
              T
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-[#397F78]">
                THINKFIX · {labels.teacher}
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-[#254C49]">
                {t('teacher.dashboard.title')}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-[#718582]">
                  {getLocalizedText(
                    classInfo?.className || labels.class,
                    language
                  )}
                </p>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4EDC9] px-3 py-1 text-xs font-bold text-[#526B38]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#397F78]" />
                  {labels.sample}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[#718582]">
              {labels.language}
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                aria-label={labels.language}
                className="rounded-xl border border-[#DCE7E2] bg-white p-2 font-semibold text-[#254C49] outline-none focus:border-[#397F78] focus:ring-2 focus:ring-[#DDEFEF]"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिन्दी</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="rounded-xl border border-[#397F78] bg-white px-4 py-2 font-bold text-[#397F78] transition hover:bg-[#397F78] hover:text-white"
            >
              ⟳ {labels.refresh}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-[#DCE7E2] bg-white px-4 py-2 font-semibold text-[#254C49] transition hover:bg-[#EAF4F1]"
            >
              {labels.logout}
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="mt-1 text-4xl font-black text-[#254C49]">
                {card.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mb-8 rounded-[2rem] border border-[#DCE7E2] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8E2FA] text-xl">
              🧠
            </div>
            <div>
              <h2 className="text-xl font-black text-[#254C49]">
                Class Confidence Insights
              </h2>
              <p className="mt-1 text-sm text-[#718582]">
                Counts are answers with a confidence rating, not unique students.
              </p>
            </div>
          </div>

          {confidenceAttempts.length === 0 ? (
            <p className="mt-5 rounded-2xl bg-[#F4F9F7] p-4 text-[#718582]">
              No confidence-rated answers have been recorded yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl bg-[#DDEFEF] p-5">
                <p className="text-sm font-semibold text-[#397F78]">
                  🎲 Guessed but correct
                </p>
                <p className="mt-2 text-3xl font-black text-[#254C49]">
                  {confidenceCounts.guessedCorrect}
                </p>
              </article>

              <article className="rounded-2xl bg-[#FFF0BD] p-5">
                <p className="text-sm font-semibold text-[#8A6A24]">
                  🤔 Somewhat sure and correct
                </p>
                <p className="mt-2 text-3xl font-black text-[#254C49]">
                  {confidenceCounts.somewhatCorrect}
                </p>
              </article>

              <article className="rounded-2xl bg-[#FCE5E0] p-5">
                <p className="text-sm font-semibold text-[#C0432E]">
                  💪 Very sure but incorrect
                </p>
                <p className="mt-2 text-3xl font-black text-[#254C49]">
                  {confidenceCounts.sureIncorrect}
                </p>
              </article>
            </div>
          )}
        </section>

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#DCE7E2] bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#254C49] via-[#2F6A64] to-[#397F78] px-5 py-7 text-white sm:px-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-[#FFF0BD]/10 blur-2xl"
            />

            <div className="relative flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {getLocalizedText(t('teacher.heatmap.title'), language)}
                </h2>
                <p className="mt-1 text-sm text-[#CDE6E1]">
                  {labels.heatmapHelp}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.keys(STATUS_STYLES).map((status) => (
                  <span
                    key={status}
                    className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-xs font-semibold text-white ring-1 ring-white/20"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${TILE_STYLES[status]}`}
                    >
                      <StatusGlyph status={status} className="h-3.5 w-3.5" />
                    </span>
                    {statusLabel(status)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            {students.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DDEFEF] text-3xl">
                  🎓
                </div>
                <p className="mt-4 font-semibold text-[#718582]">
                  {getLocalizedText(t('teacher.students.empty'), language)}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-2 pt-2">
                <table className="w-full min-w-[720px] border-separate text-left text-sm [border-spacing:0_8px]">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 w-48 bg-white pb-2 pr-3 align-bottom text-xs font-bold uppercase tracking-wider text-[#91A19C]">
                        {labels.student}
                      </th>

                      {MISTAKE_IDS.map((mistakeId) => {
                        const mistakeName = getLocalizedText(
                          mistakes.find((mistake) => mistake.id === mistakeId)?.name,
                          language
                        )
                        const isLit = hoverColumn === mistakeId
                        const share = students.length
                          ? Math.min(
                              100,
                              (activeCounts[mistakeId] / students.length) * 100
                            )
                          : 0

                        return (
                          <th
                            key={mistakeId}
                            onMouseEnter={() => setHoverColumn(mistakeId)}
                            onMouseLeave={() => setHoverColumn(null)}
                            className="px-1.5 pb-2 align-top font-normal"
                          >
                            <div
                              className={`rounded-2xl px-3 py-2.5 text-center transition-colors duration-200 ${
                                isLit
                                  ? 'bg-[#397F78] text-white shadow-lg shadow-[#397F78]/30'
                                  : 'bg-[#F4F9F7] text-[#254C49] ring-1 ring-[#DCE7E2]'
                              }`}
                            >
                              <span className="block text-sm font-black">
                                {mistakeId}
                              </span>

                              {mistakeName && (
                                <span
                                  title={mistakeName}
                                  className={`mx-auto mt-0.5 block max-w-[120px] truncate text-[11px] ${
                                    isLit ? 'text-[#DDEFEF]' : 'text-[#718582]'
                                  }`}
                                >
                                  {mistakeName}
                                </span>
                              )}

                              <span
                                title={`${labels.active} + ${labels.reopened}`}
                                className="mt-2.5 flex items-center gap-2"
                              >
                                <span
                                  className={`h-1.5 flex-1 overflow-hidden rounded-full ${
                                    isLit ? 'bg-white/25' : 'bg-[#DCE7E2]'
                                  }`}
                                >
                                  <span
                                    className={`block h-full rounded-full ${
                                      isLit ? 'bg-white' : 'bg-[#E8735F]'
                                    }`}
                                    style={{ width: `${share}%` }}
                                  />
                                </span>
                                <span className="text-xs font-bold tabular-nums">
                                  {activeCounts[mistakeId]}
                                </span>
                              </span>
                            </div>
                          </th>
                        )
                      })}

                      <th className="w-14 pb-2">
                        <span className="sr-only">
                          {labels.active} + {labels.reopened}
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => {
                      const nickname = getLocalizedText(
                        student.nickname || 'Student',
                        language
                      )
                      const statuses = MISTAKE_IDS.map(
                        (mistakeId) =>
                          fingerprints[student.id]?.[mistakeId] || 'none'
                      )
                      const needsHelp = statuses.filter((status) =>
                        ['active', 'reopened'].includes(status)
                      ).length
                      const fixedCount = statuses.filter(
                        (status) => status === 'provisionally_fixed'
                      ).length
                      const improvingCount = statuses.filter(
                        (status) => status === 'improving'
                      ).length
                      const fixedArc =
                        (fixedCount / MISTAKE_IDS.length) * AVATAR_RING
                      const improvingArc =
                        (improvingCount / MISTAKE_IDS.length) * AVATAR_RING

                      return (
                        <tr key={student.id} className="group">
                          <td className="sticky left-0 z-10 bg-white pr-3">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/teacher/student/${student.id}`)
                              }
                              className="flex w-full items-center gap-3 rounded-2xl bg-[#F4F9F7] px-3 py-2 text-left font-bold text-[#254C49] ring-1 ring-[#DCE7E2] transition group-hover:bg-[#DDEFEF] group-hover:ring-[#397F78]"
                            >
                              <span
                                title={`${statusLabel('provisionally_fixed')} ${fixedCount}/${MISTAKE_IDS.length} · ${statusLabel('improving')} ${improvingCount}/${MISTAKE_IDS.length}`}
                                className="relative flex h-10 w-10 shrink-0 items-center justify-center"
                              >
                                <svg
                                  aria-hidden="true"
                                  viewBox="0 0 40 40"
                                  className="absolute inset-0 -rotate-90"
                                  fill="none"
                                >
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="17"
                                    strokeWidth="3.5"
                                    className="stroke-[#DCE7E2]"
                                  />
                                  {improvingCount > 0 && (
                                    <circle
                                      cx="20"
                                      cy="20"
                                      r="17"
                                      strokeWidth="3.5"
                                      strokeDasharray={`${improvingArc} ${AVATAR_RING}`}
                                      strokeDashoffset={-fixedArc}
                                      className="stroke-[#F6C453]"
                                    />
                                  )}
                                  {fixedCount > 0 && (
                                    <circle
                                      cx="20"
                                      cy="20"
                                      r="17"
                                      strokeWidth="3.5"
                                      strokeLinecap="round"
                                      strokeDasharray={`${fixedArc} ${AVATAR_RING}`}
                                      className="stroke-[#397F78]"
                                    />
                                  )}
                                </svg>

                                <span
                                  aria-hidden="true"
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#254C49] text-xs font-bold text-white"
                                >
                                  {Array.from(nickname)[0] || ''}
                                </span>
                              </span>

                              <span className="truncate">{nickname}</span>
                            </button>
                          </td>

                          {MISTAKE_IDS.map((mistakeId, index) => {
                            const status = statuses[index]

                            return (
                              <td
                                key={mistakeId}
                                onMouseEnter={() => setHoverColumn(mistakeId)}
                                onMouseLeave={() => setHoverColumn(null)}
                                className="px-1.5"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigate(
                                      `/teacher/student/${student.id}?mistake=${mistakeId}`
                                    )
                                  }
                                  aria-label={`View ${nickname}'s ${mistakeId} mistake history`}
                                  title={`View ${mistakeId} mistake history`}
                                  className={`group/cell relative flex h-12 w-full items-center justify-center rounded-2xl transition duration-150 hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#254C49] focus:ring-offset-2 ${
                                    TILE_STYLES[status] || TILE_STYLES.none
                                  }`}
                                >
                                  <StatusGlyph
                                    status={status}
                                    className="h-6 w-6"
                                  />
                                  <span className="sr-only">
                                    {statusLabel(status)}. Open mistake history.
                                  </span>

                                  <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -top-8 z-20 whitespace-nowrap rounded-lg bg-[#254C49] px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover/cell:opacity-100"
                                  >
                                    {statusLabel(status)} · View history
                                  </span>
                                </button>
                              </td>
                            )
                          })}

                          <td className="pl-2 text-center">
                            {needsHelp > 0 && (
                              <span
                                title={`${labels.active} + ${labels.reopened}`}
                                className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-[#E8735F] px-2 text-xs font-bold text-white"
                              >
                                {needsHelp}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="mb-8 rounded-[2rem] border border-[#F2E3A8] bg-[#FFF8DC] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0BD] text-xl">
              💡
            </div>
            <h2 className="text-xl font-black text-[#254C49]">
              {getLocalizedText(t('teacher.plan.title'), language)}
            </h2>
          </div>

          {!showRecommendation ? (
            <p className="mt-4 text-[#6F6A4D]">
              {labels.insufficient} ({studentsWithAttempts}/3)
            </p>
          ) : tomorrowMistake ? (
            <>
              <p className="mt-4 text-[#254C49]">
                {labels.focus}{' '}
                <strong className="rounded-lg bg-[#FFF0BD] px-2 py-0.5">
                  {tomorrowMistake.id}: {tomorrowMistakeName}
                </strong>
              </p>

              <p className="mt-3 text-[#4B5A57]">{tomorrowActivity}</p>

              <p className="mt-3 text-sm font-semibold text-[#8A6A24]">
                {activeCounts[tomorrowMistakeId]} {labels.affected}
              </p>
            </>
          ) : (
            <p className="mt-4 text-[#6F6A4D]">{labels.noPlan}</p>
          )}
        </section>

        <section className="rounded-[2rem] border border-[#DCE7E2] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[#254C49]">
              {labels.progress}
            </h2>

            <p className="text-2xl font-black text-[#397F78]">
              {students.length
                ? `${Math.round(
                    (studentsWithAttempts / students.length) * 100
                  )}%`
                : '0%'}
            </p>
          </div>

          <p className="mt-2 text-[#718582]">
            {studentsWithAttempts} / {students.length} {labels.attemptedCount}
          </p>

          <div
            className="mt-4 h-3 overflow-hidden rounded-full bg-[#EAF4F1]"
            role="progressbar"
            aria-valuenow={
              students.length
                ? Math.round((studentsWithAttempts / students.length) * 100)
                : 0
            }
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={labels.progress}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#397F78] to-[#6FB5A8] transition-all duration-500"
              style={{
                width: `${
                  students.length
                    ? (studentsWithAttempts / students.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </section>

        <p className="mt-10 text-center text-sm text-[#91A19C]">
          THINKFIX · Don't just mark the mistake. Understand it.
        </p>
      </div>
    </main>
  )
}