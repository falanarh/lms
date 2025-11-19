import * as XLSX from 'xlsx';

/**
 * Quiz Question Excel Template Structure
 * Based on your QuizQuestion form fields
 */

export interface ExcelQuestionRow {
  'No': number;
  'Tipe Soal': string; // 'Pilihan Ganda', 'Essay', 'Benar/Salah'
  'Pertanyaan': string;
  'Opsi A': string;
  'Opsi B': string;
  'Opsi C': string;
  'Opsi D': string;
  'Jawaban Benar': string; // For multiple choice: 'A', 'B', 'C', 'D' | For true/false: 'Benar', 'Salah'
}

/**
 * Generate Excel template for quiz questions
 */
export function generateQuizTemplate(): void {
  // Sample data to show users how to fill the template
  const sampleData: ExcelQuestionRow[] = [
    {
      'No': 1,
      'Tipe Soal': 'Pilihan Ganda',
      'Pertanyaan': 'Apa ibukota Indonesia?',
      'Opsi A': 'Jakarta',
      'Opsi B': 'Bandung',
      'Opsi C': 'Surabaya',
      'Opsi D': 'Medan',
      'Jawaban Benar': 'A',
    },
    {
      'No': 2,
      'Tipe Soal': 'Benar/Salah',
      'Pertanyaan': 'Indonesia memiliki 34 provinsi',
      'Opsi A': '',
      'Opsi B': '',
      'Opsi C': '',
      'Opsi D': '',
      'Jawaban Benar': 'Salah',
    },
    {
      'No': 3,
      'Tipe Soal': 'Essay',
      'Pertanyaan': 'Jelaskan perbedaan antara demokrasi langsung dan demokrasi tidak langsung!',
      'Opsi A': '',
      'Opsi B': '',
      'Opsi C': '',
      'Opsi D': '',
      'Jawaban Benar': '',
    },
  ];

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 15 }, // Tipe Soal
    { wch: 50 }, // Pertanyaan
    { wch: 30 }, // Opsi A
    { wch: 30 }, // Opsi B
    { wch: 30 }, // Opsi C
    { wch: 30 }, // Opsi D
    { wch: 15 }, // Jawaban Benar
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Soal');

  // Add instructions sheet
  const instructions = [
    ['PANDUAN PENGISIAN TEMPLATE SOAL KUIS'],
    [''],
    ['FORMAT KOLOM:'],
    ['No | Tipe Soal | Pertanyaan | Opsi A | Opsi B | Opsi C | Opsi D | Jawaban Benar'],
    [''],
    ['1. TIPE SOAL'],
    ['   - Pilihan Ganda: "Pilihan Ganda"'],
    ['   - Essay: "Essay"'],
    ['   - Benar/Salah: "Benar/Salah"'],
    [''],
    ['2. PERTANYAAN'],
    ['   - Tulis pertanyaan dengan jelas'],
    ['   - Hindari karakter khusus yang tidak perlu'],
    ['   - Jika ada koma, tetap gunakan (tidak masalah)'],
    [''],
    ['3. OPSI A, B, C, D'],
    ['   - Wajib diisi untuk tipe "Pilihan Ganda"'],
    ['   - Kosongkan untuk tipe "Essay" dan "Benar/Salah"'],
    ['   - Minimal 2 opsi harus diisi'],
    ['   - Boleh menggunakan tanda koma (,) di dalam opsi'],
    [''],
    ['4. JAWABAN BENAR'],
    ['   - Pilihan Ganda: Masukkan huruf (A, B, C, atau D)'],
    ['   - Benar/Salah: Masukkan "Benar" atau "Salah"'],
    ['   - Essay: Kosongkan (akan dinilai manual)'],
    [''],
    ['CONTOH PENGISIAN:'],
    ['1 | Pilihan Ganda | Ibukota Indonesia | Jakarta | Bandung | Surabaya | Medan | A'],
    ['2 | Benar/Salah | Indonesia memiliki 34 provinsi | | | | | Salah'],
    ['3 | Essay | Jelaskan demokrasi | | | | | '],
    [''],
    ['CATATAN PENTING:'],
    ['- Jangan ubah nama kolom (header)'],
    ['- Jangan hapus kolom'],
    ['- Pastikan setiap baris terisi lengkap'],
    ['- Maksimal 100 soal per file'],
    ['- File bisa .xlsx, .xls, atau .ods'],
    ['- Poin akan otomatis diset 10 untuk setiap soal'],
  ];

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructions);
  instructionsWs['!cols'] = [{ wch: 60 }];
  XLSX.utils.book_append_sheet(workbook, instructionsWs, 'Panduan');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Template_Soal_Kuis_${timestamp}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
}

/**
 * Parse uploaded Excel file and convert to QuizQuestion format
 */
