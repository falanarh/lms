# Knowledge Center – UI/UX & Product Specs
Version: 1.0 • Generated: 2025-11-03 08:02

> **Catatan**: Dokumen ini menggabungkan analisis, spesifikasi UI/UX, arsitektur informasi, komponen, dan prompt implementasi menjadi satu _single source of truth_. Semua referensi “HTML Editor” telah **diganti** menjadi **Rich Text Editor (RTE)**.

---

## 0) Ringkasan & Tujuan
Pusat pengetahuan (Knowledge Center) untuk Pusdiklat BPS yang memungkinkan **Learning Partner/Penyelenggara** membuat dan mengelola **Webinar** (berbasis jadwal) dan **Konten** (artikel/podcast/video/file-modul). Sistem menyediakan pencarian, filter, manajemen taksonomi, halaman detail dengan pemutar media, serta alur pembuatan konten berbasis wizard yang aman (RTE disanitasi). **Webinar** nantinya dapat dikaitkan dengan perekaman JP di **GOJAGS**.

**Outcome utama:**
- Penerbitan konten yang rapi dan aman
- Penemuan konten cepat (search + filters)
- Pengelolaan webinar (jadwal, link, notulensi, JP)
- Taksonomi terstandardisasi (Subject—nomenklatur BPS, Penyelenggara, Tag)

---

## 1) Aktor & Alur Tingkat Tinggi
- **Learning Partner / Penyelenggara** → *Create Knowledge* → **Knowledge (Webinar/Konten)** → tampil di **Knowledge Hub**.
- **Pengunjung**: jelajah (Explore), baca (Detail), berinteraksi (Like/Dislike).

---

## 2) Jenis Konten (Content Types)
1. **Webinar** — konten terjadwal, memiliki kolom spesifik, dapat dihubungkan ke JP GOJAGS.
2. **Konten** — berisi satu _primary media_ **(hanya satu)** berupa **video / PDF / audio**, plus isi konten.

**Kategori Media untuk “Konten”:**
- Article biasa
- Podcast (audio)
- Video
- File/Modul

---

## 3) Daftar Properti Lengkap (Semua field dari gambar + teknis)
### 3.1 Field Wajib (berlaku untuk Webinar & Konten)
- `title` (string, **required**)
- `description` (string, **required**)
- `subject` (lookup/enum — **nomenklatur BPS**: ekonomi, pertanian, dll., **required**)
- `knowledge_type` (enum: `webinar` | `konten`, **required**)
- `penyelenggara` (lookup — contoh: `pusdiklat`, `bps sumbar`, `bps jakarta`, …, **required**)
- `thumbnail` (url/blob, **required**; rasio 16:9)
- `author` (string/user ref, **required**)
- `like_count` (int, default=0)
- `dislike_count` (int, default=0)
- `view_count` (int, default=0)
- `tags` (string[])
- `published_at` (datetime)

### 3.2 Field Khusus **Webinar**
- `tgl_zoom` (datetime)
- `link_zoom` (url)
- `link_record` (url)
- `link_youtube` (url)
- `link_vb` (url)
- `file_notulensi_pdf` (file **PDF**, **maks 1 file**)
- `content_richtext` (HTML sanitized, **opsional**)
- `jumlah_jp` (number)
- `gojags_ref` (string, opsional; id/tautan referensi perekaman JP **GOJAGS**)
- **Catatan**: *Khusus webinar akan dikaitkan dengan perekaman JP di GOJAGS.*

### 3.3 Field Khusus **Konten**
- `media_resource` (**single** file/url, **maks 1**; tipe: `video | pdf | audio`)
- `content_richtext` (HTML sanitized)

---

## 4) Kebijakan **Rich Text Editor (RTE)**
Menggantikan “HTML Editor” pada gambar.
- **Whitelist tags**: `p, h1, h2, h3, h4, strong, em, ul, ol, li, a, blockquote, code, pre, table, thead, tbody, tr, th, td` (+ `img` opsional apabila diizinkan).
- **Atribut diizinkan**:  
  - Link: `href`, `target`, `rel` (paksa `rel="noopener noreferrer"`; izinkan `target="_blank"`).  
  - Gambar: `src`, `alt` (jika `img` diizinkan).
