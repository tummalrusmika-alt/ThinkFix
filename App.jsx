import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from 'react-router-dom'

import Join from './student/Join'
import StudentDashboard from './student/StudentDashboard'
import Solve from './student/Solve'
import Result from './student/Result'
import Learn from './student/Learn'
import FixBuddy from './student/FixBuddy'
import Test from './student/Test'
import FingerprintPage from './student/FingerprintPage'

import TeacherLogin from './components/TeacherLogin'
import TeacherDashboard from './TeacherDashboard'
import StudentDetail from './components/StudentDetail'

const publicFaqs = [
  {
    question: 'What is ThinkFix?',
    answer:
      'ThinkFix is a learning app where students join a class, solve questions, and review mistakes. Teachers can review class progress and common mistakes.',
  },
  {
    question: 'How does a student use ThinkFix?',
    answer:
      'A student joins a class with the code from their teacher, solves questions, and reviews feedback on mistakes.',
  },
  {
    question: 'What can teachers do with ThinkFix?',
    answer:
      'Teachers can review class progress, spot common mistakes, and open individual student details.',
  },
  {
    question: 'How does ThinkFix help students learn from mistakes?',
    answer:
      'ThinkFix shows feedback after an answer and provides learning and practice focused on mistakes.',
  },
]

function PublicInfo() {
  return (
    <div className="mt-16 space-y-14 border-t border-[#DCE7E2] pt-12">
      <section aria-labelledby="how-thinkfix-works">
        <h2
          id="how-thinkfix-works"
          className="text-3xl font-black text-[#254C49]"
        >
          How ThinkFix works
        </h2>

        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          <li className="rounded-2xl border border-[#DCE7E2] bg-white p-6">
            <h3 className="text-xl font-bold text-[#254C49]">1. Join a class</h3>
            <p className="mt-2 leading-7 text-[#526B67]">
              Students enter the class code provided by their teacher.
            </p>
          </li>

          <li className="rounded-2xl border border-[#DCE7E2] bg-white p-6">
            <h3 className="text-xl font-bold text-[#254C49]">
              2. Solve questions
            </h3>
            <p className="mt-2 leading-7 text-[#526B67]">
              Students practise questions and see feedback on their answers.
            </p>
          </li>

          <li className="rounded-2xl border border-[#DCE7E2] bg-white p-6">
            <h3 className="text-xl font-bold text-[#254C49]">
              3. Learn from mistakes
            </h3>
            <p className="mt-2 leading-7 text-[#526B67]">
              Students review mistakes and practise the skills they need to
              improve.
            </p>
          </li>
        </ol>
      </section>

      <section aria-labelledby="thinkfix-faq">
        <h2
          id="thinkfix-faq"
          className="text-3xl font-black text-[#254C49]"
        >
          ThinkFix questions and answers
        </h2>

        <div className="mt-6 space-y-4">
          {publicFaqs.map(({ question, answer }) => (
            <details
              key={question}
              className="rounded-2xl border border-[#DCE7E2] bg-white p-5"
            >
              <summary className="cursor-pointer text-lg font-bold text-[#254C49]">
                {question}
              </summary>
              <p className="mt-3 leading-7 text-[#526B67]">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

function Welcome() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFFCF5] px-5 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#DDEFEF] opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#FFF0BD] opacity-70 blur-3xl" />

      <section className="relative w-full max-w-5xl">
        {/* Brand */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#254C49] text-3xl font-black text-white shadow-lg">
            T
          </div>

          <p className="text-sm font-bold tracking-[0.25em] text-[#397F78]">
            THINKFIX
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-[#254C49] sm:text-5xl">
            Learn from every mistake with ThinkFix
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#718582] sm:text-lg">
            Every mistake is a chance to learn something new. Choose how you
            want to continue.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Student */}
          <Link
            to="/join"
            className="group rounded-[2rem] border border-[#DCE7E2] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#397F78] hover:shadow-xl sm:p-10"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DDEFEF] text-3xl">
                🎓
              </div>

              <span className="rounded-full bg-[#E4EDC9] px-4 py-2 text-xs font-bold text-[#526B38]">
                LEARN
              </span>
            </div>

            <h2 className="mt-8 text-3xl font-black text-[#254C49]">
              I'm a Student
            </h2>

            <p className="mt-3 leading-7 text-[#718582]">
              Join your class, solve questions, understand your mistakes and
              improve step by step.
            </p>

            <div className="mt-8 flex items-center justify-between rounded-xl bg-[#EAF4F1] px-5 py-4 font-bold text-[#397F78] transition group-hover:bg-[#397F78] group-hover:text-white">
              <span>Continue as Student</span>
              <span className="text-xl">→</span>
            </div>
          </Link>

          {/* Teacher */}
          <Link
            to="/teacher/login"
            className="group rounded-[2rem] border border-[#DCE7E2] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#397F78] hover:shadow-xl sm:p-10"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0BD] text-3xl">
                👩‍🏫
              </div>

              <span className="rounded-full bg-[#E8E2FA] px-4 py-2 text-xs font-bold text-[#65569A]">
                GUIDE
              </span>
            </div>

            <h2 className="mt-8 text-3xl font-black text-[#254C49]">
              I'm a Teacher
            </h2>

            <p className="mt-3 leading-7 text-[#718582]">
              Explore class progress, identify common mistakes and support
              every student's learning journey.
            </p>

            <div className="mt-8 flex items-center justify-between rounded-xl bg-[#FFF5D9] px-5 py-4 font-bold text-[#8A6A24] transition group-hover:bg-[#397F78] group-hover:text-white">
              <span>Continue as Teacher</span>
              <span className="text-xl">→</span>
            </div>
          </Link>
        </div>

        <p className="mt-10 text-center text-sm text-[#91A19C]">
          THINKFIX · Don't just mark the mistake. Understand it.
        </p>

        <PublicInfo />
      </section>
    </main>
  )
}

function TeacherProtectedRoute({ children }) {
  const teacherUid = sessionStorage.getItem('thinkfixTeacherUid')

  if (!teacherUid) {
    return <Navigate to="/teacher/login" replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />

        {/* Student routes */}
        <Route path="/join" element={<Join />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/solve" element={<Solve />} />
        <Route path="/result" element={<Result />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/buddy" element={<FixBuddy />} />
        <Route path="/test" element={<Test />} />
        <Route path="/fingerprint" element={<FingerprintPage />} />

        {/* Teacher routes */}
        <Route path="/teacher/login" element={<TeacherLogin />} />

        <Route
          path="/teacher/dashboard"
          element={
            <TeacherProtectedRoute>
              <TeacherDashboard />
            </TeacherProtectedRoute>
          }
        />

        <Route
          path="/teacher/student/:id"
          element={
            <TeacherProtectedRoute>
              <StudentDetail />
            </TeacherProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </BrowserRouter>
  )
}