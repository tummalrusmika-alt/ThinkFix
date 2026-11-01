import { useNavigate } from 'react-router-dom'
import { getStudentSession } from '../lib/data'
import { t } from '../lib/i18n'
import LanguageToggle from '../components/LanguageToggle'

const activities = [
  { key: 'learn', icon: '📖', path: '/learn', color: 'bg-[#DDEFEF]', accent: 'text-[#477F78]' },
  { key: 'solve', icon: '🧩', path: '/solve', color: 'bg-[#FFF0BD]', accent: 'text-[#8A6D32]' },
  { key: 'buddy', icon: '🤖', path: '/buddy', color: 'bg-[#FFE3CC]', accent: 'text-[#956344]' },
  { key: 'results', icon: '🏆', path: '/result', color: 'bg-[#E8E2FA]', accent: 'text-[#71649C]' },
  { key: 'test', icon: '🎯', path: '/test', color: 'bg-[#DCEBFA]', accent: 'text-[#52799B]' },
  { key: 'fingerprint', icon: '🔍', path: '/fingerprint', color: 'bg-[#E4EDC9]', accent: 'text-[#657B42]' },
]

function ThinkFixLogo() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B8DCD5]">
      <span className="text-2xl font-black text-[#477F78]">T</span>
    </div>
  )
}

export default function StudentDashboard() {
  const navigate = useNavigate()
  const student = getStudentSession()

  if (!student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFCF5] p-6">
        <section className="rounded-3xl bg-white p-8 text-center shadow">
          <div className="text-5xl">🌱</div>
          <h1 className="mt-5 text-2xl font-black text-[#405D61]">
            {t('dashboard.start')}
          </h1>
          <p className="mt-3 text-[#788887]">
            {t('dashboard.joinDescription')}
          </p>
          <button
            onClick={() => navigate('/join', { replace: true })}
            className="mt-6 rounded-xl bg-[#83BDB3] px-6 py-3 font-bold text-[#294E4A]"
          >
            {t('dashboard.join')} →
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FFFCF5] text-[#405D61]">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-7 lg:px-9">

        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ThinkFixLogo />
            <h1 className="text-3xl font-black sm:text-4xl">
              Think<span className="text-[#D49B49]">Fix</span>
            </h1>
          </div>
          <div className="rounded-xl border border-[#E9E8DD] bg-white p-3 shadow-sm">
            <LanguageToggle />
          </div>
        </header>

        <section className="relative mt-7 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#DCEBFA] via-[#DDEFEF] to-[#FFF0BD] p-6 sm:p-9">
          <div className="relative z-10 flex flex-col items-center gap-7 sm:flex-row sm:justify-between">
            <div className="max-w-xl">
              <span className="rounded-full bg-white/80 px-4 py-2 text-xs font-extrabold text-[#52799B]">
                ✨ {t('dashboard.tagline')}
              </span>

              <h2 className="mt-6 text-3xl font-black leading-tight sm:text-4xl">
                {t('dashboard.hello')}, {student.nickname || t('dashboard.explorer')}!
                <br />
                <span className="text-[#628F88]">
                  {t('dashboard.discover')}
                </span>
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-[#688080] sm:text-base">
                {t('dashboard.welcomeDescription')}
              </p>

              <button
                onClick={() => navigate('/solve')}
                className="mt-6 rounded-xl bg-[#83BDB3] px-6 py-3.5 font-bold text-[#294E4A]"
              >
                {t('dashboard.startExploring')} →
              </button>
            </div>

            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-[34px] bg-white/80 shadow-sm sm:h-44 sm:w-44">
              <span className="text-7xl">🤖</span>
              <span className="absolute -right-3 -top-2 rounded-full bg-[#FFF0BD] p-2 text-xl">✨</span>
              <span className="absolute -bottom-3 -left-5 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#628F88]">
                {t('dashboard.buddyHello')}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#9A895E]">
              {t('dashboard.way')}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {t('dashboard.journey')}
            </h2>
            <p className="mt-1 text-sm text-[#82908C]">
              {t('dashboard.stepsDescription')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {['discoverStep', 'practiceStep', 'improveStep'].map((key, index) => (
              <div key={key} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8E2FA] text-2xl">
                  {['🔎', '🧠', '🌱'][index]}
                </div>
                <div>
                  <p className="text-[10px] font-extrabold tracking-widest text-[#71649C]">
                    {t('dashboard.step')} 0{index + 1}
                  </p>
                  <h3 className="font-extrabold">{t(`dashboard.${key}`)}</h3>
                  <p className="text-xs text-[#777092]">
                    {t(`dashboard.${key}Description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 flex items-center gap-3 rounded-2xl border border-[#F0E2B5] bg-[#FFF8DE] p-4">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-extrabold text-[#806A35]">
              {t('dashboard.mistakesTitle')}
            </h3>
            <p className="mt-1 text-sm text-[#89794F]">
              {t('dashboard.mistakesDescription')}
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#9A895E]">
              {t('dashboard.adventure')}
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              {t('dashboard.chooseActivity')}
            </h2>
            <p className="mt-2 text-sm text-[#82908C]">
              {t('dashboard.activityDescription')}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity, index) => (
              <button
                key={activity.path}
                type="button"
                onClick={() => navigate(activity.path)}
                className={`group flex min-h-[215px] flex-col rounded-[25px] border border-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${activity.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/85 text-4xl shadow-sm">
                    {activity.icon}
                  </span>
                  <span className="text-xs font-bold text-[#8B9690]">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-extrabold">
                  {t(`dashboard.cards.${activity.key}.title`)}
                </h3>
                <p className={`mt-1 text-sm font-bold ${activity.accent}`}>
                  {t(`dashboard.cards.${activity.key}.subtitle`)}
                </p>
                <p className="mt-2 text-sm leading-5 text-[#687C7C]">
                  {t(`dashboard.cards.${activity.key}.description`)}
                </p>
                <div className="mt-auto flex justify-end pt-4">
                  <span className={`text-lg font-bold ${activity.accent}`}>→</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-9 flex items-center gap-4 rounded-[24px] border border-[#E9E8DD] bg-white p-5 shadow-sm">
          <span className="text-3xl">🌟</span>
          <div>
            <h3 className="font-extrabold">{t('dashboard.closingTitle')}</h3>
            <p className="mt-1 text-sm text-[#82908C]">
              {t('dashboard.closingDescription')}
            </p>
          </div>
        </section>

        <footer className="flex justify-center py-8">
          <button
            onClick={() => navigate('/welcome', { replace: true })}
            className="text-sm font-semibold text-[#91A09B]"
          >
            {t('dashboard.backToRole')}
          </button>
        </footer>
      </div>
    </main>
  )
}