import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

import { saveStudentSession } from '../lib/data'
import { studentLogin, joinClass } from '../api.js'
import { t } from '../lib/i18n'
import LanguageToggle from '../components/LanguageToggle'

// Demo credentials: the class code must already exist in your Firebase classes
const DEMO_CLASS_CODE = 'DEMO123' // replace with a real class code from your database
const DEMO_NICKNAME = 'DemoStudent'

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
  const [loading, setLoading] = useState(false)

  function fillDemo() {
    setClassCode(DEMO_CLASS_CODE)
    setNickname(DEMO_NICKNAME)
    setMessage('')
  }

  async function handleJoin(event) {
    event.preventDefault()
    setMessage('')

    const cleanCode = classCode.trim().toUpperCase()
    const cleanNickname = nickname.trim()

    if (!cleanNickname) {
      setMessage('Please enter a nickname.')
      return
    }

    if (!cleanCode) {
      setMessage('Please enter your class code.')
      return
    }

    if (loading) return

    setLoading(true)

    try {
      // 1. Authenticate student with Firebase.
      const credential = await studentLogin()
      const studentUid = credential.user.uid

      // 2. Register student in the Firebase class.
      const result = await joinClass(studentUid, cleanCode)

      await setDoc(
        doc(db, 'students', studentUid),
        {
          authUid: studentUid,
          nickname: cleanNickname,
          classId: result.classId,
        },
        { merge: true }
      )

      if (!result?.classId) {
        throw new Error('Class registration failed.')
      }

      // 3. Save the same Firebase UID in the existing local session.
      saveStudentSession({
        id: studentUid,
        studentUid,
        nickname: cleanNickname,
        classId: result.classId,
        diagnosticRunId: createId()
      })

      // 4. Open the student dashboard.
      navigate('/student/dashboard')

    } catch (error) {
      console.error('Join failed:', error)

      if (error.message === 'Invalid class code') {
        setMessage('Invalid class code. Please check with your teacher.')
      } else {
        setMessage(error.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFFCF5] px-5 py-10">

      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#DDEFEF] opacity-80 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#FFF0BD] opacity-70 blur-3xl" />

      <div className="pointer-events-none absolute right-1/4 top-1/4 h-48 w-48 rounded-full bg-[#E8E2FA] opacity-50 blur-3xl" />

      <section className="relative w-full max-w-5xl">

        {/* Language selector */}
        <div className="mb-6 flex justify-end">
          <div className="rounded-xl border border-[#DCE7E2] bg-white px-4 py-3 shadow-sm">
            <LanguageToggle />
          </div>
        </div>

        {/* Main card */}
        <div className="grid overflow-hidden rounded-[2rem] border border-[#DCE7E2] bg-white shadow-2xl md:grid-cols-2">

          {/* Left design panel */}
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

              {/* Heading */}
              <div className="mt-16">

                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-widest text-[#DDEFEF]">
                  STUDENT WORKSPACE
                </span>

                <h1 className="mt-8 text-4xl font-black leading-tight sm:text-5xl">
                  Learn from
                  <br />
                  every mistake.
                </h1>

                <p className="mt-6 max-w-sm text-base leading-8 text-[#D4E7E1]">
                  Every mistake is a chance to understand something new.
                  Join your class and begin your learning journey.
                </p>

              </div>

              {/* Feature cards */}
              <div className="mt-10 space-y-3">

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0BD] text-xl">
                    📚
                  </div>

                  <div>
                    <p className="font-bold">Learn</p>
                    <p className="text-xs text-[#D4E7E1]">
                      Understand concepts step by step
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8E2FA] text-xl">
                    💡
                  </div>

                  <div>
                    <p className="font-bold">Improve</p>
                    <p className="text-xs text-[#D4E7E1]">
                      Discover and correct your mistakes
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* Bottom message */}
            <div className="relative mt-12 rounded-2xl border border-white/10 bg-white/10 p-5">

              <p className="text-xs font-bold tracking-widest text-[#FFF0BD]">
                THE THINKFIX PROMISE
              </p>

              <p className="mt-2 text-lg font-bold leading-7">
                Don't just get the answer.
                <br />
                Understand it.
              </p>

            </div>

          </div>

          {/* Right form panel */}
          <div className="flex flex-col justify-center p-8 sm:p-12">

            <div className="mb-9">

              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DDEFEF] text-3xl">
                🎓
              </div>

              <p className="text-xs font-black tracking-[0.25em] text-[#397F78]">
                LET'S GET STARTED
              </p>

              <h2 className="mt-3 text-3xl font-black text-[#254C49] sm:text-4xl">
                Join Your Class
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#718582]">
                Enter your class details to start learning with ThinkFix.
              </p>

            </div>

            {/* Join form */}
            <form onSubmit={handleJoin} className="space-y-6">

              {/* Class code */}
              <div>

                <label
                  htmlFor="classCode"
                  className="mb-2 block text-sm font-bold text-[#254C49]"
                >
                  {t('student.classCode')}
                </label>

                <input
                  id="classCode"
                  value={classCode}
                  onChange={event => setClassCode(event.target.value)}
                  placeholder="Enter your class code"
                  autoComplete="off"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-[#DCE7E2] bg-[#FFFCF5] px-4 py-4 text-sm text-[#254C49] outline-none transition placeholder:text-[#A3B1AC] focus:border-[#397F78] focus:ring-4 focus:ring-[#DDEFEF] disabled:opacity-60"
                />

              </div>

              {/* Nickname */}
              <div>

                <label
                  htmlFor="nickname"
                  className="mb-2 block text-sm font-bold text-[#254C49]"
                >
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
                  disabled={loading}
                  className="w-full rounded-xl border border-[#DCE7E2] bg-[#FFFCF5] px-4 py-4 text-sm text-[#254C49] outline-none transition placeholder:text-[#A3B1AC] focus:border-[#397F78] focus:ring-4 focus:ring-[#DDEFEF] disabled:opacity-60"
                />

              </div>

              {/* Error message */}
              {message && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600"
                >
                  {message}
                </p>
              )}

              {/* Join button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#397F78] px-5 py-4 font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#254C49] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Joining...' : `${t('student.join')} →`}
              </button>

            </form>

            {/* Demo credentials */}
            <div className="mt-6 rounded-2xl border border-dashed border-[#397F78]/40 bg-[#DDEFEF]/40 p-5">
              <p className="text-xs font-black tracking-[0.2em] text-[#397F78]">
                DEMO CREDENTIALS
              </p>

              <div className="mt-3 space-y-1 text-sm text-[#254C49]">
                <p>
                  <span className="font-bold">Class Code:</span>{' '}
                  <span className="font-mono">{DEMO_CLASS_CODE}</span>
                </p>
                <p>
                  <span className="font-bold">Nickname:</span>{' '}
                  <span className="font-mono">{DEMO_NICKNAME}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={fillDemo}
                disabled={loading}
                className="mt-4 rounded-lg border border-[#397F78] bg-white px-4 py-2 text-sm font-bold text-[#397F78] transition hover:bg-[#397F78] hover:text-white disabled:opacity-60"
              >
                Use demo credentials
              </button>
            </div>

            {/* Bottom note */}
            <div className="mt-8 rounded-2xl border border-[#E8E2FA] bg-[#F6F3FF] p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl">
                  🌟
                </div>

                <div>
                  <p className="text-sm font-bold text-[#65569A]">
                    Ready to learn?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#77718E]">
                    Your learning journey starts here!
                  </p>
                </div>

              </div>

            </div>

            <p className="mt-6 text-center text-xs leading-6 text-[#91A19C]">
              THINKFIX · Every mistake is a step towards improvement.
            </p>

          </div>

        </div>

      </section>

    </main>
  )
}