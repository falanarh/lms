import React from 'react';

/**
 * Tipe untuk variant icon
 * - filled: Icon dengan background solid dan icon putih
 * - outline: Icon dengan border outline dan icon berwarna
 */
type IconVariant = 'filled' | 'outline';

/**
 * Tipe untuk ukuran icon
 * - small: 32x32px container, 16x16px icon
 * - medium: 40x40px container, 20x20px icon (default)
 * - large: 48x48px container, 24x24px icon
 */
type IconSize = 'small' | 'medium' | 'large';

/**
 * Props untuk komponen CustomIcon
 */
interface CustomIconProps {
  variant?: IconVariant;           // Variant style (default: 'outline')
  size?: IconSize;                 // Ukuran icon (default: 'medium')
  color?: string;                  // Warna primary (default: '#615fff')
  className?: string;              // Custom className tambahan
  paths: {                         // Path data untuk SVG
    path1: string;
    path2?: string;                // Path kedua opsional
  };
  strokeWidth?: number;            // Ketebalan stroke untuk icon
}

/**
 * Mapping ukuran container (div wrapper)
 */
const containerSizeMap: Record<IconSize, number> = {
  small: 32,
  medium: 40,
  large: 48,
};

/**
 * Mapping ukuran icon (svg)
 * Disesuaikan agar proporsional dengan viewBox standar 20x20
 */
const iconSizeMap: Record<IconSize, number> = {
  small: 16,
  medium: 20,
  large: 24,
};

/**
 * Mapping viewBox untuk masing-masing ukuran
 * Tetap menggunakan viewBox 20x20 agar path tidak terpotong
 */
const viewBoxSize = 20;

/**
 * Mapping ukuran ke stroke width yang proporsional
 */
const strokeWidthMap: Record<IconSize, number> = {
  small: 1.5,
  medium: 1.66667,
  large: 2,
};

/**
 * Komponen CustomIcon
 * 
 * Komponen icon dengan wrapper yang dapat di-style:
 * - Variant "filled": Background berwarna dengan icon putih
 * - Variant "outline": Border berwarna dengan icon berwarna
 * - 3 ukuran berbeda (small, medium, large)
 * - Container dan icon proporsional
 * 
 * @example
 * ```tsx
 * // Filled variant - background berwarna, icon putih
 * <CustomIcon
 *   variant="filled"
 *   size="medium"
 *   color="#615fff"
 *   paths={{
 *     path1: "M10 2.5L15 7.5L10 12.5",
 *     path2: "M5 7.5H15"
 *   }}
 * />
 * 
 * // Outline variant - border berwarna, icon berwarna
 * <CustomIcon
 *   variant="outline"
 *   size="large"
 *   color="#10b981"
 *   paths={{
 *     path1: "M10 2.5L15 7.5L10 12.5",
 *   }}
 * />
 * ```
 */
export const CustomIcon: React.FC<CustomIconProps> = ({
  variant = 'outline',
  size = 'medium',
  color = '#615fff',
  className = '',
  paths,
  strokeWidth,
}) => {
  // Dapatkan ukuran dalam pixel
  const containerSize = containerSizeMap[size];
  const iconSize = iconSizeMap[size];
  
  // Dapatkan stroke width default berdasarkan ukuran, atau gunakan custom
  const defaultStrokeWidth = strokeWidthMap[size];
  const finalStrokeWidth = strokeWidth ?? defaultStrokeWidth;

  // Style untuk container berdasarkan variant
  const containerStyle: React.CSSProperties = {
    width: containerSize,
    height: containerSize,
    ...(variant === 'filled' ? {
      // Filled: background berwarna
      backgroundColor: color,
    } : {
      // Outline: border berwarna, background transparan
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: color,
      backgroundColor: 'transparent',
    }),
  };

  // Warna icon berdasarkan variant
  const iconColor = variant === 'filled' ? '#ffffff' : color;

  return (
    <div 
      className={`relative shrink-0 rounded-lg flex items-center justify-center ${className}`}
      style={containerStyle}
      data-name="IconContainer"
    >
      <svg 
        className="block" 
        width={iconSize}
        height={iconSize}
        fill="none" 
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      >
        <g id="Icon">
          {/* Path pertama - wajib */}
          <path
            d={paths.path1}
            id="Vector"
            fill="none"
            stroke={iconColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={finalStrokeWidth}
          />
          
          {/* Path kedua - opsional */}
          {paths.path2 && (
            <path
              d={paths.path2}
              id="Vector_2"
              fill="none"
              stroke={iconColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={finalStrokeWidth}
            />
          )}
        </g>
      </svg>
    </div>
  );
};