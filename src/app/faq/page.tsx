import { Search, HelpCircle, BookOpen, Settings, Users, Shield } from "lucide-react";
import { FAQList } from "@/features/home/FaqList";
import type { FAQItemType } from "@/features/home/FaqItem";

export default function FAQPage() {
  // Data FAQ - nanti bisa diambil dari API/database
  const faqData: FAQItemType[] = [
    // Kategori: Umum
    {
      id: 1,
      category: "Umum",
      question: "Apa itu E-Warkop?",
      answer: "E-Warkop adalah platform Learning Management System (LMS) yang dikembangkan khusus untuk Badan Pusat Statistik (BPS) untuk memfasilitasi pembelajaran digital bagi pegawai. Platform ini menyediakan berbagai kursus, materi pembelajaran, dan fitur interaktif untuk meningkatkan kompetensi pegawai BPS.",
    },
    {
      id: 2,
      category: "Umum",
      question: "Siapa yang bisa menggunakan E-Warkop?",
      answer: "E-Warkop dapat digunakan oleh seluruh pegawai BPS yang telah terdaftar dalam sistem. Setiap pegawai akan mendapatkan akun dengan hak akses sesuai dengan peran dan kebutuhan pembelajaran mereka.",
    },
    {
      id: 3,
      category: "Umum",
      question: "Apakah E-Warkop bisa diakses melalui mobile?",
      answer: "Ya, E-Warkop dapat diakses melalui berbagai perangkat termasuk smartphone, tablet, dan komputer. Platform kami dirancang responsive sehingga dapat beradaptasi dengan berbagai ukuran layar untuk pengalaman belajar yang optimal.",
    },
    // Kategori: Kursus & Pembelajaran
    {
      id: 4,
      category: "Kursus",
      question: "Bagaimana cara mendaftar kursus?",
      answer: "Untuk mendaftar kursus, login ke akun Anda, kemudian buka halaman 'Kursus' atau 'Katalog'. Pilih kursus yang Anda minati, klik tombol 'Daftar' atau 'Mulai Belajar'. Beberapa kursus mungkin memerlukan persetujuan dari atasan atau memiliki prasyarat tertentu.",
    },
    {
      id: 5,
      category: "Kursus",
      question: "Apakah ada batas waktu untuk menyelesaikan kursus?",
      answer: "Setiap kursus memiliki durasi yang berbeda-beda. Informasi mengenai batas waktu penyelesaian dapat dilihat pada halaman detail kursus. Beberapa kursus memiliki deadline tertentu, sementara yang lain dapat diselesaikan dengan fleksibel sesuai kecepatan belajar Anda.",
    },
    {
      id: 6,
      category: "Kursus",
      question: "Bagaimana cara mendapatkan sertifikat?",
      answer: "Sertifikat akan diberikan secara otomatis setelah Anda menyelesaikan semua materi dan lulus ujian akhir dengan nilai minimum yang ditentukan. Sertifikat dapat diunduh dalam format PDF melalui halaman 'My Course' atau 'Sertifikat Saya'.",
    },
    {
      id: 7,
      category: "Kursus",
      question: "Apakah saya bisa mengulang kursus yang sudah selesai?",
      answer: "Ya, Anda dapat mengakses kembali materi kursus yang telah selesai melalui halaman 'My Course'. Namun untuk mengulang ujian dan mendapatkan sertifikat baru, silakan hubungi administrator atau instruktur kursus.",
    },
    // Kategori: Akun & Login
    {
      id: 8,
      category: "Akun",
      question: "Bagaimana cara reset password?",
      answer: "Klik 'Lupa Password' pada halaman login, masukkan email atau NIP Anda. Anda akan menerima link reset password melalui email. Ikuti instruksi dalam email untuk membuat password baru. Jika tidak menerima email, periksa folder spam atau hubungi helpdesk.",
    },
    {
      id: 9,
      category: "Akun",
      question: "Bagaimana cara mengubah profil saya?",
      answer: "Login ke akun Anda, klik pada foto profil atau nama Anda di pojok kanan atas, pilih 'Pengaturan' atau 'Edit Profil'. Anda dapat mengubah informasi seperti foto profil, nomor telepon, dan preferensi notifikasi. Beberapa data seperti NIP tidak dapat diubah.",
    },
    {
      id: 10,
      category: "Akun",
      question: "Akun saya terkunci, apa yang harus dilakukan?",
      answer: "Akun dapat terkunci setelah beberapa kali percobaan login yang gagal untuk keamanan. Tunggu 30 menit sebelum mencoba kembali, atau hubungi helpdesk di support@ewarkop.bps.go.id atau (021) 3841195 untuk bantuan lebih lanjut.",
    },
    // Kategori: Teknis
    {
      id: 11,
      category: "Teknis",
      question: "Video pembelajaran tidak bisa diputar, bagaimana solusinya?",
      answer: "Pastikan koneksi internet Anda stabil dan browser yang digunakan sudah update. Coba clear cache browser atau gunakan browser lain (Chrome, Firefox, Safari, Edge). Jika masalah berlanjut, coba turunkan kualitas video atau hubungi helpdesk untuk bantuan teknis.",
    },
    {
      id: 12,
      category: "Teknis",
      question: "Apakah ada persyaratan sistem untuk menggunakan E-Warkop?",
      answer: "E-Warkop dapat diakses melalui browser modern (Chrome, Firefox, Safari, Edge versi terbaru). Untuk pengalaman optimal, gunakan koneksi internet minimal 2 Mbps. Untuk video HD, disarankan koneksi 5 Mbps atau lebih.",
    },
    // Kategori: Sertifikat
    {
      id: 13,
      category: "Sertifikat",
      question: "Apakah sertifikat E-Warkop diakui secara resmi?",
      answer: "Ya, sertifikat yang diterbitkan oleh E-Warkop diakui secara resmi oleh BPS dan dapat digunakan untuk pengembangan karir pegawai. Sertifikat memiliki nomor unik dan dapat diverifikasi melalui sistem.",
    },
    {
      id: 14,
      category: "Sertifikat",
      question: "Bagaimana jika saya kehilangan sertifikat?",
      answer: "Sertifikat digital dapat diunduh kembali kapan saja melalui halaman 'Sertifikat Saya' di dashboard. Jika Anda memerlukan sertifikat fisik atau mengalami kendala download, silakan hubungi administrator.",
    },
  ];

  // Group FAQs by category
  const categories = [
    { id: "umum", name: "Umum", icon: HelpCircle },
    { id: "kursus", name: "Kursus & Pembelajaran", icon: BookOpen },
    { id: "akun", name: "Akun & Login", icon: Users },
    { id: "teknis", name: "Teknis", icon: Settings },
    { id: "sertifikat", name: "Sertifikat", icon: Shield },
  ];

  const groupedFAQs = categories.map((category) => ({
    ...category,
    faqs: faqData.filter(
      (faq) => faq.category?.toLowerCase() === category.id
    ),
  }));

  return (
    <main className="bg-zinc-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center size-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <HelpCircle size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Pusat Bantuan
            </h1>
            <p className="text-blue-100 text-lg mb-8">
              Temukan jawaban untuk pertanyaan yang sering diajukan tentang E-Warkop
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Cari pertanyaan atau kata kunci..."
                className="w-full px-6 py-4 pr-14 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 placeholder:text-gray-400 shadow-lg"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-200 hover:border-blue-600 hover:shadow-md transition-all duration-200 group"
              >
                <div className="size-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <category.icon size={24} />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  {category.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Sections by Category */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="space-y-12">
            {groupedFAQs.map((category) => (
              <div key={category.id} id={category.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <category.icon size={20} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {category.name}
                  </h2>
                  <span className="ml-auto text-sm text-gray-500">
                    {category.faqs.length} pertanyaan
                  </span>
                </div>
                
                {category.faqs.length > 0 ? (
                  <FAQList faqs={category.faqs} allowMultipleOpen={false} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Belum ada pertanyaan untuk kategori ini
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Tidak Menemukan Jawaban?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Tim support kami siap membantu Anda. Hubungi kami melalui email atau telepon untuk mendapatkan bantuan lebih lanjut.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
              <a
                href="mailto:support@ewarkop.bps.go.id"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-semibold text-gray-900">support@ewarkop.bps.go.id</div>
                </div>
              </a>
              
              <a
                href="tel:+622138141195"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm text-gray-500">Telepon</div>
                  <div className="font-semibold text-gray-900">(021) 3841195</div>
                </div>
              </a>
            </div>

            <p className="text-sm text-gray-500">
              Jam operasional: Senin - Jumat, 08:00 - 17:00 WIB
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}