/**
 * Mock data untuk course reviews
 * Digunakan untuk development dan testing
 */

export interface Review {
  id: string;
  userName: string;
  userInitials: string;
  avatarColor: string;
  rating: number;
  date: string;
  comment: string;
}

export const mockReviews: Review[] = [
  {
    id: "1",
    userName: "John Doe",
    userInitials: "JD",
    avatarColor: "from-purple-500 to-purple-600",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Excellent course! The instructor explains complex concepts in a very understandable way. The hands-on projects really helped me apply what I learned. Highly recommended for anyone looking to get into UI/UX design.",
  },
  {
    id: "2",
    userName: "Sarah Miller",
    userInitials: "SM",
    avatarColor: "from-green-500 to-green-600",
    rating: 4,
    date: "1 month ago",
    comment:
      "Great content and well-structured curriculum. The course covers all the essential topics. Would have loved more advanced case studies, but overall a solid foundation for beginners.",
  },
  {
    id: "3",
    userName: "Michael Kim",
    userInitials: "MK",
    avatarColor: "from-orange-500 to-orange-600",
    rating: 5,
    date: "1 month ago",
    comment:
      "This course exceeded my expectations! Dr. Sarah Johnson is an amazing instructor. The practical exercises and real-world examples made learning enjoyable and effective. Worth every penny!",
  },
];
