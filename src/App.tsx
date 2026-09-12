import React, { useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import {
  subscribeToClassroom,
  saveClassroomData,
  subscribeToAttendance,
  saveAttendanceRecord,
  subscribeToMarks,
  saveAssessmentMarks,
} from './classroomService';
import { TeacherClassroom, AttendanceRecord, AssessmentRecord } from './types';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { ClassSetup } from './components/ClassSetup';
import { AttendanceManager } from './components/AttendanceManager';
import { MarksManager } from './components/MarksManager';
import { TeacherLogin } from './components/TeacherLogin';
import {
  CalendarCheck,
  Award,
  Users,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Classroom data from Firestore
  const [classroom, setClassroom] = useState<TeacherClassroom | null>(null);
  const [classroomLoading, setClassroomLoading] = useState(true);

  // Attendance and marks from Firestore
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [marksList, setMarksList] = useState<AssessmentRecord[]>([]);

  // Navigation tab for the teacher
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks' | 'class'>('attendance');

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to teacher's classroom, attendance, and marks when user is logged in
  useEffect(() => {
    if (!user) {
      setClassroom(null);
      setAttendanceList([]);
      setMarksList([]);
      setClassroomLoading(false);
      return;
    }

    setClassroomLoading(true);

    const unsubClassroom = subscribeToClassroom(user.uid, (data) => {
      setClassroom(data);
      setClassroomLoading(false);
      // If user has no classroom yet, automatically switch to 'class' setup tab
      if (!data) {
        setActiveTab('class');
      }
    });

    const unsubAttendance = subscribeToAttendance(user.uid, (records) => {
      setAttendanceList(records);
    });

    const unsubMarks = subscribeToMarks(user.uid, (marks) => {
      setMarksList(marks);
    });

    return () => {
      unsubClassroom();
      unsubAttendance();
      unsubMarks();
    };
  }, [user]);

  // Google Sign In Handler
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Google sign-in popup was blocked by browser or preview frame. Try opening in a new tab or use the Workshop Demo Sign-In below.');
      } else {
        setAuthError(err instanceof Error ? err.message : 'Google sign-in failed. Please verify credentials.');
      }
    }
  };

  // Workshop Demo Teacher Sign In (Fallback for iframe restrictions)
  const handleDemoSignIn = async () => {
    setAuthError(null);
    try {
      const cred = await signInAnonymously(auth);
      await updateProfile(cred.user, {
        displayName: 'Karma Dorji (Teacher)',
      });
      // Force update state with name and email representation
      setUser({
        ...cred.user,
        displayName: 'Karma Dorji (Teacher)',
        email: 'karmadorji.teacher@education.gov.bt',
      } as User);
    } catch (err) {
      console.error('Demo sign-in error:', err);
      setAuthError(err instanceof Error ? err.message : 'Demo sign-in failed.');
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setClassroom(null);
      setActiveTab('attendance');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Classroom Save to Firestore
  const handleSaveClassroom = async (data: TeacherClassroom) => {
    if (!user) throw new Error('Not authenticated');
    await saveClassroomData(user.uid, data);
    setClassroom(data);
  };

  // Attendance Save to Firestore
  const handleSaveAttendance = async (date: string, records: Record<string, 'present' | 'absent'>) => {
    if (!user) throw new Error('Not authenticated');
    await saveAttendanceRecord(user.uid, date, records);
  };

  // Marks Save to Firestore
  const handleSaveMarks = async (assessmentName: string, maxMarks: number, scores: Record<string, number>) => {
    if (!user) throw new Error('Not authenticated');
    await saveAssessmentMarks(user.uid, assessmentName, maxMarks, scores);
  };

  // Metric Computations for Top Dashboard
  const students = classroom?.students || [];
  const totalStudents = students.length;

  // Today's attendance metric
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceList.find((r) => r.date === todayStr) || attendanceList[0];
  let presentToday = 0;
  if (todayRecord && todayRecord.records) {
    students.forEach((s) => {
      if (todayRecord.records[s.rollNumber] === 'present') {
        presentToday += 1;
      }
    });
  } else if (totalStudents > 0) {
    // If no attendance entered today, defaults to 0
    presentToday = 0;
  }

  // Overall Attendance % across all records
  let totalAttendanceOpportunities = 0;
  let totalPresentCount = 0;
  attendanceList.forEach((day) => {
    students.forEach((s) => {
      const status = day.records?.[s.rollNumber];
      if (status) {
        totalAttendanceOpportunities += 1;
        if (status === 'present') {
          totalPresentCount += 1;
        }
      }
    });
  });
  const overallAttendancePct =
    totalAttendanceOpportunities > 0
      ? (totalPresentCount / totalAttendanceOpportunities) * 100
      : 100;

  // Class Average Marks across all assessments
  let totalMarksPctSum = 0;
  let totalMarksEntries = 0;
  marksList.forEach((assessment) => {
    const max = assessment.maxMarks || 100;
    if (max > 0 && assessment.scores) {
      Object.values(assessment.scores).forEach((score) => {
        if (typeof score === 'number' && !isNaN(score)) {
          totalMarksPctSum += (score / max) * 100;
          totalMarksEntries += 1;
        }
      });
    }
  });
  const classAverageMarks =
    totalMarksEntries > 0 ? totalMarksPctSum / totalMarksEntries : 0;

  // Render Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-stone-600">Loading Bhutan Classroom App...</p>
        </div>
      </div>
    );
  }

  // Render Login Screen if not logged in
  if (!user) {
    return (
      <TeacherLogin
        onGoogleSignIn={handleGoogleSignIn}
        onDemoSignIn={handleDemoSignIn}
        isLoading={authLoading}
        errorMessage={authError}
      />
    );
  }

  // Teacher is Logged In
  const teacherDisplayName = user.displayName || 'Teacher';
  const teacherDisplayEmail = user.email || 'Google Account';

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      
      {/* Top Navigation */}
      <Navbar
        user={user}
        onLogout={handleSignOut}
        grade={classroom?.grade}
        section={classroom?.section}
        subject={classroom?.subject}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Simple Top Dashboard */}
        <DashboardStats
          totalStudents={totalStudents}
          presentToday={presentToday}
          overallAttendancePct={overallAttendancePct}
          classAverageMarks={classAverageMarks}
        />

        {/* First time setup prompt if no classroom in Firebase */}
        {!classroom && !classroomLoading && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold">Welcome to Your Classroom Portal</h2>
                <p className="text-xs text-amber-800 mt-0.5">
                  Step 1 & 2: Enter your class details and upload your student Excel roster to save in Firebase.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('class')}
              className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              Setup Class & Students Now
            </button>
          </div>
        )}

        {/* Module Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-6 gap-2 overflow-x-auto">
          <div className="flex items-center space-x-1 sm:space-x-2">
            
            <button
              id="tab-attendance"
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
              }`}
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              1. Attendance
            </button>

            <button
              id="tab-marks"
              type="button"
              onClick={() => setActiveTab('marks')}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'marks'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
              }`}
            >
              <Award className="w-4 h-4 mr-2" />
              2. Marks & Assessment
            </button>

            <button
              id="tab-class-setup"
              type="button"
              onClick={() => setActiveTab('class')}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'class'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              3. Class & Students Roster
            </button>

          </div>

          {/* Quick status pill */}
          {classroom && (
            <div className="hidden sm:flex items-center text-xs text-stone-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
              Firebase Synced
            </div>
          )}
        </div>

        {/* Tab Content Display */}
        {activeTab === 'class' && (
          <ClassSetup
            teacherName={teacherDisplayName}
            teacherEmail={teacherDisplayEmail}
            existingClassroom={classroom}
            onSaveClassroom={handleSaveClassroom}
          />
        )}

        {activeTab === 'attendance' && (
          students.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center space-y-3 shadow-xs">
              <Users className="w-10 h-10 text-amber-700 mx-auto opacity-70" />
              <h3 className="font-bold text-stone-800 text-base">No Students Loaded</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Please upload your student Excel roster or load the Bhutan sample roster first in the Class Setup tab.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('class')}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-amber-700 hover:bg-amber-800 text-white shadow-xs cursor-pointer"
              >
                Go to Class Setup & Student Upload
              </button>
            </div>
          ) : (
            <AttendanceManager
              students={students}
              attendanceHistory={attendanceList}
              onSaveAttendance={handleSaveAttendance}
            />
          )
        )}

        {activeTab === 'marks' && (
          students.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center space-y-3 shadow-xs">
              <Award className="w-10 h-10 text-amber-700 mx-auto opacity-70" />
              <h3 className="font-bold text-stone-800 text-base">No Students Loaded</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Please upload your student Excel roster or load the Bhutan sample roster first to enter assessment marks.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('class')}
                className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-amber-700 hover:bg-amber-800 text-white shadow-xs cursor-pointer"
              >
                Go to Class Setup & Student Upload
              </button>
            </div>
          ) : (
            <MarksManager
              students={students}
              assessmentHistory={marksList}
              onSaveMarks={handleSaveMarks}
            />
          )
        )}

      </main>

      {/* Clean, respectful footer for Bhutan Teachers */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-4 text-center text-xs text-stone-500">
        <p>
          Bhutan Teacher Classroom App • Developed for 1-Hour Hands-On Workshop with Google AI Studio & Firebase
        </p>
      </footer>

    </div>
  );
}
