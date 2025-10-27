# Refactor Prompt Template

## Judul
**Refactor {{ComponentName}} ke Standar Proyek (Next.js + TS + Tailwind Tokens)**

---

## Konstanta Proyek
- **Stack:** Next.js (App Router), TypeScript, React 18+
- **Styling:** **HANYA** Tailwind + CSS variables dari `tokens.css` untuk semua token (warna, spacing, radius, font, shadow, dsb.)
- **Aksesibilitas:** Semua elemen interaktif **wajib** punya `focus-visible` ring jelas dan bisa dioperasikan via keyboard
- **Struktur:** Gunakan elemen semantik (`nav`, `ul`, `li`, `a`, `button`), props + interface TypeScript didefinisikan di file komponen

---

## Tujuan Refactor
- Bersihkan kode `{{ComponentName}}` dari export Figma / implementasi awal
- Ganti semua style hardcoded → **CSS variables**
- Perbaiki struktur semantik dan aksesibilitas
- Tambahkan varian/state yang diperlukan

---

## Spesifikasi Komponen
- **Nama Komponen:** `{{ComponentName}}`
- **Deskripsi singkat peran/tujuan:** `{{DeskripsiSingkat}}`
- **Direktori target:** `src/components/{{ComponentName}}`
- **Ketergantungan ikon:** `{{InlineSVG | library | none}}`

---

## API (Props & State)

**Props yang diharapkan:**
```ts
interface {{ComponentName}}Props { {{daftarPropsSemantik}} }
```

**Contoh:**
```ts
size?: "sm" | "md" | "lg"
variant?: "solid" | "outline" | "ghost"
disabled?: boolean
isLoading?: boolean
className?: string
onChange? / onClick? / onSelect?: (args) => void
```

- **State internal yang diizinkan:** `{{daftarStateInternal atau none}}`
- **Controlled vs Uncontrolled:** `{{jelas controlled/uncontrolled}}`

---

## Aturan Styling (Tokens)
- **Warna:** `text-[var(--color-foreground)]`, `text-[var(--color-foreground-muted)]`, `bg-[var(--surface)]`, `bg-[var(--surface-elevated)]`
- **Brand:** `text/bg-[var(--color-primary)]` dan `bg-[var(--color-primary-50)]` (subtle)
- **Focus:** `focus-visible:ring-2` `focus-visible:ring-[var(--color-focus-ring)]` `focus-visible:ring-offset-2`
- **Border:** `border-[var(--border)]`
- **Radius:** `rounded-[var(--radius-sm|md|lg)]`
- **Font:** `text-[var(--font-sm|md|lg)]`, `font-[var(--font-body|var(--font-body-bold))]`
- **Larangan:** Jangan gunakan warna Tailwind default (mis. `gray-500`, `blue-50`, dsb.) **kecuali** melalui fallback aman di `var()`

---

## Perilaku & Aksesibilitas
- **Keyboard:** Tab/Enter/Space bekerja sesuai semantik
- **ARIA:** tambahkan atribut yang relevan (`aria-label` / `aria-current` / `aria-invalid` / `aria-busy` / `aria-describedby`)
- **Hit target interaktif:** ramah (ketinggian/klik area memadai)
- **Loading/Disabled:** nonaktifkan interaksi dengan visual state jelas

---

## Varian & State Yang Diminta
- **Varian:** `{{daftarVarian}}` (mis. `solid`, `outline`, `ghost`, `soft`)
- **Ukuran:** `{{daftarUkuran}}` (mis. `sm`, `md`, `lg`)
- **State:** `default`, `hover`, `focus`, `active`, `disabled`, `loading`, `error`, `success`
- **Opsional:** `withIcon (left/right)`, `withDescription`, `withCounter`, `compact/spacious`

---

## Struktur Semantik
- **Gunakan elemen:** `{{daftarSemantik}}` (mis. `fieldset+legend` untuk group, `ul/li` untuk list, `nav` untuk navigasi)
- **Hindari** `div` berlebih saat ada elemen semantik yang tepat

---

## Output Wajib

**File 1:** `src/components/{{ComponentName}}/{{ComponentName}}.tsx`
- Komponen lengkap + interface props di file yang sama
- Tanpa style hardcoded; semua via Tailwind + `var()`

**File 2:** `src/components/{{ComponentName}}/index.ts`
```ts
export * from './{{ComponentName}}';
export { default } from './{{ComponentName}}';
```

**File 3:** `src/components/{{ComponentName}}/{{ComponentName}}.preview.tsx`
- Tampilkan seluruh varian + state (`default`, `hover`, `focus`, `active`, `disabled`, `loading`, `error`)
- Gunakan inline icon bila perlu (**hindari** menambah paket)

**Registrasi preview**
- Lokasi: `src/preview/registry.tsx`
- `slug: "{{kebab-case-component}}", title: "{{ComponentName}}"`

---

## Contoh Re-mapping Style
```diff
- bg-blue-50
+ bg-[var(--color-primary-50)]

- text-gray-500
+ text-[var(--color-foreground-muted)]

- rounded-[12px]
+ rounded-[var(--radius-lg)]

- text-[14px]
+ text-[var(--font-sm)]

- font-['Poppins:SemiBold']
+ font-[var(--font-body-bold)]
```

---

## Sukses Kriteria
- Tidak ada kelas Tailwind warna/radius/spacing **hardcoded**; semua melalui `var()`
- `focus-visible` ring konsisten di semua interaksi
- Props sesuai API; penamaan semantik dan reusable
- Preview mendemonstrasikan semua state/varian
- Kode idiomatik TS + React 18 (**`forwardRef` bila perlu**), tanpa error TypeScript

---

## Kustomisasi Komponen Ini
- **Kebutuhan khusus:** `{{detailKhususKomponen}}` (mis. multi-select, file preview, badge counter)
- **Data contoh untuk preview:** `{{mockData ringkas}}`

---

## Kode Asli (.tsx)
Tempelkan di bawah ini:
```tsx
{{TempelKodeAsliDiSini}}
```
