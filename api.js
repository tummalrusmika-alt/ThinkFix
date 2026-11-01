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

export async function joinClass(studentUid, classCode) {
  if (!studentUid || !classCode) {
    throw new Error('Student ID and class code are required.')
  }

  if (auth.currentUser?.uid !== studentUid) {
    throw new Error('You can only join a class using your own account.')
  }

  const cleanCode = classCode.trim().toUpperCase()
  const codeSnapshot = await getDoc(doc(db, 'classCodes', cleanCode))

  if (!codeSnapshot.exists()) {
    throw new Error('Invalid class code')
  }

  const classId = codeSnapshot.data().classId

  if (!classId) {
    throw new Error('Class code has no valid class.')
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

export async function teacherLogin(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function teacherLogout() {
  return signOut(auth)
}

export async function studentLogin() {
  // Clear the previous student's session on this shared device.
  if (auth.currentUser) {
    await signOut(auth)
  }

  // Create a fresh Firebase anonymous account.
  return await signInAnonymously(auth)
}

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
    step = 'solve',
  } = attempt

  if (!studentUid || !questionId || !classId || !runId) {
    throw new Error('Student, question, class and run IDs are required.')
  }

  if (auth.currentUser?.uid !== studentUid) {
    throw new Error('You can only save attempts for your own account.')
  }

  if (typeof isCorrect !== 'boolean') {
    throw new Error('isCorrect must be true or false.')
  }

  const attemptData = {
    studentUid,
    runId,
    questionId,
    classId,
    selectedOptionId: selectedOptionId || null,
    mistakeId: mistakeId || null,
    isCorrect,
    step,
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp(),
  }

  const result = await addDoc(collection(db, 'attempts'), attemptData)

  return { id: result.id }
}

export async function getStudentAttempts(studentUid) {
  if (!studentUid) throw new Error('Student ID is required.')

  const q = query(
    collection(db, 'attempts'),
    where('studentUid', '==', studentUid),
    orderBy('timestamp', 'asc')
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))
}

export async function getClass(classId) {
  if (!classId) throw new Error('Class ID is required.')

  const snapshot = await getDoc(doc(db, 'classes', classId))

  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null
}

export async function getStudents(classId) {
  const q = query(
    collection(db, 'students'),
    where('classId', '==', classId)
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))
}

export async function getClassAttempts(classId) {
  const q = query(
    collection(db, 'attempts'),
    where('classId', '==', classId),
    orderBy('timestamp', 'asc')
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))
}

export async function getMistakes(classId) {
  const q = query(
    collection(db, 'mistakes'),
    where('classId', '==', classId)
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  }))
}