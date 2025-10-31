import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center px-4">

        {/* 404 Number */}
        <h1 className="text-8xl md:text-9xl font-bold text-blue-600 mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
          Halaman Tidak Ditemukan
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau mungkin telah dipindahkan.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Kembali ke Beranda
          </Link>
          
          <Link
            href="/my-course"
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg border border-blue-200"
          >
            Lihat Kursus Saya
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-sm text-gray-500">
          <p>Butuh bantuan? Hubungi tim support LMS Enterprise BPS</p>
        </div>
      </div>
    </div>
  );
}