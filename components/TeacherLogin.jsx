import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase.js'
import { teacherLogin } from '../api.js'

const DEMO_EMAIL = 'teacher@thinkfix.demo'
const DEMO_PASSWORD = 'ThinkFix123'

export default function TeacherLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function fillDemo() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError('')
  }

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await teacherLogin(email.trim(), password)

      const user = auth.currentUser

      if (!user) {
        throw new Error('Login was unsuccessful. Please try again.')
      }

      sessionStorage.setItem('thinkfixTeacherUid', user.uid)

      navigate('/teacher/dashboard', { replace: true })
    } catch (err) {
      console.error('Teacher login error:', err)

      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-email'
      ) {
        setError('Invalid email or password. Please try again.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.')
      } else {
        setError(err.message || 'Could not sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFFCF5] px-5 py-10">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#DDEFEF] opacity-80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#FFF0BD] opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-[#E8E2FA] opacity-50 blur-3xl" />

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#DCE7E2] bg-white shadow-2xl md:grid-cols-2">

        {/* Left Design Panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#254C49] p-8 text-white sm:p-12">

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-white/5" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-[40px] border-white/5" />

          <div className="relative">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDEFEF] text-3xl font-black text-[#254C49] shadow-lg">
                T
              </div>

              <div>
                <p className="text-2xl font-black tracking-wide">
                  THINKFIX
                </p>
              </div>
            </div>

            {/* Main Heading */}
            <div className="mt-16">

              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-widest text-[#DDEFEF]">
                TEACHER WORKSPACE
              </span>

              <h1 className="mt-8 text-4xl font-black leading-tight sm:text-5xl">
                Help every
                <br />
                student grow.
              </h1>

              <p className="mt-6 max-w-sm text-base leading-8 text-[#D4E7E1]">
                Understand learning gaps, discover mistake patterns
                and guide your class towards improvement.
              </p>

            </div>

            {/* Decorative Learning Cards */}
            <div className="mt-10 space-y-3">

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0BD] text-xl">
                  📊
                </div>

                <div>
                  <p className="font-bold">Track Progress</p>
                  <p className="text-xs text-[#D4E7E1]">
                    Understand student performance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8E2FA] text-xl">
                  💡
                </div>

                <div>
                  <p className="font-bold">Identify Mistakes</p>
                  <p className="text-xs text-[#D4E7E1]">
                    Find learning gaps and patterns
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Message */}
          <div className="relative mt-12 rounded-2xl border border-white/10 bg-white/10 p-5">
            <p className="text-xs font-bold tracking-widest text-[#FFF0BD]">
              THE THINKFIX PROMISE
            </p>

            <p className="mt-2 text-lg font-bold leading-7">
              Don't just mark the mistake.
              <br />
              Understand it.
            </p>
          </div>

        </div>

        {/* Right Login Section */}
        <div className="flex flex-col justify-center p-8 sm:p-12">

          <div className="mb-10">

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDEFEF] text-3xl">
              👩‍🏫
            </div>

            <p className="text-xs font-black tracking-[0.25em] text-[#397F78]">
              WELCOME BACK
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#254C49] sm:text-4xl">
              Teacher Login
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#718582]">
              Sign in to review your students' learning progress.
            </p>

          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-bold text-[#254C49]"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teacher@thinkfix.demo"
                autoComplete="username"
                required
                className="w-full rounded-xl border border-[#DCE7E2] bg-[#FFFCF5] px-4 py-4 text-sm text-[#254C49] outline-none transition placeholder:text-[#A3B1AC] focus:border-[#397F78] focus:ring-4 focus:ring-[#DDEFEF]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-[#254C49]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-[#DCE7E2] bg-[#FFFCF5] px-4 py-4 text-sm text-[#254C49] outline-none transition placeholder:text-[#A3B1AC] focus:border-[#397F78] focus:ring-4 focus:ring-[#DDEFEF]"
              />
            </div>

            {/* Error Message */}
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600"
              >
                {error}
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#397F78] px-5 py-4 font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#254C49] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in to Dashboard →'}
            </button>

          </form>

          {/* Demo credentials */}
          <div className="mt-8 rounded-2xl border border-[#E8E2FA] bg-[#F6F3FF] p-5">

            <div className="flex items-center gap-2">
              <span className="text-xl">🔐</span>

              <p className="font-bold text-[#65569A]">
                Demo credentials
              </p>
            </div>

            <div className="mt-4 space-y-1 text-sm text-[#5F6077]">
              <p>
                Email: <span className="font-semibold">{DEMO_EMAIL}</span>
              </p>
              <p>
                Password: <span className="font-semibold">{DEMO_PASSWORD}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={fillDemo}
              className="mt-4 rounded-xl border border-[#8C7AD1] bg-white px-4 py-2 text-sm font-bold text-[#65569A] transition hover:bg-[#8C7AD1] hover:text-white"
            >
              Use demo credentials
            </button>

          </div>

          <p className="mt-6 text-center text-xs leading-6 text-[#91A19C]">
            Your teacher account provides access to its assigned class.
          </p>

        </div>

      </section>
    </main>
  )
}