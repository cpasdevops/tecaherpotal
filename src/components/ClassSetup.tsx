import React, { useState, useRef } from 'react';
import { Student, TeacherClassroom } from '../types';
import { parseExcelFile, downloadSampleExcel, SAMPLE_BHUTAN_STUDENTS } from '../excelUtils';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Users,
  Trash2,
  Plus
} from 'lucide-react';

interface ClassSetupProps {
  teacherName: string;
  teacherEmail: string;
  existingClassroom?: TeacherClassroom | null;
  onSaveClassroom: (classroom: TeacherClassroom) => Promise<void>;
}

export const ClassSetup: React.FC<ClassSetupProps> = ({
  teacherName,
  teacherEmail,
  existingClassroom,
  onSaveClassroom,
}) => {
  const [grade, setGrade] = useState(existingClassroom?.grade || 'Class 8');
  const [section, setSection] = useState(existingClassroom?.section || 'A');
  const [subject, setSubject] = useState(existingClassroom?.subject || 'English');
  const [students, setStudents] = useState<Student[]>(existingClassroom?.students || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick manual add student state
  const [newRoll, setNewRoll] = useState('');
  const [newName, setNewName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploading(true);

    try {
      const parsed = await parseExcelFile(file);
      if (parsed.length === 0) {
        throw new Error('No valid students found in the file.');
      }
      setStudents(parsed);
      setSuccessMessage(`Successfully loaded ${parsed.length} students from ${file.name}`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error reading Excel file. Please ensure it has Roll_Number and Student_Name columns.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    setStudents(SAMPLE_BHUTAN_STUDENTS);
    setSuccessMessage('Loaded Bhutan sample roster (10 students).');
    setErrorMessage(null);
  };

  const handleAddManualStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const roll = newRoll.trim() || String(students.length + 1).padStart(2, '0');
    setStudents([...students, { rollNumber: roll, name: newName.trim() }]);
    setNewRoll('');
    setNewName('');
  };

  const handleRemoveStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const handleSaveToFirebase = async () => {
    if (!grade.trim()) {
      setErrorMessage('Please enter Grade/Class.');
      return;
    }
    if (!section.trim()) {
      setErrorMessage('Please enter Section.');
      return;
    }
    if (!subject.trim()) {
      setErrorMessage('Please enter Subject.');
      return;
    }
    if (students.length === 0) {
      setErrorMessage('Please upload or add at least one student before saving.');
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      await onSaveClassroom({
        teacherName,
        teacherEmail,
        grade: grade.trim(),
        section: section.trim(),
        subject: subject.trim(),
        students,
      });
      setSuccessMessage('Classroom and student roster successfully saved to Firebase!');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save to Firebase.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Teacher Profile & Info Card */}
      <div id="teacher-info-banner" className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {teacherName.charAt(0) || 'T'}
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-amber-800">
              Bhutan Educator Profile
            </span>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
              {teacherName}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">{teacherEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Google Account Connected
          </span>
        </div>
      </div>

      {/* Class Details Form */}
      <div id="class-details-card" className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex items-center space-x-2.5 pb-3 mb-4 border-b border-stone-100">
          <BookOpen className="w-5 h-5 text-amber-700" />
          <h3 className="font-semibold text-stone-900 text-base">Classroom Setup</h3>
          <span className="text-xs text-stone-500 font-normal">(Grade, Section, Subject)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Grade / Class <span className="text-red-500">*</span>
            </label>
            <input
              id="input-grade"
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. Class 8 or Class 10"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
            />
            <p className="text-[11px] text-stone-500 mt-1">e.g., Class 7, Class 8, Class 9, Class 10</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Section <span className="text-red-500">*</span>
            </label>
            <input
              id="input-section"
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. A, B, or C"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
            />
            <p className="text-[11px] text-stone-500 mt-1">e.g., Section A, Section B</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="input-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Dzongkha, English, Maths"
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
            />
            <p className="text-[11px] text-stone-500 mt-1">e.g., Dzongkha, English, Science, Mathematics</p>
          </div>
        </div>
      </div>

      {/* Student Upload (Excel) Card */}
      <div id="student-upload-card" className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-semibold text-stone-900 text-base">Student Roster</h3>
              <p className="text-xs text-stone-500">
                Upload Excel file containing <code className="text-amber-800 font-mono font-semibold bg-amber-50 px-1 py-0.5 rounded">Roll_Number</code> and <code className="text-amber-800 font-mono font-semibold bg-amber-50 px-1 py-0.5 rounded">Student_Name</code>
              </p>
            </div>
          </div>

          {/* Quick Helper buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="download-sample-btn"
              type="button"
              onClick={downloadSampleExcel}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300 shadow-xs"
              title="Download sample Excel file with Roll_Number and Student_Name"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-stone-600" />
              Download Sample Excel
            </button>

            <button
              id="load-sample-roster-btn"
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300 shadow-xs"
              title="One-click load Bhutan sample students for quick workshop demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
              Use Sample Bhutan Class
            </button>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          id="excel-drop-zone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-white text-amber-700 shadow-xs flex items-center justify-center border border-amber-200">
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-stone-800">
              {isUploading ? 'Reading spreadsheet...' : 'Click to browse or drag & drop Excel file here'}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              Supports .xlsx, .xls, or .csv files with <span className="font-semibold text-stone-700">Roll_Number</span> and <span className="font-semibold text-stone-700">Student_Name</span>
            </p>
          </div>
        </div>

        {/* Feedback messages */}
        {errorMessage && (
          <div id="upload-error-banner" className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div id="upload-success-banner" className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Students Table */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-700" />
              Student List ({students.length} students)
            </h4>
          </div>

          {students.length === 0 ? (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-8 text-center text-stone-500 text-sm">
              <Users className="w-8 h-8 text-stone-400 mx-auto mb-2 opacity-60" />
              No students uploaded yet. Please upload an Excel sheet or click "Use Sample Bhutan Class".
            </div>
          ) : (
            <div className="overflow-x-auto border border-stone-200 rounded-lg shadow-xs">
              <table id="student-table" className="min-w-full divide-y divide-stone-200 text-left text-sm">
                <thead className="bg-amber-100/60 text-stone-800 font-semibold text-xs">
                  <tr>
                    <th scope="col" className="px-4 py-3 w-28">Roll Number</th>
                    <th scope="col" className="px-4 py-3">Student Name</th>
                    <th scope="col" className="px-4 py-3 text-right w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {students.map((student, idx) => (
                    <tr key={`${student.rollNumber}-${idx}`} className="hover:bg-amber-50/40 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-medium text-stone-800">
                        {student.rollNumber}
                      </td>
                      <td className="px-4 py-2.5 text-stone-900 font-medium">
                        {student.name}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveStudent(idx)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1"
                          title="Remove student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick add single student row */}
          <form onSubmit={handleAddManualStudent} className="mt-3 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="Roll No (e.g. 11)"
              value={newRoll}
              onChange={(e) => setNewRoll(e.target.value)}
              className="w-full sm:w-32 px-3 py-1.5 text-xs border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500"
            />
            <input
              type="text"
              placeholder="Student Name (e.g. Dawa Tshering)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full sm:flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-md focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors border border-amber-300"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Student
            </button>
          </form>
        </div>

        {/* Save Classroom to Firebase Button */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-500">
            Clicking save will store teacher, class, subject, and student roster safely in Firebase.
          </p>

          <button
            id="save-classroom-btn"
            type="button"
            onClick={handleSaveToFirebase}
            disabled={isSaving || students.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving to Firebase...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Classroom Data to Firebase
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
