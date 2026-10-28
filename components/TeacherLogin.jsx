
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TeacherLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleLogin(event) {
    event.preventDefault()
    setError('')

    if (
      email.trim().toLowerCase() === 'teacher@thinkfix.demo' &&
      password === 'ThinkFix123'
    ) {
      sessionStorage.setItem('thinkfixTeacherUid', 'teacher-demo-1')
      navigate('/teacher/dashboard', { replace: true })
    } else {
      setError('Invalid email or password. Please try again.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <p className="text-sm font-bold tracking-widest text-indigo-600">
          THINKFIX
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Teacher Login
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Sign in to review your students' learning progress.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teacher@thinkfix.demo"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Login
          </button>
        </form>

        <div className="mt-5 rounded-lg bg-indigo-50 p-3 text-sm text-slate-700">
          <p className="font-semibold">Demo credentials</p>
          <p>Email: teacher@thinkfix.demo</p>
          <p>Password: ThinkFix123</p>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Local demonstration only. Firebase authentication will replace this
          mock login during integration.
        </p>
      </section>
    </main>
  )
}