export async function parseQuizExcel(file: File): Promise<{
  success: boolean;
  data?: ExcelQuestionRow[];
  errors?: string[];
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelQuestionRow>(worksheet);

        // Validate data
        const errors: string[] = [];
        const validatedData: ExcelQuestionRow[] = [];

        jsonData.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because Excel rows start at 1 and we have header

          // Validate required fields
          if (!row['Tipe Soal']) {
            errors.push(`Baris ${rowNumber}: Tipe Soal tidak boleh kosong`);
          }
          if (!row['Pertanyaan']) {
            errors.push(`Baris ${rowNumber}: Pertanyaan tidak boleh kosong`);
          }

          // Validate based on question type
          const tipeSoal = row['Tipe Soal']?.toLowerCase();
          
          if (tipeSoal === 'pilihan ganda') {
            // Validate multiple choice
            const hasOptions = row['Opsi A'] || row['Opsi B'] || row['Opsi C'] || row['Opsi D'];
            if (!hasOptions) {
              errors.push(`Baris ${rowNumber}: Pilihan Ganda harus memiliki minimal 2 opsi`);
            }
            if (!row['Jawaban Benar']) {
              errors.push(`Baris ${rowNumber}: Jawaban Benar tidak boleh kosong`);
            } else {
              const answer = row['Jawaban Benar'].toString().toUpperCase().trim();
              if (!['A', 'B', 'C', 'D'].includes(answer)) {
                errors.push(`Baris ${rowNumber}: Jawaban Benar harus A, B, C, atau D`);
              }
            }
          } else if (tipeSoal === 'benar/salah') {
            // Validate true/false
            if (!row['Jawaban Benar']) {
              errors.push(`Baris ${rowNumber}: Jawaban Benar tidak boleh kosong`);
            } else {
              const answer = row['Jawaban Benar'].toString().toLowerCase().trim();
              if (!['benar', 'salah', 'true', 'false'].includes(answer)) {
                errors.push(`Baris ${rowNumber}: Jawaban Benar harus "Benar" atau "Salah"`);
              }
            }
          }

          // If no errors for this row, add to validated data
          if (errors.length === 0 || !errors.some(e => e.includes(`Baris ${rowNumber}`))) {
            validatedData.push(row);
          }
        });

        if (errors.length > 0) {
          resolve({ success: false, errors });
        } else {
          resolve({ success: true, data: validatedData });
        }
      } catch {
        resolve({
          success: false,
          errors: ['Gagal membaca file Excel. Pastikan format file benar.'],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['Gagal membaca file. Silakan coba lagi.'],
      });
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Convert Excel row to QuizQuestion format
 * Default: 10 points per question, no explanation
*/
export function excelRowToQuizQuestion(row: ExcelQuestionRow, order: number) {
  const tipeSoal = row['Tipe Soal'].toLowerCase().trim();
  let questionType: 'multiple_choice' | 'short_answer' | 'true_false';
  
  if (tipeSoal === 'pilihan ganda') {
    questionType = 'multiple_choice';
  } else if (tipeSoal === 'benar/salah') {
    questionType = 'true_false';
  } else {
    questionType = 'short_answer';
  }

  // Build options for multiple choice
  const options = questionType === 'multiple_choice' ? [
    { id: 'A', text: (row['Opsi A'] || '').toString().trim(), isCorrect: row['Jawaban Benar']?.toString().toUpperCase().trim() === 'A', order: 0 },
    { id: 'B', text: (row['Opsi B'] || '').toString().trim(), isCorrect: row['Jawaban Benar']?.toString().toUpperCase().trim() === 'B', order: 1 },
    { id: 'C', text: (row['Opsi C'] || '').toString().trim(), isCorrect: row['Jawaban Benar']?.toString().toUpperCase().trim() === 'C', order: 2 },
    { id: 'D', text: (row['Opsi D'] || '').toString().trim(), isCorrect: row['Jawaban Benar']?.toString().toUpperCase().trim() === 'D', order: 3 },
  ].filter(opt => opt.text !== '') : undefined;

  // For essay questions, always provide a non-empty answer
  const answer = questionType === 'short_answer' 
    ? { answer: (row['Jawaban Benar']?.toString().trim() || '1') } // Ensure answer is never empty
    : undefined;

  // Get correct answer for true/false
  const correctAnswer = questionType === 'true_false' 
    ? (row['Jawaban Benar']?.toString().toLowerCase().trim() === 'benar' || row['Jawaban Benar']?.toString().toLowerCase().trim() === 'true' ? 'true' : 'false')
    : undefined;

  return {
    id: `temp-${Date.now()}-${order}`,
    questionText: row['Pertanyaan'].toString().trim(),
    questionType,
    points: 10, // Default 10 points for all questions
    order,
    options,
    correctAnswer,
    answer, // Include answer object for essay questions
    explanation: undefined, // No explanation in simplified format
  };
}