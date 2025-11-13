import React, { useState } from 'react';
// Mengimpor ikon-ikon dari lucide-react
import {
  LayoutGrid,
  Smartphone,
  Shirt,
  Home,
  Heart,
  Activity,
  BookOpen,
  Coffee,
  Car,
  Film,
  Music,
  Utensils,
  Plane,
  Sparkles,
  Puzzle,
  Baby,
  Armchair,
  Flower,
  Gamepad2,
  Dog,
  Search,
  ChevronUp,
  ChevronDown,
  SearchX
} from 'lucide-react';

// --- Data Kategori ---
// Menggunakan referensi komponen ikon dari lucide-react
const CATEGORIES = [
  { value: "Semua", icon: LayoutGrid },
  { value: "Elektronik", icon: Smartphone },
  { value: "Pakaian", icon: Shirt },
  { value: "Rumah", icon: Home },
  { value: "Kesehatan", icon: Heart },
  { value: "Olahraga", icon: Activity },
  { value: "Buku", icon: BookOpen },
  { value: "Gaya Hidup", icon: Coffee },
  { value: "Otomotif", icon: Car },
  { value: "Film", icon: Film },
  { value: "Musik", icon: Music },
  { value: "Makanan", icon: Utensils },
  { value: "Perjalanan", icon: Plane },
  { value: "Kecantikan", icon: Sparkles },
  { value: "Mainan", icon: Puzzle },
  { value: "Bayi", icon: Baby },
  { value: "Furnitur", icon: Armchair },
  { value: "Taman", icon: Flower },
  { value: "Game", icon: Gamepad2 },
  { value: "Hewan", icon: Dog },
];

// --- Komponen Utama Aplikasi ---
export default function FilterExample() {
  // State untuk mode kategori
  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const onFilterClick = (value: string) => setSelectedFilter(value);
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const onToggleExpand = () => setIsExpanded(!isExpanded);

  // Logika filter
  const filteredCategories = CATEGORIES.filter(category =>
    category.value.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const baseButtonClasses = "flex items-center gap-2 py-2 px-5 rounded-lg text-sm font-medium transition-all duration-200 border-2";

  return (
    <div className="min-h-screen p-4 sm:p-8 font-inter bg-gray-100 overflow-y-scroll">
      <div className="max-w-3xl mx-auto">
        
        {/* 2. Bagian Filter Kategori */}
        <section className="bg-white p-6 sm:p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Filter Kategori</h2>

          {/* Input Pencarian */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Cari kategori..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-blue-500 transition-colors duration-200 text-sm"
              value={searchTerm}
              onChange={onSearchChange}
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Wrapper untuk Expand/Collapse */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[30rem]' : 'max-h-12'}`}>
            <div className="flex flex-wrap gap-3 justify-center py-1">
              {filteredCategories.map((category) => {
                const isActive = selectedFilter === category.value;
                const activeClasses = "border-blue-300 ring-2 ring-blue-600 text-blue-600 bg-blue-50";
                const inactiveClasses = "text-gray-600 border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white";
                
                // Mendapatkan komponen Ikon dari data
                const IconComponent = category.icon;

                return (
                  <button
                    key={category.value}
                    onClick={() => onFilterClick(category.value)}
                    className={`${baseButtonClasses} ${isActive ? activeClasses : inactiveClasses}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{category.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tombol Tampilkan Semua / Lebih Sedikit */}
          {filteredCategories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={onToggleExpand}
                className="flex items-center justify-center gap-2 w-full text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <span>Tampilkan Lebih Sedikit</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Tampilkan Semua Kategori</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Pesan "Tidak Ditemukan" */}
          {filteredCategories.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              <SearchX className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="font-medium">Tidak Ada Kategori Ditemukan</p>
              <p className="text-sm">Coba kata kunci lain.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}


