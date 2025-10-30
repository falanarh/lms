import type { Discussion } from "./Topic";

/**
 * Utility untuk membuat discussion data dengan discussionType yang tepat
 */
export function createDiscussion(data: Omit<Discussion, 'discussionType'>, existingDiscussions: Discussion[] = []): Discussion {
  const discussionType = computeDiscussionType(data, existingDiscussions);

  return {
    ...data,
    discussionType,
  };
}

/**
 * Compute discussion type berdasarkan struktur data
 * Digunakan untuk validasi atau saat perlu menghitung ulang
 */
export function computeDiscussionType(
  discussion: Omit<Discussion, 'discussionType'>,
  existingDiscussions: Discussion[] = []
): 'direct' | 'nested-first' | 'nested-second' {
  // Jika tidak replying to siapa-siapa, maka jawaban langsung ke topic
  if (!discussion.replyingToId) {
    return 'direct';
  }

  // Cari discussion yang direply oleh discussion ini
  const repliedDiscussion = existingDiscussions.find(d => d.id === discussion.replyingToId);

  if (!repliedDiscussion) {
    // Jika tidak ditemukan, anggap sebagai direct
    return 'direct';
  }

  // Jika discussion yang direply adalah jawaban langsung ke topic (direct),
  // maka ini adalah nested-first
  if (repliedDiscussion.discussionType === 'direct') {
    return 'nested-first';
  }

  // Jika discussion yang direply sudah nested (ada replyToId),
  // maka ini adalah nested-second
  return 'nested-second';
}

/**
 * Validasi discussion data untuk memastikan discussionType konsisten dengan struktur
 */
export function validateDiscussion(discussion: Discussion, existingDiscussions: Discussion[] = []): boolean {
  const expectedType = computeDiscussionType(discussion, existingDiscussions);
  return discussion.discussionType === expectedType;
}

/**
 * Batch validation untuk semua discussions
 */
export function validateAllDiscussions(discussions: Discussion[]): {
  isValid: boolean;
  invalidDiscussions: Array<{ discussion: Discussion; expectedType: string; actualType: string }>;
} {
  const invalidDiscussions: Array<{ discussion: Discussion; expectedType: string; actualType: string }> = [];

  for (const discussion of discussions) {
    const otherDiscussions = discussions.filter(d => d.id !== discussion.id);
    const expectedType = computeDiscussionType(discussion, otherDiscussions);

    if (discussion.discussionType !== expectedType) {
      invalidDiscussions.push({
        discussion,
        expectedType,
        actualType: discussion.discussionType,
      });
    }
  }

  return {
    isValid: invalidDiscussions.length === 0,
    invalidDiscussions,
  };
}