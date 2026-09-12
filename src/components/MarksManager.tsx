import React, { useState, useEffect } from 'react';
import { Student, AssessmentRecord } from '../types';
import {
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Calculator,
  PlusCircle,
  FileText
} from 'lucide-react';

interface MarksManagerProps {
  students: Student[];
  assessmentHistory: AssessmentRecord[];
  onSaveMarks: (
    assessmentName: string,
    maxMarks: number,
    scores: Record<string, number>
  ) => Promise<void>;
}

const DEFAULT_ASSESSMENTS = ['Class Test', 'Mid Term', 'Final Exam'];

export const MarksManager: React.FC<MarksManagerProps> = ({
  students,
  assessmentHistory,
  onSaveMarks,
}) => {
  const [selectedAssessment, setSelectedAssessment] = useState<string>('Class Test');
  const [customAssessmentName, setCustomAssessmentName] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [maxMarks, setMaxMarks] = useState<number>(50);
  const [scores, setScores] = useState<Record<string, number | string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available assessments combining defaults and any saved from history
  const allAssessments = Array.from(
    new Set([
      ...DEFAULT_ASSESSMENTS,
      ...assessmentHistory.map((a) => a.assessmentName),
    ])
  );

  // When assessment selection changes, load existing marks if available
  useEffect(() => {
    const existing = assessmentHistory.find(
      (a) => a.assessmentName.toLowerCase() === selectedAssessment.toLowerCase()
    );

    if (existing) {
      setMaxMarks(existing.maxMarks || 50);
      const loadedScores: Record<string, number | string> = {};
      students.forEach((s) => {
        if (existing.scores && existing.scores[s.rollNumber] !== undefined) {
          loadedScores[s.rollNumber] = existing.scores[s.rollNumber];
        } else {
          loadedScores[s.rollNumber] = '';
        }
      });
      setScores(loadedScores);
    } else {
      // Initialize blank
      const emptyScores: Record<string, number | string> = {};
      students.forEach((s) => {
        emptyScores[s.rollNumber] = '';
      });
      setScores(emptyScores);
    }
    setSavedSuccess(false);
    setErrorMessage(null);
  }, [selectedAssessment, assessmentHistory, students]);

  const handleScoreChange = (rollNumber: string, value: string) => {
    setSavedSuccess(false);
    if (value === '') {
      setScores((prev) => ({ ...prev, [rollNumber]: '' }));
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return;
    if (num < 0) return;
    setScores((prev) => ({ ...prev, [rollNumber]: num }));
  };

  const handleSaveMarks = async () => {
    const assessmentToSave = isCustom ? customAssessmentName.trim() : selectedAssessment;
    if (!assessmentToSave) {
      setErrorMessage('Please provide an assessment name.');
      return;
    }

    if (!maxMarks || maxMarks <= 0) {
      setErrorMessage('Please enter a valid Maximum Marks value greater than 0.');
      return;
    }

    // Convert scores to clean numbers
    const finalScores: Record<string, number> = {};
    students.forEach((s) => {
      const val = scores[s.rollNumber];
      if (val !== undefined && val !== '') {
        const num = Number(val);
        if (!isNaN(num)) {
          finalScores[s.rollNumber] = num;
        }
      }
    });

    setErrorMessage(null);
    setIsSaving(true);

    try {
      await onSaveMarks(assessmentToSave, maxMarks, finalScores);
      setSavedSuccess(true);
      if (isCustom) {
        setSelectedAssessment(assessmentToSave);
        setIsCustom(false);
        setCustomAssessmentName('');
      }
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save marks to Firebase.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate assessment statistics
  const enteredScores = students
    .map((s) => {
      const val = scores[s.rollNumber];
      return val !== undefined && val !== '' ? Number(val) : null;
    })
    .filter((v): v is number => v !== null && !isNaN(v));

  const averageScore =
    enteredScores.length > 0
      ? enteredScores.reduce((a, b) => a + b, 0) / enteredScores.length
      : 0;

  const averagePct = maxMarks > 0 ? (averageScore / maxMarks) * 100 : 0;

  return (
    <div id="marks-section" className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-stone-900 text-lg">Student Marks & Assessments</h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Select an assessment, enter marks, automatically calculate percentage, and save to Firebase.
          </p>
        </div>

        {/* Assessment selector & Max marks */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Assessment dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-stone-700">Assessment:</label>
            {!isCustom ? (
              <select
                id="assessment-select"
                value={selectedAssessment}
                onChange={(e) => {
                  if (e.target.value === '__add_custom__') {
                    setIsCustom(true);
                  } else {
                    setSelectedAssessment(e.target.value);
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-stone-800"
              >
                {allAssessments.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
                <option value="__add_custom__">+ New Assessment...</option>
              </select>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="e.g. Unit Test 2"
                  value={customAssessmentName}
                  onChange={(e) => setCustomAssessmentName(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 px-1.5 py-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Max Marks Input */}
          <div className="flex items-center gap-1.5 bg-amber-50/70 border border-amber-200 px-2.5 py-1 rounded-lg">
            <label className="text-xs font-bold text-amber-900">Max Marks:</label>
            <input
              id="max-marks-input"
              type="number"
              min="1"
              max="1000"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 px-2 py-0.5 text-xs font-bold text-amber-950 bg-white border border-amber-300 rounded text-center focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Banner for Current Assessment */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/50 p-3.5 rounded-lg border border-amber-200/60">
        <div className="flex items-center gap-2 text-xs text-stone-700">
          <FileText className="w-4 h-4 text-amber-700" />
          <span>
            Recording marks for <strong className="text-amber-950 font-bold">{selectedAssessment}</strong> (Out of {maxMarks} marks)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="text-stone-600">
            Graded: <strong className="text-stone-900">{enteredScores.length} / {students.length}</strong>
          </span>
          <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
            Average: {averagePct.toFixed(1)}% ({averageScore.toFixed(1)}/{maxMarks})
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
          <span>Marks for {selectedAssessment} have been saved to Firebase successfully!</span>
        </div>
      )}

      {/* Marks Entry Table */}
      {students.length === 0 ? (
        <div className="text-center py-8 text-stone-500 text-sm">
          No students found. Please setup class and upload student roster first.
        </div>
      ) : (
        <div className="overflow-x-auto border border-stone-200 rounded-lg shadow-xs">
          <table id="marks-table" className="min-w-full divide-y divide-stone-200 text-left text-sm">
            <thead className="bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3 w-20">Roll</th>
                <th scope="col" className="px-4 py-3">Student Name</th>
                <th scope="col" className="px-4 py-3 w-36 text-center">Marks (/{maxMarks})</th>
                <th scope="col" className="px-4 py-3 w-32 text-right">Percentage %</th>
                <th scope="col" className="px-4 py-3 w-28 text-center">Grade/Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {students.map((student) => {
                const rawVal = scores[student.rollNumber];
                const hasScore = rawVal !== undefined && rawVal !== '';
                const numScore = hasScore ? Number(rawVal) : 0;
                const pct = hasScore && maxMarks > 0 ? (numScore / maxMarks) * 100 : 0;

                // Simple Bhutan evaluation indicator
                let resultBadge = '-';
                let resultClass = 'text-stone-400';
                if (hasScore) {
                  if (pct >= 80) {
                    resultBadge = 'Distinction';
                    resultClass = 'bg-emerald-100 text-emerald-800';
                  } else if (pct >= 60) {
                    resultBadge = 'Pass (Merit)';
                    resultClass = 'bg-sky-100 text-sky-800';
                  } else if (pct >= 40) {
                    resultBadge = 'Pass';
                    resultClass = 'bg-amber-100 text-amber-800';
                  } else {
                    resultBadge = 'Needs Support';
                    resultClass = 'bg-rose-100 text-rose-800';
                  }
                }

                return (
                  <tr key={student.rollNumber} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-medium text-stone-800">
                      {student.rollNumber}
                    </td>
                    <td className="px-4 py-2.5 text-stone-900 font-medium">
                      {student.name}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="inline-flex items-center justify-center">
                        <input
                          id={`score-input-${student.rollNumber}`}
                          type="number"
                          step="0.5"
                          min="0"
                          max={maxMarks}
                          placeholder="0"
                          value={rawVal ?? ''}
                          onChange={(e) => handleScoreChange(student.rollNumber, e.target.value)}
                          className="w-20 px-2 py-1 text-sm font-semibold text-center border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">
                      {hasScore ? (
                        <span className="text-stone-800 text-sm">
                          {pct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-stone-400 text-xs">--</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {hasScore ? (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${resultClass}`}>
                          {resultBadge}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Save Marks Button */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
        <p className="text-xs text-stone-500">
          Marks and computed percentages are saved directly to Firebase under your teacher profile.
        </p>

        <button
          id="save-marks-btn"
          type="button"
          onClick={handleSaveMarks}
          disabled={isSaving || students.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving Marks...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Marks in Firebase
            </>
          )}
        </button>
      </div>

    </div>
  );
};
