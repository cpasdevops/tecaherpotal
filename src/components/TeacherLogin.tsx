import React, { useState } from 'react';
import { GraduationCap, ShieldCheck, Sparkles, BookOpen, AlertCircle, ExternalLink } from 'lucide-react';

interface TeacherLoginProps {
  onGoogleSignIn: () => Promise<void>;
  onDemoSignIn: () => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export const TeacherLogin: React.FC<TeacherLoginProps> = ({
  onGoogleSignIn,
  onDemoSignIn,
  isLoading,
  errorMessage,
}) => {
  const [showDemoOption, setShowDemoOption] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Emblem & Branding */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-700 text-amber-100 flex items-center justify-center shadow-lg border-2 border-amber-500/40 mb-4">
          <GraduationCap className="w-9 h-9 text-amber-300" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold mb-2">
          <span>🇧🇹</span>
          <span>Kingdom of Bhutan • School Education</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Teacher Classroom Portal
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Sign in with your Google account to manage your class, daily attendance, and assessment marks.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-amber-200/80 shadow-md">
          
          <div className="space-y-6">
            
            {/* Login Instructions */}
            <div className="text-center pb-2 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-800">
                Teacher Google Sign-In
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Authorized teacher access via Google Workspace or personal Google account.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div id="auth-error-banner" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <p>{errorMessage}</p>
                </div>
                <div className="text-[11px] text-red-600 pl-6">
                  If the Google popup was blocked by browser sandbox or preview iframe, you can test with the instant Workshop Teacher Account below.
                </div>
              </div>
            )}

            {/* Primary Google Login Button */}
            <div>
              <button
                id="google-signin-btn"
                type="button"
                onClick={onGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-stone-300 rounded-xl shadow-xs bg-white text-stone-800 hover:bg-stone-50 hover:border-stone-400 font-semibold text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-amber-500 disabled:opacity-50 cursor-pointer"
              >
                {/* Official Google SVG Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </button>
            </div>

            {/* Workshop Quick Sign-In Fallback */}
            <div className="pt-2 border-t border-stone-100 text-center">
              <button
                type="button"
                id="workshop-demo-toggle-btn"
                onClick={() => setShowDemoOption(!showDemoOption)}
                className="text-xs text-amber-800 hover:text-amber-900 font-medium underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showDemoOption ? 'Hide workshop test option' : 'Workshop Demo Sign-In (no popup needed)'}</span>
              </button>

              {showDemoOption && (
                <div className="mt-3 p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-left space-y-2">
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Designed for workshop participants in restricted browser iframes. Signs you in as a Bhutan school teacher:
                  </p>
                  <button
                    id="workshop-demo-signin-btn"
                    type="button"
                    onClick={onDemoSignIn}
                    disabled={isLoading}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-amber-700 hover:bg-amber-800 text-white shadow-xs transition-colors"
                  >
                    Enter as Teacher (Karma Dorji)
                  </button>
                </div>
              )}
            </div>

            {/* Workshop Guidelines & 3 Prompts Notice */}
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-[11px] text-stone-600 space-y-1">
              <p className="font-semibold text-stone-800 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                1-Hour Hands-on Workshop Flow:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-stone-600 pl-1">
                <li>Prompt 1: Google Login + Class & Student Excel Upload</li>
                <li>Prompt 2: Save Teacher & Student Data in Firebase</li>
                <li>Prompt 3: Attendance + Marks + Simple Dashboard</li>
              </ul>
            </div>

          </div>

        </div>

        <p className="mt-4 text-center text-xs text-stone-500">
          Simple Classroom App • Built for Non-Technical School Teachers in Bhutan
        </p>
      </div>

    </div>
  );
};
