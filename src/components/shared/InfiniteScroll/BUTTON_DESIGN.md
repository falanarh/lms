# LoadMoreButton Design System

## Overview

Modern, minimalis button design untuk infinite scroll functionality yang terintegrasi sempurna dengan design system aplikasi.

## 🎨 Design Philosophy

### Principles
- **Minimalis**: Fokus pada fungsionalitas tanpa visual clutter
- **Modern**: Menggunakan design patterns terkini (rounded, subtle shadows, smooth transitions)
- **Integrated**: Color scheme yang konsisten dengan aplikasi
- **Responsive**: Optimal di semua device sizes
- **Accessible**: Proper focus states dan screen reader support

## 📏 Size Variants

### Small (sm)
- **Use Case**: Compact spaces, nested content
- **Dimensions**: `px-4 py-2` (16px horizontal, 8px vertical)
- **Text Size**: `text-xs` (12px)
- **Icon Size**: `w-3.5 h-3.5`
- **Usage**: InfiniteDiscussions (replies)

```tsx
<LoadMoreButton size="sm" variant="secondary">
  Lihat balasan lainnya
</LoadMoreButton>
```

### Medium (md) - Default
- **Use Case**: Standard buttons, primary actions
- **Dimensions**: `px-6 py-2.5` (24px horizontal, 10px vertical)
- **Text Size**: `text-sm` (14px)
- **Icon Size**: `w-3.5 h-3.5`
- **Usage**: InfiniteTopics (main topics)

```tsx
<LoadMoreButton size="md" variant="primary">
  Muat lebih banyak topik
</LoadMoreButton>
```

### Large (lg)
- **Use Case**: Hero sections, prominent CTAs
- **Dimensions**: `px-8 py-3` (32px horizontal, 12px vertical)
- **Text Size**: `text-sm` (14px)
- **Icon Size**: `w-3.5 h-3.5`

## 🎨 Color Variants

### Primary Variant
**Use Case**: Main actions, primary CTAs
**Color Scheme**: Brand primary colors

```css
.bg-[var(--color-primary,#2563eb)]
text-white
hover:bg-[var(--color-primary-600,#1d4ed8)]
focus:ring-[var(--color-primary-50,rgba(37,99,235,0.1))]
shadow-sm hover:shadow-md
```

### Secondary Variant
**Use Case**: Secondary actions, less prominent CTAs
**Color Scheme**: Subtle with primary accent

```css
bg-white
text-[var(--color-primary,#2563eb)]
border-[var(--color-primary-200,rgba(37,99,235,0.2))]
hover:bg-[var(--color-primary-50,rgba(37,99,235,0.04))]
hover:border-[var(--color-primary-300,rgba(37,99,235,0.3))]
```

### Minimal Variant
**Use Case**: Content-adjacent actions, inline actions
**Color Scheme**: Text-only with hover effects

```css
text-[var(--color-primary,#2563eb)]
hover:text-[var(--color-primary-600,#1d4ed8)]
hover:bg-[var(--color-primary-50,rgba(37,99,235,0.04))]
p-0 shadow-none border-none bg-transparent
```

## 🔄 State Management

### Loading State
```tsx
{loading ? (
  <>
    <Loader2 className="w-3.5 h-3.5 animate-spin" />
    <span className="ml-2">Memuat...</span>
  </>
) : (
  // Normal state
)}
```

### Disabled State
```css
opacity-50 cursor-not-allowed
pointer-events: none
```

### End State
```tsx
{!hasMore && !loading && (
  <p className="text-xs text-[var(--color-foreground-muted)] tracking-wide uppercase font-medium">
    Akhir dari daftar
  </p>
)}
```

## ✨ Micro-interactions

### Hover Effects
- **Icon Animation**: `translate-y-0.5` (subtle downward movement)
- **Color Transition**: Smooth color changes (200ms duration)
- **Shadow Enhancement**: `shadow-sm` → `shadow-md`
- **Scale**: Subtle scale untuk primary variant

