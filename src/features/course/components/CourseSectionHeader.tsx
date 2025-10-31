/**
 * CourseSectionHeader Component
 * 
 * Komponen header dengan ikon dan deskripsi untuk section course.
 * Cocok untuk menampilkan informasi curriculum, requirements, atau section lainnya.
 */

interface CourseSectionHeaderProps {
  /** Icon dari lucide-react */
  icon: React.ComponentType<{className?: string; strokeWidth?: number}>;
  
  /** Judul section */
  title: string;
  
  /** Deskripsi atau informasi tambahan */
  description: string;
  
  /** Warna gradient background - default: indigo */
  variant?: 'indigo' | 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'red';
  
  /** Additional CSS classes */
  className?: string;
}

export function CourseSectionHeader({
  icon: Icon,
  title,
  description,
  variant = 'indigo',
  className = ""
}: CourseSectionHeaderProps) {
  
  const variants = {
    indigo: {
      bg: "from-indigo-50 to-blue-50",
      border: "border-indigo-200",
      iconBg: "from-indigo-500 to-indigo-600"
    },
    blue: {
      bg: "from-blue-50 to-cyan-50",
      border: "border-blue-200",
      iconBg: "from-blue-500 to-blue-600"
    },
    purple: {
      bg: "from-purple-50 to-pink-50",
      border: "border-purple-200",
      iconBg: "from-purple-500 to-purple-600"
    },
    green: {
      bg: "from-green-50 to-emerald-50",
      border: "border-green-200",
      iconBg: "from-green-500 to-green-600"
    },
    orange: {
      bg: "from-orange-50 to-amber-50",
      border: "border-orange-200",
      iconBg: "from-orange-500 to-orange-600"
    },
    pink: {
      bg: "from-pink-50 to-rose-50",
      border: "border-pink-200",
      iconBg: "from-pink-500 to-pink-600"
    },
    red: {
      bg: "from-red-50 to-orange-50",
      border: "border-red-200",
      iconBg: "from-red-500 to-red-600"
    }
  };
  
  const colors = variants[variant];
  
  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border ${colors.border} ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <h3 className="font-bold text-xl text-gray-900">
          {title}
        </h3>
      </div>
      <p className="font-normal text-[15px] text-gray-700 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
