import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

import {
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
} from 'firebase/auth'

import { auth, db } from './firebase.js'

const VALID_CONFIDENCE = ['guess', 'somewhat', 'sure']

// STUDENT: Join a class using its class code.
export async function joinClass(studentUid, classCode) {
  if (!studentUid || !classCode) {
    throw new Error('Student ID and class code are required.')
  }

  if (auth.currentUser?.uid !== studentUid) {
    throw new Error('Please sign in again before joining.')
  }

  const cleanCode = classCode.trim().toUpperCase()
  const codeSnapshot = await getDoc(doc(db, 'classCodes', cleanCode))

  if (!codeSnapshot.exists()) {
    throw new Error('Invalid class code')
  }

  const classId = codeSnapshot.data().classId

  if (!classId) {
    throw new Error('This class code is not connected to a class.')
  }

  const classSnapshot = await getDoc(doc(db, 'classes', classId))

  if (!classSnapshot.exists()) {
    throw new Error('The selected class does not exist.')
  }

  await setDoc(
    doc(db, 'students', studentUid),
    {
      authUid: studentUid,
      nickname: '',
      classId,
      joinedAt: serverTimestamp(),
    },
    { merge: true }
  )

  return { classId }
}

// TEACHER: Sign in with Firebase email and password.
export async function teacherLogin(email, password) {
  if (!email?.trim() || !password) {
    throw new Error('Email and password are required.')
  }

  return signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function teacherLogout() {
  await signOut(auth)
}

// STUDENT: Create a fresh anonymous Firebase account.
export async function studentLogin() {
  if (auth.currentUser) {
    await signOut(auth)
  }

  return signInAnonymously(auth)
}

// Save a student answer, including the student's confidence rating.
export async function saveAttempt(attempt) {
  if (!attempt || typeof attempt !== 'object') {
    throw new Error('A valid attempt is required.')
  }

  const {
    studentUid,
    runId,
    questionId,
    classId,
    selectedOptionId,
    mistakeId,
    isCorrect,
    confidence,
    step = 'solve',
  } = attempt

  if (!studentUid || !runId || !questionId || !classId) {
    throw new Error(
      'Student, run, question and class IDs are required.'
    )
  }

  if (auth.currentUser?.uid !== studentUid) {
    throw new Error('You can only save answers for your own account.')
  }

  if (typeof isCorrect !== 'boolean') {
    throw new Error('Answer correctness must be true or false.')
  }

  if (!['solve', 'test'].includes(step)) {
    throw new Error('Invalid attempt type.')
  }

  if (!VALID_CONFIDENCE.includes(confidence)) {
    throw new Error('Choose a confidence level before submitting.')
  }

  const studentSnapshot = await getDoc(doc(db, 'students', studentUid))

  if (!studentSnapshot.exists()) {
    throw new Error('Student registration was not found.')
  }

  if (studentSnapshot.data().classId !== classId) {
    throw new Error('Student class does not match this attempt.')
  }

  const attemptData = {
    studentUid,
    runId,
    questionId,
    classId,
    selectedOptionId: selectedOptionId || null,
    mistakeId: mistakeId || null,
    isCorrect,
    confidence,
    step,
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp(),
  }

  const result = await addDoc(collection(db, 'attempts'), attemptData)

  return {
    id: result.id,
    ...attemptData,
  }
}

// Read only the signed-in student's attempts.
export async function getStudentAttempts(studentUid) {
  if (!studentUid) {
    throw new Error('Student ID is required.')
  }

  if (auth.currentUser?.uid !== studentUid) {
    throw new Error('You cannot read another student account.')
  }

  const attemptsQuery = query(
    collection(db, 'attempts'),
    where('studentUid', '==', studentUid),
    orderBy('timestamp', 'asc')
  )

  const snapshot = await getDocs(attemptsQuery)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }))
}

// Read one class.
export async function getClass(classId) {
  if (!classId) {
    throw new Error('Class ID is required.')
  }

  const snapshot = await getDoc(doc(db, 'classes', classId))

  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null
}

// Read students belonging to one class.
export async function getStudents(classId) {
  if (!classId) return []

  const studentsQuery = query(
    collection(db, 'students'),
    where('classId', '==', classId)
  )

  const snapshot = await getDocs(studentsQuery)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }))
}

// Read attempts belonging to one class.
export async function getClassAttempts(classId) {
  if (!classId) return []

  const attemptsQuery = query(
    collection(db, 'attempts'),
    where('classId', '==', classId),
    orderBy('timestamp', 'asc')
  )

  const snapshot = await getDocs(attemptsQuery)

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }))
}

// Read the teacher's profile and assigned class.
export async function getTeacherClass(teacherUid) {
  if (!teacherUid || auth.currentUser?.uid !== teacherUid) {
    throw new Error('Teacher authentication is required.')
  }

  const teacherSnapshot = await getDoc(doc(db, 'teachers', teacherUid))

  if (!teacherSnapshot.exists()) {
    return null
  }

  const teacherData = teacherSnapshot.data()

  if (!teacherData.classId) {
    return null
  }

  const classInfo = await getClass(teacherData.classId)

  if (!classInfo) {
    return null
  }

  return {
    ...classInfo,
    teacherUid,
  }
}