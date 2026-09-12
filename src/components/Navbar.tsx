import React from 'react';
import { User } from 'firebase/auth';
import { LogOut, GraduationCap, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  grade?: string;
  section?: string;
  subject?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  grade,
  section,
  subject,
}) => {
  return (
    <header id="app-navbar" className="bg-amber-800 text-white shadow-md border-b-4 border-amber-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand & Bhutan Classroom Title */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-200 shadow-inner">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Bhutan Teacher Classroom
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-900/60 text-amber-200 border border-amber-700">
                  🇧🇹 MoESD Portal
                </span>
              </div>
              <p className="text-xs text-amber-200/90">
                {grade && section ? (
                  <span className="font-medium text-amber-100">
                    {grade} • Section {section} {subject ? `• Subject: ${subject}` : ''}
                  </span>
                ) : (
                  'Simple Classroom Management for Bhutan Teachers'
                )}
              </p>
            </div>
          </div>

          {/* Teacher Profile & Logout */}
          <div className="flex items-center justify-between md:justify-end space-x-4 bg-amber-900/40 px-3.5 py-1.5 rounded-lg border border-amber-700/50">
            <div className="flex items-center space-x-2.5 text-left">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Teacher'}
                  className="w-9 h-9 rounded-full border-2 border-amber-400/60 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center font-semibold text-sm border border-amber-300">
                  {(user.displayName || user.email || 'T').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]">
                    {user.displayName || 'Teacher'}
                  </p>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Google Verified" />
                </div>
                <p className="text-[11px] text-amber-200/80 truncate max-w-[150px] sm:max-w-[200px]">
                  {user.email || 'Google Account'}
                </p>
              </div>
            </div>

            <button
              id="logout-button"
              onClick={onLogout}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-md text-amber-100 bg-amber-950/60 hover:bg-red-900/70 border border-amber-700/60 transition-colors shadow-sm"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
