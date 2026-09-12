import React, { useState, useEffect } from 'react';
import { Student, AttendanceRecord } from '../types';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Save,
  Check,
  Percent,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface AttendanceManagerProps {
  students: Student[];
  attendanceHistory: AttendanceRecord[];
  onSaveAttendance: (date: string, records: Record<string, 'present' | 'absent'>) => Promise<void>;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  students,
  attendanceHistory,
  onSaveAttendance,
}) => {
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDate());
  const [currentAttendance, setCurrentAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when selected date or history changes
  useEffect(() => {
    const existing = attendanceHistory.find((rec) => rec.date === selectedDate);
    if (existing && existing.records) {
      setCurrentAttendance(existing.records);
    } else {
      // Default all to 'present' for ease of use
      const defaults: Record<string, 'present' | 'absent'> = {};
      students.forEach((s) => {
        defaults[s.rollNumber] = 'present';
      });
      setCurrentAttendance(defaults);
    }
    setSavedSuccess(false);
    setErrorMessage(null);
  }, [selectedDate, attendanceHistory, students]);

  // Compute attendance percentage for each student across all historical attendance records
  const getStudentAttendanceStats = (rollNumber: string) => {
    if (attendanceHistory.length === 0) {
      return { totalDays: 0, presentDays: 0, percentage: 100 };
    }
    let presentDays = 0;
    let totalDays = 0;

    attendanceHistory.forEach((dayRec) => {
      const status = dayRec.records?.[rollNumber];
      if (status) {
        totalDays += 1;
        if (status === 'present') {
          presentDays += 1;
        }
      }
    });

    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
    return { totalDays, presentDays, percentage };
  };

  const toggleStatus = (rollNumber: string) => {
    setCurrentAttendance((prev) => ({
      ...prev,
      [rollNumber]: prev[rollNumber] === 'present' ? 'absent' : 'present',
    }));
    setSavedSuccess(false);
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const updated: Record<string, 'present' | 'absent'> = {};
    students.forEach((s) => {
      updated[s.rollNumber] = status;
    });
    setCurrentAttendance(updated);
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    if (!selectedDate) {
      setErrorMessage('Please select a valid date.');
      return;
    }
    setErrorMessage(null);
    setIsSaving(true);
    try {
      await onSaveAttendance(selectedDate, currentAttendance);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save attendance to Firebase.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick stats for selected date
  const presentCount = students.filter((s) => currentAttendance[s.rollNumber] === 'present').length;
  const absentCount = students.length - presentCount;
  const dayRate = students.length > 0 ? ((presentCount / students.length) * 100).toFixed(0) : '0';

  return (
    <div id="attendance-section" className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-6">
      
      {/* Attendance Header & Date Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-stone-900 text-lg">Daily Attendance Register</h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Mark Present or Absent for each student, calculate attendance percentages, and save to Firebase.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-amber-500">
            <Calendar className="w-4 h-4 text-stone-500 mr-2 shrink-0" />
            <input
              id="attendance-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-medium text-stone-800 bg-transparent focus:outline-hidden"
            />
          </div>

          <button
            type="button"
            onClick={() => setSelectedDate(getTodayDate())}
            className="px-2.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Action Toolbar & Day Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/50 p-3.5 rounded-lg border border-amber-200/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-stone-700">Quick Actions:</span>
          <button
            type="button"
            id="mark-all-present-btn"
            onClick={() => handleMarkAll('present')}
            className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-md border border-emerald-300 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            Mark All Present
          </button>
          <button
            type="button"
            id="mark-all-absent-btn"
            onClick={() => handleMarkAll('absent')}
            className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-red-800 bg-red-100 hover:bg-red-200 rounded-md border border-red-300 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5 mr-1 text-red-700" />
            Mark All Absent
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
            {presentCount} Present
          </span>
          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-semibold">
            {absentCount} Absent
          </span>
          <span className="text-stone-600 font-mono">
            ({dayRate}%)
          </span>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Attendance for {selectedDate} has been saved to Firebase successfully!</span>
        </div>
      )}

      {/* Attendance Table */}
      {students.length === 0 ? (
        <div className="text-center py-8 text-stone-500 text-sm">
          No students found. Please setup class and upload student roster first.
        </div>
      ) : (
        <div className="overflow-x-auto border border-stone-200 rounded-lg shadow-xs">
          <table id="attendance-table" className="min-w-full divide-y divide-stone-200 text-left text-sm">
            <thead className="bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3 w-20">Roll</th>
                <th scope="col" className="px-4 py-3">Student Name</th>
                <th scope="col" className="px-4 py-3 text-center w-48">Status ({selectedDate})</th>
                <th scope="col" className="px-4 py-3 text-right w-36">Overall %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {students.map((student) => {
                const status = currentAttendance[student.rollNumber] || 'present';
                const isPresent = status === 'present';
                const stats = getStudentAttendanceStats(student.rollNumber);

                return (
                  <tr key={student.rollNumber} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-stone-800">
                      {student.rollNumber}
                    </td>
                    <td className="px-4 py-3 text-stone-900 font-medium">
                      {student.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-100">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentAttendance(prev => ({ ...prev, [student.rollNumber]: 'present' }));
                            setSavedSuccess(false);
                          }}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                            isPresent
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentAttendance(prev => ({ ...prev, [student.rollNumber]: 'absent' }));
                            setSavedSuccess(false);
                          }}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                            !isPresent
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                            stats.percentage >= 85
                              ? 'bg-emerald-100 text-emerald-800'
                              : stats.percentage >= 70
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {stats.percentage}%
                        </span>
                        {stats.totalDays > 0 && (
                          <span className="text-[11px] text-stone-500 hidden sm:inline">
                            ({stats.presentDays}/{stats.totalDays}d)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Save Attendance to Firebase Button */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
        <p className="text-xs text-stone-500">
          Saved data persists in Firebase for {selectedDate} and is tied to your Google Teacher account.
        </p>

        <button
          id="save-attendance-btn"
          type="button"
          onClick={handleSave}
          disabled={isSaving || students.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving Attendance...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Attendance in Firebase
            </>
          )}
        </button>
      </div>

    </div>
  );
};
