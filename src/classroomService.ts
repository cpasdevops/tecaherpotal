import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { TeacherClassroom, AttendanceRecord, AssessmentRecord } from './types';

// Teacher & Classroom
export async function saveClassroomData(teacherId: string, classroom: TeacherClassroom): Promise<void> {
  const teacherRef = doc(db, 'teachers', teacherId);
  await setDoc(teacherRef, {
    ...classroom,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function getClassroomData(teacherId: string): Promise<TeacherClassroom | null> {
  const teacherRef = doc(db, 'teachers', teacherId);
  const snap = await getDoc(teacherRef);
  if (snap.exists()) {
    return snap.data() as TeacherClassroom;
  }
  return null;
}

export function subscribeToClassroom(teacherId: string, callback: (data: TeacherClassroom | null) => void) {
  const teacherRef = doc(db, 'teachers', teacherId);
  return onSnapshot(teacherRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as TeacherClassroom);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error fetching classroom:', error);
  });
}

// Attendance
export async function saveAttendanceRecord(
  teacherId: string,
  date: string,
  records: Record<string, 'present' | 'absent'>
): Promise<void> {
  const attendanceRef = doc(db, 'teachers', teacherId, 'attendance', date);
  await setDoc(attendanceRef, {
    date,
    records,
    recordedAt: new Date().toISOString(),
  });
}

export function subscribeToAttendance(
  teacherId: string,
  callback: (records: AttendanceRecord[]) => void
) {
  const attendanceCol = collection(db, 'teachers', teacherId, 'attendance');
  return onSnapshot(attendanceCol, (snapshot) => {
    const list: AttendanceRecord[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      list.push({
        id: docSnap.id,
        date: d.date || docSnap.id,
        records: d.records || {},
        recordedAt: d.recordedAt,
      });
    });
    // Sort descending by date
    list.sort((a, b) => b.date.localeCompare(a.date));
    callback(list);
  }, (error) => {
    console.error('Error listening to attendance:', error);
  });
}

// Assessment Marks
export async function saveAssessmentMarks(
  teacherId: string,
  assessmentName: string,
  maxMarks: number,
  scores: Record<string, number>
): Promise<void> {
  // Sanitize doc ID
  const sanitizedId = assessmentName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'assessment';
  const markRef = doc(db, 'teachers', teacherId, 'marks', sanitizedId);
  await setDoc(markRef, {
    assessmentName,
    maxMarks: Number(maxMarks) || 100,
    scores,
    recordedAt: new Date().toISOString(),
  });
}

export function subscribeToMarks(
  teacherId: string,
  callback: (marks: AssessmentRecord[]) => void
) {
  const marksCol = collection(db, 'teachers', teacherId, 'marks');
  return onSnapshot(marksCol, (snapshot) => {
    const list: AssessmentRecord[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      list.push({
        id: docSnap.id,
        assessmentName: d.assessmentName || docSnap.id,
        maxMarks: Number(d.maxMarks) || 100,
        scores: d.scores || {},
        recordedAt: d.recordedAt,
      });
    });
    // Sort by recordedAt or name
    list.sort((a, b) => (b.recordedAt || '').localeCompare(a.recordedAt || ''));
    callback(list);
  }, (error) => {
    console.error('Error listening to marks:', error);
  });
}
