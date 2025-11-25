import * as XLSX from "xlsx";

/**
 * Quiz Question Excel Template Structure
 * Updated structure with flexible answer columns
 */

export interface ExcelQuestionRow {
  No: number;
  "Tipe Soal": string; // 'Pilihan Ganda', 'Jawaban Singkat', 'Benar/Salah'
  Pertanyaan: string;
  "Jawaban Benar": string;
  "Jawaban Salah 1"?: string;
  "Jawaban Salah 2"?: string;
  "Jawaban Salah 3"?: string;
  "Jawaban Salah 4"?: string;
  "Jawaban Salah 5"?: string;
}

/**
 * Generate Excel template for quiz questions
 */
export function generateQuizTemplate(): void {
  // Sample data to show users how to fill the template
  const sampleData: ExcelQuestionRow[] = [
    {
      No: 1,
      "Tipe Soal": "Pilihan Ganda",
      Pertanyaan: "Apa ibukota Indonesia?",
      "Jawaban Benar": "Jakarta",
      "Jawaban Salah 1": "Bandung",
      "Jawaban Salah 2": "Surabaya",
      "Jawaban Salah 3": "Medan",
    },
    {
      No: 2,
      "Tipe Soal": "Benar/Salah",
      Pertanyaan: "Indonesia memiliki 34 provinsi",
      "Jawaban Benar": "Salah",
    },
    {
      No: 3,
      "Tipe Soal": "Jawaban Singkat",
      Pertanyaan: "Siapa presiden pertama Indonesia?",
      "Jawaban Benar": "Soekarno",
    },
  ];

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 5 }, // No
    { wch: 15 }, // Tipe Soal
    { wch: 50 }, // Pertanyaan
    { wch: 30 }, // Jawaban Benar
    { wch: 30 }, // Jawaban Salah 1
    { wch: 30 }, // Jawaban Salah 2
    { wch: 30 }, // Jawaban Salah 3
    { wch: 30 }, // Jawaban Salah 4
    { wch: 30 }, // Jawaban Salah 5
  ];

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template Soal");

  // Add instructions sheet
  const instructions = [
    ["PANDUAN PENGISIAN TEMPLATE SOAL KUIS"],
    [""],
    ["FORMAT KOLOM:"],
    [
      "No | Tipe Soal | Pertanyaan | Jawaban Benar | Jawaban Salah 1 | Jawaban Salah 2 | Jawaban Salah 3 | ...",
    ],
    [""],
    ["1. TIPE SOAL"],
    ['   - Pilihan Ganda: "Pilihan Ganda"'],
    ['   - Jawaban Singkat: "Jawaban Singkat"'],
    ['   - Benar/Salah: "Benar/Salah"'],
    [""],
    ["2. PERTANYAAN"],
    ["   - Tulis pertanyaan dengan jelas"],
    ["   - Hindari karakter khusus yang tidak perlu"],
    ["   - Jika ada koma, tetap gunakan (tidak masalah)"],
    [""],
    ["3. JAWABAN BENAR"],
    ['   - Pilihan Ganda: Isi dengan jawaban yang benar (contoh: "Jakarta")'],
    ['   - Benar/Salah: Masukkan "Benar" atau "Salah"'],
    ["   - Jawaban Singkat: Isi dengan jawaban yang diharapkan"],
    [""],
    ["4. JAWABAN SALAH 1, 2, 3, 4, 5 (Hanya untuk Pilihan Ganda)"],
    ["   - Isi minimal 1 jawaban salah (total minimal 2 opsi)"],
    ["   - Maksimal 5 jawaban salah (total 6 opsi dengan jawaban benar)"],
    [
      '   - Untuk tipe "Benar/Salah" dan "Jawaban Singkat", kosongkan kolom ini',
    ],
    [
      '   - Anda bisa menambah kolom "Jawaban Salah 4", "Jawaban Salah 5", dst sesuai kebutuhan',
    ],
    [""],
    ["CONTOH PENGISIAN:"],
    [""],
    ["PILIHAN GANDA:"],
    [
      "1 | Pilihan Ganda | Apa ibukota Indonesia? | Jakarta | Bandung | Surabaya | Medan",
    ],
    [""],
    ["BENAR/SALAH:"],
    ["2 | Benar/Salah | Indonesia memiliki 34 provinsi | Salah | | | "],
    [""],
    ["JAWABAN SINGKAT:"],
    [
      "3 | Jawaban Singkat | Siapa presiden pertama Indonesia? | Soekarno | | | ",
    ],
    [""],
    ["CATATAN PENTING:"],
    ["- Jangan ubah nama kolom (header) yang sudah ada"],
    ['- Pastikan "Jawaban Benar" selalu diisi untuk semua tipe soal'],
    [
      "- Untuk Pilihan Ganda, minimal isi 1 Jawaban Salah (total minimal 2 opsi)",
    ],
    ["- Maksimal 100 soal per file"],
    ["- File bisa .xlsx, .xls, atau .ods"],
    ["- Poin akan otomatis diset 10 untuk setiap soal"],
    ["- Opsi akan diacak otomatis saat ditampilkan ke peserta"],
  ];

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructions);
  instructionsWs["!cols"] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, instructionsWs, "Panduan");

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split("T")[0];
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
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelQuestionRow>(worksheet);

        // Validate data
        const errors: string[] = [];
        const validatedData: ExcelQuestionRow[] = [];

        jsonData.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because Excel rows start at 1 and we have header

          // Validate required fields
          if (!row["Tipe Soal"]) {
            errors.push(`Baris ${rowNumber}: Tipe Soal tidak boleh kosong`);
          }
          if (!row["Pertanyaan"]) {
            errors.push(`Baris ${rowNumber}: Pertanyaan tidak boleh kosong`);
          }
          if (!row["Jawaban Benar"]) {
            errors.push(`Baris ${rowNumber}: Jawaban Benar tidak boleh kosong`);
          }

          // Validate based on question type
          const tipeSoal = row["Tipe Soal"]?.toLowerCase();

          if (tipeSoal === "pilihan ganda") {
            // Validate multiple choice - need at least 1 wrong answer
            const wrongAnswers = [
              row["Jawaban Salah 1"],
              row["Jawaban Salah 2"],
              row["Jawaban Salah 3"],
              row["Jawaban Salah 4"],
              row["Jawaban Salah 5"],
            ].filter((ans) => ans && ans.toString().trim() !== "");

            if (wrongAnswers.length === 0) {
              errors.push(
                `Baris ${rowNumber}: Pilihan Ganda harus memiliki minimal 1 jawaban salah`,
              );
            }
          } else if (tipeSoal === "benar/salah") {
            // Validate true/false
            const answer = row["Jawaban Benar"]
              ?.toString()
              .toLowerCase()
              .trim();
            if (!["benar", "salah", "true", "false"].includes(answer)) {
              errors.push(
                `Baris ${rowNumber}: Jawaban Benar harus "Benar" atau "Salah"`,
              );
            }
          }

          // If no errors for this row, add to validated data
          if (
            errors.length === 0 ||
            !errors.some((e) => e.includes(`Baris ${rowNumber}`))
          ) {
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
          errors: ["Gagal membaca file Excel. Pastikan format file benar."],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        errors: ["Gagal membaca file. Silakan coba lagi."],
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
  const tipeSoal = row["Tipe Soal"].toLowerCase().trim();
  let questionType: "multiple_choice" | "short_answer" | "true_false";

  if (tipeSoal === "pilihan ganda") {
    questionType = "multiple_choice";
  } else if (tipeSoal === "benar/salah") {
    questionType = "true_false";
  } else {
    questionType = "short_answer";
  }

  // Build options for multiple choice
  let options: any[] | undefined = undefined;
  let correctAnswerText = "";

  if (questionType === "multiple_choice") {
    // Collect all answers (correct + wrong)
    const allAnswers: { text: string; isCorrect: boolean }[] = [];

    // Add correct answer
    const correctAnswer = (row["Jawaban Benar"] || "").toString().trim();
    if (correctAnswer) {
      allAnswers.push({ text: correctAnswer, isCorrect: true });
    }

    // Add wrong answers
    const wrongAnswerKeys = [
      "Jawaban Salah 1",
      "Jawaban Salah 2",
      "Jawaban Salah 3",
      "Jawaban Salah 4",
      "Jawaban Salah 5",
    ] as const;
    wrongAnswerKeys.forEach((key) => {
      const wrongAnswer = row[key];
      if (wrongAnswer && wrongAnswer.toString().trim() !== "") {
        allAnswers.push({
          text: wrongAnswer.toString().trim(),
          isCorrect: false,
        });
      }
    });

    // Shuffle answers to randomize position of correct answer
    const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

    // Create options with proper structure
    options = shuffledAnswers.map((answer, index) => ({
      id: String.fromCharCode(65 + index), // A, B, C, D, ...
      text: answer.text,
      isCorrect: answer.isCorrect,
      order: index,
    }));

    correctAnswerText = correctAnswer;
  } else if (questionType === "true_false") {
    // For true/false, convert to 'true' or 'false'
    const answer = row["Jawaban Benar"]?.toString().toLowerCase().trim();
    correctAnswerText =
      answer === "benar" || answer === "true" ? "true" : "false";
  } else {
    // For short answer, use the provided answer
    correctAnswerText = row["Jawaban Benar"]?.toString().trim() || "";
  }

  // For short answer questions, always provide a non-empty answer
  const answer =
    questionType === "short_answer"
      ? { answer: correctAnswerText || "1" } // Ensure answer is never empty
      : undefined;

  return {
    id: `temp-${Date.now()}-${order}`,
    questionText: row["Pertanyaan"].toString().trim(),
    questionType,
    points: 10, // Default 10 points for all questions
    order,
    options,
    correctAnswer: correctAnswerText,
    answer, // Include answer object for short answer questions
    explanation: undefined, // No explanation in simplified format
  };
}
