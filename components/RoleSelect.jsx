import { useNavigate } from 'react-router-dom'

export default function RoleSelect() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <p className="text-sm font-bold tracking-widest text-blue-600">
          THINKFIX
        </p>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Welcome!
        </h1>

        <p className="mt-2 text-slate-600">
          Choose how you want to continue.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => navigate('/join')}
            className="rounded-xl border-2 border-blue-200 p-6 text-left hover:border-blue-600 hover:bg-blue-50"
          >
            <span className="text-4xl">🎓</span>
            <h2 className="mt-4 text-xl font-bold">Student</h2>
            <p className="mt-2 text-sm text-slate-600">
              Join your class and start learning.
            </p>
          </button>

          <button
            onClick={() => navigate('/teacher/login')}
            className="rounded-xl border-2 border-indigo-200 p-6 text-left hover:border-indigo-600 hover:bg-indigo-50"
          >
            <span className="text-4xl">👩‍🏫</span>
            <h2 className="mt-4 text-xl font-bold">Teacher</h2>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to view class progress.
            </p>
          </button>
        </div>
      </section>
    </main>
  )
}