- **Strip / blokir**: `<script>`, `iframe`, inline event `on*`, `style` berbahaya, protokol non-aman.
- **Waktu sanitasi**: saat input (client) **dan** sebelum simpan (server).
- **Output**: HTML aman yang di-escape bila diperlukan saat render.
- **Toolbar minimal**: H1–H3, Bold/Italic, Bulleted/Numbered List, Link, Quote, Code, Table, Undo/Redo.

---

## 5) Arsitektur Informasi (Sitemap)
1. **Home / Knowledge Hub**
2. **Explore / Browse**
3. **Detail Knowledge**
4. **Create Knowledge (Wizard)**
5. **Manage Knowledge (Admin/LP)**
6. **Taxonomy Manager**
7. **Webinar Schedule**
8. **Analytics (Ringan)**
9. **Settings**

---

## 6) Halaman & Isi
### 6.1 Home / Knowledge Hub
- **Header**: global search (“Cari knowledge, subject, tag…”), tombol **Create**.
- **Quick Filters** (chips): All, Webinar, Article, Podcast, Video, Files/Modules.
- **Featured Section** (hero card).
- **Latest Grid**: 4 kolom (≥1280px), 3 (≥1024), 2 (≥768), 1 (mobile).
- **Upcoming Webinars**: list ringkas tanggal/jam + CTA “Join Zoom”.

### 6.2 Explore / Browse
- **Sidebar Filters**: Subject (nomenklatur BPS), Penyelenggara, Type (`webinar`/`konten`), Media (`video|pdf|audio`), Tag.
- **Sort**: Newest, Most Liked, Most Viewed, Upcoming Webinar.
- **List/Grid**: gunakan **Card Knowledge** (lihat Komponen).

