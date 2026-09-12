import * as XLSX from 'xlsx';
import { Student } from './types';

export const SAMPLE_BHUTAN_STUDENTS: Student[] = [
  { rollNumber: '01', name: 'Tashi Dorji' },
  { rollNumber: '02', name: 'Sonam Choden' },
  { rollNumber: '03', name: 'Karma Wangchuk' },
  { rollNumber: '04', name: 'Dechen Pem' },
  { rollNumber: '05', name: 'Jigme Namgyel' },
  { rollNumber: '06', name: 'Tshering Yangzom' },
  { rollNumber: '07', name: 'Kinley Wangmo' },
  { rollNumber: '08', name: 'Pema Rinzin' },
  { rollNumber: '09', name: 'Ugyen Tshering' },
  { rollNumber: '10', name: 'Sangay Dema' },
];

export function parseExcelFile(file: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error('No sheets found in Excel file');
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        if (!rows || rows.length === 0) {
          throw new Error('The uploaded file contains no data rows.');
        }

        const parsedStudents: Student[] = [];

        rows.forEach((row, index) => {
          // Normalize keys
          let roll = '';
          let name = '';

          for (const key of Object.keys(row)) {
            const normalizedKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            const val = String(row[key] ?? '').trim();

            if (
              normalizedKey === 'rollnumber' ||
              normalizedKey === 'rollno' ||
              normalizedKey === 'roll' ||
              normalizedKey === 'slno' ||
              normalizedKey === 'id'
            ) {
              roll = val;
            } else if (
              normalizedKey === 'studentname' ||
              normalizedKey === 'name' ||
              normalizedKey === 'fullname' ||
              normalizedKey === 'student'
            ) {
              name = val;
            }
          }

          // Fallback if standard keys weren't recognized
          if (!roll || !name) {
            const values = Object.values(row).map(v => String(v ?? '').trim()).filter(Boolean);
            if (values.length >= 2) {
              roll = roll || values[0];
              name = name || values[1];
            } else if (values.length === 1 && !name) {
              name = values[0];
              roll = roll || String(index + 1).padStart(2, '0');
            }
          }

          if (name) {
            parsedStudents.push({
              rollNumber: roll || String(index + 1).padStart(2, '0'),
              name: name,
            });
          }
        });

        if (parsedStudents.length === 0) {
          throw new Error('Could not find Roll_Number and Student_Name columns. Please check your Excel headers.');
        }

        resolve(parsedStudents);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to read Excel file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to open file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

export function downloadSampleExcel() {
  const sampleData = SAMPLE_BHUTAN_STUDENTS.map(s => ({
    Roll_Number: s.rollNumber,
    Student_Name: s.name,
  }));

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bhutan_Class_Roster');
  XLSX.writeFile(wb, 'Bhutan_Teacher_Students_Sample.xlsx');
}
