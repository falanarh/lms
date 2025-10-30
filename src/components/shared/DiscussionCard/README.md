# DiscussionCard - Stored Property Architecture

## 📋 Overview

DiscussionCard system menggunakan **stored property approach** untuk mengelola tipe discussion. Ini memberikan performance yang lebih baik dan data consistency yang lebih baik dibandingkan computed approach.

**Components**:
- **Topic**: Menampilkan pertanyaan utama beserta daftar jawaban
- **Discussion**: Component individual untuk setiap jawaban dengan dukungan 3 tipe nested

## 📊 Interface

```typescript
interface Discussion {
  id: string;
  avatar?: string;
  author: string;
  time: string;
  content: string;
  upvotedBy: string[];
  downvotedBy: string[];
  replyingToId?: string;
  replyingToAuthor?: string;
  discussionType: 'direct' | 'nested-first' | 'nested-second'; // ← Stored property
}
```

## 🚀 Usage Examples

### Creating New Discussion

```typescript
import { createDiscussion } from './utils';

// Direct discussion (jawaban ke topic)
const directDiscussion = createDiscussion({
  id: "d1",
  author: "John Doe",
  content: "Ini jawaban langsung ke topic",
  upvotedBy: [],
  downvotedBy: [],
});

// Nested discussion
const nestedDiscussion = createDiscussion({
  id: "d2",
  author: "Jane Smith",
  content: "Ini reply ke discussion d1",
  replyingToId: "d1",
  replyingToAuthor: "John Doe",
  upvotedBy: [],
  downvotedBy: [],
}, [directDiscussion]); // Pass existing discussions
```

### Using in Components

```typescript
import Topic, { type TopicMeta, type Discussion } from "@/components/shared/DiscussionCard";

const topicMeta: TopicMeta = {
  id: "1",
  title: "Bagaimana cara implementasi authentication di Next.js?",
  questionDetail: "Saya sedang belajar...",
  startedBy: "Ahmad Rizki",
  startedAgo: "2 hari lalu",
  repliesCount: 12,
  lastReplyAgo: "1 jam lalu"
};

const discussions: Discussion[] = [
  {
    id: "d1",
    author: "John Doe",
    time: "2 jam lalu",
    content: "Saya juga mengalami hal yang sama...",
    upvotedBy: ["user1"],
    downvotedBy: [],
    discussionType: "direct" // ← Stored property
  },
  {
    id: "d2",
    author: "Jane Smith",
    time: "1 jam lalu",
    content: "Coba cek versi Node.js...",
    upvotedBy: [],
    downvotedBy: [],
    replyingToId: "d1",
    replyingToAuthor: "John Doe",
    discussionType: "nested-first" // ← Stored property
  }
];

<Topic
  meta={topicMeta}
  discussions={discussions}
  currentUserId="user123"
  onSubmitReply={handleSubmitReply}
/>
```

### Validation

```typescript
import { validateDiscussion, validateAllDiscussions } from './utils';

// Validate single discussion
const isValid = validateDiscussion(discussion, allDiscussions);

// Validate all discussions
const validation = validateAllDiscussions(allDiscussions);
if (!validation.isValid) {
  console.error("Invalid discussions:", validation.invalidDiscussions);
}
```

## 📈 Data Flow

```
1. Client/Server creates discussion data
   ↓
2. computeDiscussionType() determines correct type
   ↓
3. discussionType stored in data
   ↓
4. Frontend uses stored discussionType directly (O(1) access)
   ↓
5. Optional validation ensures consistency
```

## 🎯 Components

```
src/components/shared/DiscussionCard/
├── Topic.tsx              # Main component: Topic + Discussion (nested)
├── TopicCard.tsx          # Deprecated (merged into Topic.tsx)
├── DiscussionList.tsx     # Deprecated (merged into Topic.tsx)
├── icons.tsx              # Deprecated (merged into Topic.tsx)
├── DiscussionCard.tsx     # Legacy wrapper (deprecated)
└── README.md              # Documentation ini
```

## 🎯 Components

### 1. Topic (Main Component)
**Purpose**: Menampilkan pertanyaan/topik utama DAN daftar jawaban

**Features**:
- ✅ Header dengan pertanyaan utama (avatar, title, metadata)
- ✅ Daftar jawaban/replies yang terintegrasi
- ✅ Voting system untuk setiap jawaban
- ✅ Reply functionality dengan @mentions
- ✅ View more/less untuk jawaban yang banyak
- ✅ Reply form di bagian bawah
- ✅ State management terintegrasi

**Props**:
```typescript
interface TopicProps {
  meta: TopicMeta;           // Metadata pertanyaan utama
  discussions: Discussion[]; // Daftar jawaban
  currentUserId?: string;    // User ID yang sedang login
  defaultShowAll?: boolean; // Tampilkan semua jawaban secara default
  onSubmitReply?: (payload) => void;
  onUpvoteReply?: (replyId: string) => void;
  onDownvoteReply?: (replyId: string) => void;
  className?: string;
}
```