### 6.3 Detail Knowledge
- **Hero**: Thumbnail 16:9, Title, Subject chip, Penyelenggara, Author, Published_at, Tags, Like/Dislike.
- **Primary Media**:
  - **Webinar**: banner status (*Upcoming*/*Ended*), `tgl_zoom`; tombol **Join Zoom** (pakai `link_zoom`); link sekunder `link_youtube`, `link_record`, `link_vb`; panel **Notulensi PDF** bila ada; field **Jumlah JP**; badge “GOJAGS linked” jika `gojags_ref` terisi.
  - **Konten**: viewer sesuai `media_resource` (video/audio/PDF).  
- **Content**: blok **Rich Text** (hasil RTE).  
- **Related**: 4 kartu terkait (berdasarkan Subject/Tag).

### 6.4 Create Knowledge (Wizard 4 Langkah)
- **Step 1 – Type**: segmented control (`Webinar` | `Konten`).
- **Step 2 – Umum (wajib)**: `title`, `description`, `subject`, `penyelenggara`, `knowledge_type` (auto), `thumbnail`, `author`, `tags`, `published_at`.
- **Step 3A – Webinar**: `tgl_zoom`, `link_zoom`, `link_record`, `link_youtube`, `link_vb`, `file_notulensi_pdf` (PDF *single*), `content_richtext` (opsional), `jumlah_jp`.
- **Step 3B – Konten**: `media_resource` (single: video/PDF/audio), `content_richtext`.
- **Step 4 – Review & Publish**: ringkasan + preview; aksi `Save Draft`, `Publish`, `Schedule`.

### 6.5 Manage Knowledge (Admin/LP)
- **Tabel** kolom: Title, Type, Subject, Penyelenggara, Author, Likes, Published_at, Actions (Edit/Preview/Unpublish/Delete).
- **Bulk Actions**: publish/unpublish, delete, assign tag.
- **Quick Edit**: ubah subject, tags langsung di tabel.
- **Filter Bar** di atas tabel.

### 6.6 Taxonomy Manager
- CRUD untuk: **Subject** (nomenklatur BPS), **Penyelenggara**, **Tag**.
- Import CSV + validasi duplikasi.

### 6.7 Webinar Schedule
- **Kalender** + list upcoming/past.
- Aksi cepat: copy `link_zoom`, upload `file_notulensi_pdf`, input `jumlah_jp`, set `gojags_ref`.

### 6.8 Settings
- Kebijakan **RTE** (whitelist/blacklist).
- Batas ukuran media & tipe file.
- Ukuran minimal thumbnail, rasio default.

---

## 7) Komponen UI (Modern & A11y)
- **Card Knowledge** (varian: webinar/article/podcast/video/file)  
  Elemen: badge `knowledge_type` + media type, thumbnail 16:9, title clamp 2 baris, subject chip, penyelenggara, published_at, mini like/dislike, author avatar, tag chips; untuk webinar upcoming tampilkan tanggal (`tgl_zoom`) + tombol mini “Join Zoom”.
- **Rich Text Editor (RTE)**: toolbar minimal (H1–H3, Bold/Italic, List, Link, Quote, Code, Table, Undo/Redo), sanitasi ganda (gunakan MANTINE UI RICH TEXT EDITOR).
- **Media Picker (single)**: drag & drop, progress, validasi tipe (`video|pdf|audio`), preview.
- **PDF Viewer**: untuk notulensi.
- **Like/Dislike Widget**: ikon + counter + state.
- **Filters**: chips + drawer/checkbox multi-select.
- **Inputs**: DateTime Picker, URL Input (validasi), Select searchable (Subject/Penyelenggara), Tag input (chips).
- **Feedback**: Toasts, inline errors, skeleton loaders, empty states.

---

## 8) Validasi & Aturan
- Field **wajib** pada bagian 3.1 harus terisi sebelum publish.
- `file_notulensi_pdf` → hanya **PDF**, **maks 1 file**.
- `media_resource` → **hanya 1** dan tipe `video|pdf|audio`.
- Semua link → harus URL http(s) valid.
- `tgl_zoom` ≥ now (untuk status upcoming).
- `published_at` boleh kosong untuk draft.

---

## 9) Desain Visual
- **Gaya**: modern, minimal, profesional; grid 12 kolom; radius 20; shadow lembut; spacing 8/12/16.
- **Theme**: light/dark; aksen institusional (seperti desain yang sudah diimplementasikan).
- **Tipografi**: sans-serif humanist; ukuran responsif.
- **Ikon**: Lucide/Feather konsisten.
- **Interaksi**: micro-animations (hover, focus), transition halus <=200ms.

---

## 10) Aksesibilitas
- Focus-visible ring jelas.
- Kontras minimal **WCAG AA**.
- Navigasi keyboard penuh untuk semua interaksi.
- Alt text untuk thumbnail; captions/transkrip untuk audio/video (bila tersedia).

---

## 11) Non-Fungsional (Ringkas)
- Kinerja: lazy-load media & pagination/infinite scroll.
- Keamanan: sanitasi RTE di client & server; validasi mime-type file.
- Observabilitas: event hook publish/upload untuk analytics.
- i18n (opsional): label & pesan dapat dilokalisasi.

---

## 12) Prompt Implementasi (untuk Figma AI / Builder UI)
**Instruksi singkat**:  
“Bangun Knowledge Center modern & estetik sesuai spesifikasi di dokumen ini: halaman Home, Explore, Detail, Create Wizard (4 langkah), Manage, Taxonomy Manager, Webinar Schedule, Analytics, Settings; komponen Card Knowledge, RTE tersanitasi, Media Picker single, PDF Viewer, Like/Dislike, Filters. Terapkan grid 12 kolom, radius 20, shadow lembut, spacing 8/12/16, mode light/dark, ikon Lucide, fokus aksesibilitas. Validasi dan batasan file sesuai Bagian 8.”

---

## 13) Lampiran – Skema Ringkas (Pseudo-Types)
```ts
type KnowledgeCommon = {
  title: string;
  description: string;
  subject: string; // nomenklatur BPS
  knowledge_type: "webinar" | "konten";
  penyelenggara: string; // pusdiklat, bps sumbar, bps jakarta, ...
  thumbnail: string; // url/blob
  author: string; // user ref
  like_count: number;
  dislike_count: number;
  view_count: number;
  tags: string[];
  published_at?: string; // ISO datetime
};

type Webinar = KnowledgeCommon & {
  tgl_zoom?: string;
  link_zoom?: string;
  link_record?: string;
  link_youtube?: string;
  link_vb?: string;
  file_notulensi_pdf?: string; // URL to single PDF
  content_richtext?: string; // sanitized HTML
  jumlah_jp?: number;
  gojags_ref?: string;
};

type Konten = KnowledgeCommon & {
  media_resource?: string; // single: video|pdf|audio
  content_richtext?: string; // sanitized HTML
};
```
