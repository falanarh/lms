import { Search, ChevronRight } from "lucide-react";
import { HomePageClient } from "@/features/home/HomePage";
import type { Course } from "@/features/home/CourseCard";

export default function HomePage() {
  // Dummy data untuk kursus - nanti bisa diganti dengan data dari API
  // Di Server Component, bisa langsung fetch dari database atau API
  const popularCourses: Course[] = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      category: "Programming",
      rating: 4.8,
      students: 12433,
      image: "/api/placeholder/280/180",
    },
    {
      id: 2,
      title: "Advanced JavaScript & TypeScript",
      category: "Programming",
      rating: 4.9,
      students: 8521,
      image: "/api/placeholder/280/180",
    },
    {
      id: 3,
      title: "React & Next.js Complete Guide",
      category: "Programming",
      rating: 4.7,
      students: 15234,
      image: "/api/placeholder/280/180",
    },
    {
      id: 4,
      title: "Data Science with Python",
      category: "Data Analytics",
      rating: 4.8,
      students: 9876,
      image: "/api/placeholder/280/180",
    },
    {
      id: 5,
      title: "Machine Learning Basics",
      category: "Data Analytics",
      rating: 4.6,
      students: 7654,
      image: "/api/placeholder/280/180",
    },
    {
      id: 6,
      title: "Digital Marketing Strategy",
      category: "Digital Marketing",
      rating: 4.5,
      students: 11234,
      image: "/api/placeholder/280/180",
    },
  ];

  const newCourses: Course[] = [
    {
      id: 7,
      title: "UI/UX Design Principles",
      category: "Design",
      rating: 4.9,
      students: 6543,
      image: "/api/placeholder/280/180",
    },
    {
      id: 8,
      title: "Project Management Professional",
      category: "Project Management",
      rating: 4.7,
      students: 8912,
      image: "/api/placeholder/280/180",
    },
    {
      id: 9,
      title: "Leadership & Team Building",
      category: "Leadership",
      rating: 4.8,
      students: 10234,
      image: "/api/placeholder/280/180",
    },
    {
      id: 10,
      title: "Business Intelligence with Power BI",
      category: "Data Analytics",
      rating: 4.6,
      students: 5432,
      image: "/api/placeholder/280/180",
    },
    {
      id: 11,
      title: "Cloud Computing with AWS",
      category: "Programming",
      rating: 4.8,
      students: 7890,
      image: "/api/placeholder/280/180",
    },
    {
      id: 12,
      title: "Cybersecurity Fundamentals",
      category: "Security",
      rating: 4.7,
      students: 6789,
      image: "/api/placeholder/280/180",
    },
  ];

  const testimonials = [
    {
      id: 1,
      text: "Platform E-Warkop sangat membantu dalam meningkatkan kompetensi karyawan kami. Interface yang intuitif membuat proses pembelajaran jadi lebih efektif dan menyenangkan.",
      name: "Budi Santoso",
      position: "Learning & Development Manager •",
      company: "PT Telkom Indonesia",
      avatar: "/api/placeholder/48/48",
    },
    {
      id: 2,
      text: "Platform E-Warkop sangat membantu dalam meningkatkan kompetensi karyawan kami. Interface yang intuitif membuat proses pembelajaran jadi lebih efektif dan menyenangkan.",
      name: "Siti Nurhaliza",
      position: "HR Director •",
      company: "Bank Mandiri",
      avatar: "/api/placeholder/48/48",
    },
    {
      id: 3,
      text: "Platform E-Warkop sangat membantu dalam meningkatkan kompetensi karyawan kami. Interface yang intuitif membuat proses pembelajaran jadi lebih efektif dan menyenangkan.",
      name: "Ahmad Wijaya",
      position: "Training Manager •",
      company: "Pertamina",
      avatar: "/api/placeholder/48/48",
    },
  ];

  const categories = ["Populer", "Leadership", "Digital Marketing", "Project Management", "Data Analytics"];

  const aiFeatures = [
    {
      title: "Personalized Learning",
      description: "Jalur pembelajaran yang disesuaikan dengan gaya belajar, kecepatan, dan tujuan karir setiap individu untuk hasil yang optimal",
    },
    {
      title: "Smart Recommendations",
      description: "Rekomendasi kursus cerdas berdasarkan riwayat belajar, minat, dan kebutuhan pengembangan kompetensi Anda",
    },
    {
      title: "Adaptive Assessment",
      description: "Penilaian yang menyesuaikan tingkat kesulitan secara otomatis untuk pengukuran kompetensi yang lebih akurat",
    },
  ];

  return (
    <main className="bg-zinc-50">
      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Selamat Datang
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-blue-600">Platform E-Warkop BPS</span>
            </h2>
            <p className="text-gray-600 text-base md:text-lg mb-8 max-w-3xl mx-auto">
              Dengan Memanfaatkan media digital dan teknologi daring, keterbatasan pegawai dalam
              mengembangkan kompetensi karena jarak dan waktu dapat diminimalkan.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <input
                type="text"
                placeholder="Kursus apa yang ingin kamu cari?"
                className="w-full px-6 py-4 pr-14 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                <Search size={20} />
              </button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    index === 0
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Scroll Down Icon */}
          <div className="flex justify-center mt-12">
            <div className="size-10 rounded-full border-2 border-blue-600 flex items-center justify-center animate-bounce cursor-pointer">
              <ChevronRight className="rotate-90 text-blue-600" size={20} />
            </div>
          </div>
        </div>
      </section>

      {/* Kursus Populer & Terbaru Sections */}
      <HomePageClient popularCourses={popularCourses} newCourses={newCourses} />

      {/* Testimoni Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Testimoni Pengguna
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {testimonial.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">
                      {testimonial.position} {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2">
            <button className="size-2 rounded-full bg-blue-600"></button>
            <button className="size-2 rounded-full bg-gray-300"></button>
            <button className="size-2 rounded-full bg-gray-300"></button>
          </div>
        </div>
      </section>

      {/* AI Learning Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="text-center mb-4">
            <span className="inline-block bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              AI Powered Learning
            </span>
          </div>
          
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pengalaman Belajar Didukung
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6">
              Teknologi Artificial Intelligence
            </h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Maksimalkan efektivitas pembelajaran dengan teknologi AI yang mengadaptasi kebutuhan setiap pengguna secara real-time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {aiFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="size-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z" />
                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Tingkatkan Kompetensi Anda
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                Dapatkan akses ke ribuan pembelajaran dengan teknologi AI, konten berkualitas, dan sertifikat terakreditasi untuk transformasi SDM
              </p>
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2 shadow-lg">
                Mulai Sekarang
                <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Decorative illustration */}
            <div className="absolute right-0 bottom-0 w-64 h-64 opacity-20">
              <div className="text-9xl">💡</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}