export interface Student {
  rollNumber: string;
  name: string;
}

export interface TeacherClassroom {
  teacherName: string;
  teacherEmail: string;
  grade: string;
  section: string;
  subject: string;
  students: Student[];
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string; // date string YYYY-MM-DD
  date: string;
  records: Record<string, 'present' | 'absent'>; // rollNumber -> status
  recordedAt?: string;
}

export interface AssessmentRecord {
  id: string;
  assessmentName: string; // "Class Test", "Mid Term", "Final Exam", etc.
  maxMarks: number;
  scores: Record<string, number>; // rollNumber -> score
  recordedAt?: string;
}
