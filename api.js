
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
} from "firebase/firestore";

import {
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
} from "firebase/auth";

import { auth, db } from "./firebase.js";
import { getFingerprintStatus } from "./fingerprint.js";
import { getNextStep as calculateNextStep } from "./nextStep.js";

// Student joins a class using a class code
export async function joinClass(studentId, classCode) {
  if (!studentId || !classCode) {
    throw new Error("studentId and classCode are required");
  }

  if (auth.currentUser?.uid !== studentId) {
    throw new Error("You can only join a class using your own account");
  }

  const codeSnapshot = await getDoc(doc(db, "classCodes", classCode));

  if (!codeSnapshot.exists()) {
    throw new Error("Invalid class code");
  }

  const classId = codeSnapshot.data().classId;

  if (!classId) {
    throw new Error("Class code has no valid class");
  }

  await setDoc(
    doc(db, "students", studentId),
    {
      classId,
      joinedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { classId };
}

// Get questions for a class
export async function getQuestions(classId) {
  if (!classId) throw new Error("classId is required");

  const q = query(
    collection(db, "questions"),
    where("classId", "==", classId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// Get mistakes recorded for a student
export async function getMistakes(studentId) {
  if (!studentId) throw new Error("studentId is required");

  const q = query(
    collection(db, "mistakes"),
    where("studentId", "==", studentId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// Teacher login
export async function teacherLogin(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Teacher logout
export async function teacherLogout() {
  return signOut(auth);
}

// Student anonymous login
export async function studentLogin() {
  return signInAnonymously(auth);
}

// Save a student's attempt
export async function saveAttempt(attempt) {
  if (!attempt || typeof attempt !== "object") {
    throw new Error("A valid attempt is required");
  }

  const {
    studentId,
    questionId,
    classId,
    correct,
    mistakeId,
    type = "solve",
    isRepeat = false,
  } = attempt;

  if (!studentId || !questionId || !classId) {
    throw new Error("studentId, questionId, and classId are required");
  }

  if (auth.currentUser?.uid !== studentId) {
    throw new Error("You can only save attempts for your own account");
  }

  if (typeof correct !== "boolean") {
    throw new Error("correct must be true or false");
  }

  if (!["solve", "test"].includes(type)) {
    throw new Error("Attempt type must be solve or test");
  }

  if (typeof isRepeat !== "boolean") {
    throw new Error("isRepeat must be true or false");
  }

  const attemptData = {
    studentId,
    questionId,
    classId,
    correct,
    mistakeId: mistakeId ?? null,
    type,
    isRepeat,
    isValid: true,
    timestamp: serverTimestamp(),
  };

  const result = await addDoc(
    collection(db, "attempts"),
    attemptData
  );

  return { id: result.id };
}

// Get attempts for one student
export async function getStudentAttempts(studentId) {
  if (!studentId) throw new Error("studentId is required");

  const q = query(
    collection(db, "attempts"),
    where("studentId", "==", studentId),
    orderBy("timestamp", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// Get one class
export async function getClass(classId) {
  if (!classId) throw new Error("classId is required");

  const classSnapshot = await getDoc(doc(db, "classes", classId));

  if (!classSnapshot.exists()) return null;

  return {
    id: classSnapshot.id,
    ...classSnapshot.data(),
  };
}

// Get students in a class
export async function getStudents(classId) {
  if (!classId) throw new Error("classId is required");

  const q = query(
    collection(db, "students"),
    where("classId", "==", classId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// Get all attempts for a class
export async function getClassAttempts(classId) {
  if (!classId) throw new Error("classId is required");

  const q = query(
    collection(db, "attempts"),
    where("classId", "==", classId),
    orderBy("timestamp", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

// Get the fingerprint status for a student and a mistake
export async function getFingerprint(studentId, mistakeId) {
  if (!studentId || !mistakeId) {
    throw new Error("studentId and mistakeId are required");
  }

  const q = query(
    collection(db, "attempts"),
    where("studentId", "==", studentId),
    where("mistakeId", "==", mistakeId),
    orderBy("timestamp", "asc")
  );

  const snapshot = await getDocs(q);

  const attempts = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  return getFingerprintStatus(attempts);
}

// Get the next learning step based on score
export function getNextStep(scorePercent) {
  return calculateNextStep(scorePercent);
}
