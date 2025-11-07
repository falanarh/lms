# Infinite Scroll Spacing Guidelines

## Overview

Document untuk spacing dan layout improvements pada infinite scroll components.

## 📏 Spacing Specifications

### Topic-Level Spacing

#### Container Spacing
```css
/* Main container */
.space-y-8 md:space-y-12  /* 32px mobile, 48px desktop */
```

#### Individual Topic Card Spacing
```css
/* Individual topic wrapper */
.mb-6 md:mb-8 last:mb-0  /* 24px mobile, 32px desktop */
```

#### Visual Separation
```css
/* Card styling */
rounded-xl overflow-hidden
shadow-lg hover:shadow-xl
border border-gray-100 hover:border-gray-200
```

### Discussion-Level Spacing

#### Container Spacing (within Topic)
```css
/* Discussions section */
.border-t-2 border-[var(--border,rgba(0,0,0,0.08))]
```

#### Individual Discussion Spacing
```css
/* Discussion items */
.px-4 py-4 first:pt-6 last:pb-6
```

## 📱 Responsive Design

### Mobile (< 768px)
- **Topic Gap**: 32px (space-y-8)
- **Topic Margin**: 24px (mb-6)
- **Card Shadow**: Subtle dengan border
- **Font Size**: Standard mobile sizes

### Desktop (≥ 768px)
- **Topic Gap**: 48px (space-y-12)
- **Topic Margin**: 32px (mb-8)
- **Card Shadow**: Enhanced dengan hover effects
- **Font Size**: Larger desktop sizes

## 🎨 Visual Hierarchy

### 1. Topic Cards
```tsx
<div className="transition-all duration-300 transform hover:scale-[1.01] rounded-xl overflow-hidden shadow-lg hover:shadow-xl border border-gray-100 hover:border-gray-200">
  <Topic />
</div>
```

### 2. Skeleton Loading
```tsx
<div className="space-y-8 md:space-y-12">
  <div className="bg-white rounded-xl border border-gray-100 shadow-lg animate-pulse overflow-hidden">
    {/* Multi-section skeleton structure */}
  </div>
</div>
```

## 🔄 Component Interactions

### Hover Effects
- **Scale**: `hover:scale-[1.01]` (subtle zoom)
- **Shadow**: `shadow-lg hover:shadow-xl` (enhanced depth)
- **Border**: `border-gray-100 hover:border-gray-200` (interactive feedback)

### Transitions
- **Duration**: `duration-300` (smooth animations)
- **Property**: `transform, shadow, border-color` (smooth transitions)

## 📊 Layout Structure

### Hierarchy
```
Container (space-y-8 md:space-y-12)
  └── Topic Card (mb-6 md:mb-8)
      ├── Topic Header
      ├── Topic Stats (bg-gray-50)
      └── Discussions Section (border-t)
          └── Discussion Items (px-4 py-4)
```

### Z-Index Layers
1. **Topic Cards**: `shadow-lg` (z-10 equivalent)
2. **Hover States**: `shadow-xl` (z-20 equivalent)
3. **Load More Button**: Above content

## 🎯 Accessibility Considerations

### Focus Management
- **Keyboard Navigation**: Proper tab order
- **Focus Indicators**: Visible focus states
- **ARIA Labels**: Proper labeling for screen readers

### Color Contrast
- **Border Colors**: `gray-100` (light but visible)
- **Text Colors**: Follow WCAG AA standards
- **Hover States**: Enhanced contrast for feedback

## 🚀 Performance Considerations

### CSS Optimization
- **Responsive Classes**: Mobile-first approach
- **Transform-based Animations**: GPU accelerated
- **Minimal Reflows**: Using transform instead of layout changes

### Loading States
- **Skeleton Matching**: Matches final layout structure
- **Progressive Enhancement**: Content loads gracefully
- **Perceived Performance**: Skeletons improve UX

## 📋 Best Practices

### ✅ DO:
- Use consistent spacing across breakpoints
- Implement hover states for interactive elements
- Provide visual separation between topics
- Ensure mobile-first responsive design
- Match skeleton loading to final layout

### ❌ DON'T:
- Use fixed pixel values for spacing
- Overlap interactive elements
- Forget last child margin removal
- Ignore mobile spacing constraints
- Create layout shifts during loading

## 🔧 Customization Guide

### Adjusting Spacing
```tsx
// Increase spacing
<InfiniteTopics className="space-y-16" itemClassName="mb-12" />

// Decrease spacing
<InfiniteTopics className="space-y-6" itemClassName="mb-4" />
```

### Custom Card Styling
```tsx
// Enhanced cards
<div className="shadow-2xl hover:shadow-3xl border-2 border-blue-200">
  <Topic />
</div>

// Minimal cards
<div className="border border-gray-200 rounded-lg">
  <Topic />
</div>
```

---

**Version**: 1.0.0
**Last Updated**: 2025
**Maintainer**: Development Team