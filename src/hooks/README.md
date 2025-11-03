# Custom Hooks

## Overview

Collection of custom hooks untuk aplikasi forum dengan clean architecture dan maintainability sebagai prioritas utama.

## 🎯 Available Hooks

### 1. `usePost` Hook
**Purpose**: Mengelola data posts/blog

**Usage**:
```typescript
import { usePost } from '@/hooks/usePost';

const { posts, isLoading, error, refetch } = usePost();
```

### 2. `useForum` Hook
**Purpose**: Mengelola data forum

**Usage**:
```typescript
import { useForum } from '@/hooks/useForum';

const { forums, isLoading, error, refetch } = useForum();
```

### 3. `useTopic` Hook
**Purpose**: Mengelola data topics dan actions (create, vote, edit, delete)

**Features**:
- ✅ Topic data fetching
- ✅ Create new topic
- ✅ Voting functionality
- ✅ Edit dan delete operations
- ✅ Error handling dengan retry

**Usage**:
```typescript
import { useTopic } from '@/hooks/useTopic';

const {
  data: topics,
  isLoading,
  error,
  refetch,
  createTopic,
  isCreatingTopic
} = useTopic(forumId);

// Create new topic
await createTopic({ title: 'New Topic', content: 'Content here' });
```

### 4. `useDiscussion` Hook
**Purpose**: Mengelola data discussions/replies dan actions

**Features**:
- ✅ Individual discussion fetching (by topic)
- ✅ Forum discussions fetching (all topics)
- ✅ Create, vote, edit, delete discussions
- ✅ Nested reply support
- ✅ Real-time updates

**Usage**:
```typescript
import {
  useDiscussion,
  useDiscussionForum,
  useDiscussionActions
} from '@/hooks/useDiscussion';

// Individual topic discussions
const {
  data: discussions,
  isLoading,
  error,
  hasMore,
  refetch
} = useDiscussion(topicId, forumId);

// All forum discussions
const {
  data: forumDiscussions,
  getTopicById,
  getDiscussionsByTopicId
} = useDiscussionForum(forumId);

// Discussion actions
const {
  submitReply,
  voteDiscussion,
  editDiscussion,
  deleteDiscussion,
  isSubmittingReply
} = useDiscussionActions(forumId);

// Submit reply
await submitReply({
  topicId: 'topic-123',
  text: 'Reply text',
  replyingToId: 'parent-id' // optional
});
```

## 🚀 Architecture

### Clean Code Principles
- Single responsibility per hook
- Consistent error handling
- TypeScript-first development
- React Query for data management

### Error Handling Strategy
```typescript
// Automatic retry disabled untuk service unavailability
retry: false,

// Graceful fallback to empty states
if (error.response?.status === 404) {
  return { discussions: [], hasMore: false };
}
```
## 📁 File Structure
```
src/hooks/
├── usePost.ts           # Posts/blog management
├── useForum.ts          # Forum data management
├── useTopic.ts          # Topic CRUD operations
├── useDiscussion.ts     # Discussion CRUD operations
└── README.md           # This file
```

## 🔧 Dependencies
- React Query untuk data fetching dan caching
- Axios untuk HTTP requests
- TypeScript untuk type safety

---

**Version**: 2.0.0
**Maintainer**: Development Team
**Last Updated**: 2025