### 2. Discussion (Nested Component)
**Purpose**: Component individual untuk setiap jawaban (dipanggil dari Topic)

**Features**:
- ✅ Avatar dan author info
- ✅ Voting buttons (upvote/downvote)
- ✅ Reply button
- ✅ @mention support untuk nested replies
- ✅ Timestamp dan metadata

## 🚀 Usage Examples

### Direct Usage (Recommended)
```typescript
import Topic, { type TopicMeta, type Discussion } from "@/components/shared/DiscussionCard";

const topicMeta: TopicMeta = {
  id: "1",
  title: "Bagaimana cara implementasi authentication di Next.js?",
  questionDetail: "Saya sedang belajar...",
  startedBy: "Ahmad Rizki",
  startedAgo: "2 hari lalu",
  repliesCount: 12,
  lastReplyAgo: "1 jam lalu"
};

const discussions: Discussion[] = [
  {
    id: "d1",
    author: "John Doe",
    time: "2 jam lalu",
    content: "Saya juga mengalami hal yang sama...",
    upvotedBy: ["user1"],
    downvotedBy: []
  }
];

<Topic
  meta={topicMeta}
  discussions={discussions}
  currentUserId="user123"
  onSubmitReply={handleSubmitReply}
/>
```

### Alternative Import (Default Export)
```typescript
import Topic from "@/components/shared/DiscussionCard/Topic";

<Topic
  meta={topicMeta}
  discussions={discussions}
  currentUserId="user123"
/>
```

## 🎨 Key Design Principles

### 1. **Simplicity**
- Hanya dua komponen: Topic & Discussion
- Topic berisi semuanya (pertanyaan + jawaban)
- Discussion adalah child component dari Topic

### 2. **Cohesion**
- Semua functionality terkait topic dalam satu component
- State management terpusat dalam Topic
- Discussion hanya负责 rendering individual reply

### 3. **Direct Import**
- Tidak perlu facade atau wrapper components
- Import langsung Topic component
- Simpler dan lebih explicit

## ♿ Accessibility

- Semantic HTML5 structure
- Proper ARIA labels dan roles
- Keyboard navigation support
- Screen reader compatibility

## 🔧 Technical Quality

### Type Safety
- Strong TypeScript interfaces
- Generic types untuk reusability
- Type guards dan error handling

### Performance
- Efficient state management
- Optimized re-renders
- Memoization untuk complex operations

### Code Quality
- Single responsibility principle
- Clear separation of concerns
- Comprehensive documentation

## 📱 Migration dari Sebelumnya

### Lama (Multi-Component):
```typescript
// Before: Multiple components
<TopicCard meta={topicMeta} />
<DiscussionList discussions={discussions} />
```

### Baru (Simplified):
```typescript
// After: Single component
<Topic meta={topicMeta} discussions={discussions} />
// atau tetap dengan facade:
<DiscussionCard meta={topicMeta} discussions={discussions} />
```

## 🎯 Best Practices

### ✅ DO:
- Gunakan `createDiscussion()` utility untuk membuat discussion baru
- Validasi data dengan `validateAllDiscussions()` di development
- Store discussionType di database
- Include discussionType di API response

### ❌ DON'T:
- Hardcode discussionType tanpa validasi
- Compute discussionType di frontend (performance impact)
- Lupa update discussionType saat mengubah struktur reply

## 🚀 Performance Benefits

- **O(1) access**: Tidak perlu compute discussionType setiap render
- **Database friendly**: Bisa di-index dan di-query
- **Cacheable**: Type tidak berubah unless structure berubah
- **API clarity**: Response data sudah lengkap dengan type

## 🔄 Migration Notes

Jika migrasi dari computed approach:

1. Update database schema untuk menambah `discussionType` column
2. Run batch script untuk compute dan update semua existing records
3. Update API untuk include discussionType
4. Update frontend untuk menggunakan stored property
5. Add validation untuk prevent future inconsistencies

## ✅ Benefits

1. **🚀 Performance**: O(1) access vs O(n) computation
2. **🗄️ Database Friendly**: Bisa di-index dan di-query
3. **🔍 Analytics**: Mudah query berdasarkan discussion type
4. **📡 API Clarity**: Response data sudah lengkap dengan type
5. **🛡️ Data Integrity**: Validation memastikan consistency
6. **♿ Accessible**: Full accessibility support
7. **📱 Responsive**: Mobile-first design
8. **🔄 Type Safe**: Strong TypeScript typing

---

**Version**: 4.0.0 (Stored Property Architecture)
**Maintainer**: Development Team
**Last Updated**: 2025