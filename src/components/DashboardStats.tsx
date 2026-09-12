import React from 'react';
import { Users, UserCheck, CalendarCheck, Award } from 'lucide-react';

interface DashboardStatsProps {
  totalStudents: number;
  presentToday: number;
  overallAttendancePct: number;
  classAverageMarks: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalStudents,
  presentToday,
  overallAttendancePct,
  classAverageMarks,
}) => {
  return (
    <section id="dashboard-summary" className="mb-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Total Students */}
        <div id="stat-total-students" className="bg-white rounded-xl p-4 border border-amber-200/80 shadow-xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900">{totalStudents}</span>
            <span className="text-xs text-stone-500">enrolled</span>
          </div>
        </div>

        {/* Metric 2: Present Today */}
        <div id="stat-present-today" className="bg-white rounded-xl p-4 border border-amber-200/80 shadow-xs hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Present Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-800">{presentToday}</span>
            <span className="text-xs text-stone-500">/ {totalStudents}</span>
          </div>
        </div>

        {/* Metric 3: Attendance % */}
        <div id="stat-attendance-rate" className="bg-white rounded-xl p-4 border border-amber-200/80 shadow-xs hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Attendance %
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-sky-900">{overallAttendancePct.toFixed(1)}%</span>
            <span className="text-xs text-stone-500">overall</span>
          </div>
        </div>

        {/* Metric 4: Class Average Marks */}
        <div id="stat-average-marks" className="bg-white rounded-xl p-4 border border-amber-200/80 shadow-xs hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Class Average Marks
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-amber-900">{classAverageMarks.toFixed(1)}%</span>
            <span className="text-xs text-stone-500">score</span>
          </div>
        </div>

      </div>
    </section>
  );
};
