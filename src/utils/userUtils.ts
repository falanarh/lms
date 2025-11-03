/**
 * User related utilities
 */

// Helper function to get current user ID
// TODO: Replace with actual authentication context
export const getCurrentUserId = (): string => {
  return "b157852b-82ff-40ed-abf8-2f8fe26377aa";
};

// Helper to get initials from name
export const getInitials = (name: string): string => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Generate author name from user ID
export const generateAuthorName = (userId: string): string => {
  return `User ${userId.slice(-6)}`;
};