### Focus States
```css
focus:ring-2
focus:ring-[var(--color-primary-50,rgba(37,99,235,0.1))]
focus:ring-offset-2
```

### Loading Animation
```css
animate-spin
duration-300 untuk smooth transitions
```

## 🎯 Usage Patterns

### 1. Topics Level (Primary Action)
```tsx
<LoadMoreButton
  size="md"
  variant="primary"
  children="Muat lebih banyak topik"
/>
```

### 2. Discussions Level (Minimal Action)
```tsx
<LoadMoreButton
  size="sm"
  variant="minimal"
  align="left"
  children="Lihat balasan lainnya"
/>
```

### 3. Compact Variant
```tsx
<CompactLoadMoreButton
  onLoadMore={handleLoadMore}
  loading={loading}
  hasMore={hasMore}
/>
```

## 📱 Responsive Design

### Mobile (< 768px)
- **Touch Targets**: Minimum 44px untuk accessibility
- **Spacing**: Adequate spacing untuk prevent misclicks
- **Text**: Clear readable fonts

### Desktop (≥ 768px)
- **Hover States**: Enhanced visual feedback
- **Keyboard Navigation**: Proper tab order
- **Focus Indicators**: Clear visual focus rings

## ♿ Accessibility Features

### ARIA Labels
```tsx
aria-label={loading ? 'Memuat lebih banyak' : children}
aria-hidden="true" // untuk decorative icons
```

### Keyboard Navigation
- **Tab Order**: Logical navigation sequence
- **Focus Management**: Clear focus indicators
- **Enter/Space**: Proper keyboard activation

### Screen Reader Support
- **Loading Announcements**: State changes announced
- **Button Purpose**: Clear action descriptions
- **End State**: Clear completion messages

## 🎨 Customization Examples

### Custom Styling
```tsx
<LoadMoreButton
  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0"
  children="Load More"
/>
```

### Custom Text
```tsx
<LoadMoreButton
  children="Tampilkan lagi 3 topik"
  loadingChildren="Mengambil data..."
/>
```

### Custom End State
```tsx
<LoadMoreButton
  endMessage="Semua konten telah dimuat"
  showEndIcon={false}
/>
```

## 📐 Design Specifications

### Border Radius
- **Button**: `rounded-full` (fully rounded)
- **Consistent**: Matches design system guidelines

### Typography
- **Font Weight**: `font-medium` (500)
- **Letter Spacing**: Normal, dengan `tracking-wide` untuk end state
- **Text Transform**: Uppercase untuk end state only

### Spacing
- **Icon-Text Gap**: `ml-1.5` (12px)
- **Loading Gap**: `ml-2` (16px)
- **Container Padding**: `py-8` (32px)

### Shadows
- **Default**: `shadow-sm` (subtle elevation)
- **Hover**: `shadow-md` (enhanced elevation)
- **Consistent**: Matches design system elevation scale

## 🚀 Performance Considerations

### CSS Optimization
- **CSS Variables**: Using custom properties for theming
- **Transitions**: Hardware-accelerated transforms
- **Minimal Reflows**: Using transform instead of layout changes

### Bundle Size
- **Tree Shaking**: Only used components imported
- **Icon Optimization**: Using Lucide React icons (small bundle)
- **CSS Purge**: Unused styles removed in production

## 📋 Best Practices

### ✅ DO:
- Use consistent variants across similar contexts
- Implement proper loading states
- Provide clear end states
- Follow mobile-first responsive design
- Maintain accessibility standards

### ❌ DON'T:
- Override CSS variables unless necessary
- Use fixed pixel values for spacing
- Ignore loading states
- Forget keyboard navigation
- Create multiple inconsistent variants

---

**Version**: 2.0.0 (Modern Redesign)
**Last Updated**: 2025
**Design System**: Integrated with application theme