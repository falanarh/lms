"use client"

import { CourseCard } from "@/features/course/components/CourseCard";
import { CourseInfoCard, CourseInfoGrid } from "@/features/course/components/CourseInfoDetailCard";
import Image from "next/image";
import { useState } from "react";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  Calendar,
  Video,
  FileText,
  Globe,
  Target,
  Zap
} from "lucide-react";
import { CourseSectionHeader } from "@/features/course/components/CourseSectionHeader";
import { ReviewCard } from "@/features/course/components/ReviewCard";
import { ReviewList } from "@/features/course/components/ReviewList";
import { RatingSummaryCard } from "@/features/course/components/RatingSummaryCard";
import ProgressCard from "@/features/course/components/ProgressStudyCard";
import { CustomIcon } from "@/components/ui/IconCard/IconCard";

const coursesData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1716703432455-3045789de738?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHN0cmF0ZWd5JTIwbWVldGluZ3xlbnwxfHx8fDE3NjExMDkwMjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Marketing",
    categoryColor: "bg-pink-100 text-pink-700",
    title: "Digital Marketing Strategy",
    rating: 4.0,
    ratingCount: "234",
    instructor: "Noah Adams",
    studentCount: "28",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1653133224278-f55672909571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGNvZGluZ3xlbnwxfHx8fDE3NjEyMDMzMTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Data Science",
    categoryColor: "bg-blue-100 text-blue-700",
    title: "Python for Data Analysis",
    rating: 4.8,
    ratingCount: "412",
    instructor: "Emma Wilson",
    studentCount: "156",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1603985585179-3d71c35a537c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudCUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NjExODYxNzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Development",
    categoryColor: "bg-green-100 text-green-700",
    title: "Full Stack Web Development",
    rating: 4.9,
    ratingCount: "589",
    instructor: "James Chen",
    studentCount: "234",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MTEzMzkyM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Design",
    categoryColor: "bg-purple-100 text-purple-700",
    title: "UI/UX Design Fundamentals",
    rating: 4.7,
    ratingCount: "321",
    instructor: "Sophia Martinez",
    studentCount: "198",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1622319977720-9949ac28adc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGNhbWVyYXxlbnwxfHx8fDE3NjExNTg4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Photography",
    categoryColor: "bg-orange-100 text-orange-700",
    title: "Professional Photography Course",
    rating: 4.6,
    ratingCount: "267",
    instructor: "Lucas Brown",
    studentCount: "89",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1744782211816-c5224434614f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwY2FsY3VsYXRvciUyMGNoYXJ0fGVufDF8fHx8MTc2MTIwMzMxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Finance",
    categoryColor: "bg-yellow-100 text-yellow-700",
    title: "Financial Analysis & Modeling",
    rating: 4.5,
    ratingCount: "198",
    instructor: "Michael Johnson",
    studentCount: "142",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHByb2R1Y3Rpb24lMjBzdHVkaW98ZW58MXx8fHwxNzYxMTcwMDM0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Music",
    categoryColor: "bg-red-100 text-red-700",
    title: "Music Production Masterclass",
    rating: 4.7,
    ratingCount: "345",
    instructor: "Alex Turner",
    studentCount: "167",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1670819916552-67698b1c86ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwY2hlZiUyMGtpdGNoZW58ZW58MXx8fHwxNzYxMTI3MTkyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Culinary",
    categoryColor: "bg-amber-100 text-amber-700",
    title: "Professional Culinary Arts",
    rating: 4.6,
    ratingCount: "289",
    instructor: "Julia Roberts",
    studentCount: "134",
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1756115484694-009466dbaa67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dCUyMGd5bXxlbnwxfHx8fDE3NjExMDU4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Fitness",
    categoryColor: "bg-lime-100 text-lime-700",
    title: "Personal Fitness Training",
    rating: 4.8,
    ratingCount: "421",
    instructor: "Marcus Smith",
    studentCount: "203",
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1565022536102-f7645c84354a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5ndWFnZSUyMGxlYXJuaW5nJTIwYm9va3N8ZW58MXx8fHwxNzYxMTQ3MjAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Languages",
    categoryColor: "bg-teal-100 text-teal-700",
    title: "Spanish Language Course",
    rating: 4.5,
    ratingCount: "312",
    instructor: "Isabella Garcia",
    studentCount: "178",
  },
  {
    id: 11,
    image: "https://images.unsplash.com/photo-1658044552340-42456e3cc071?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0JTIwdGFibGV0fGVufDF8fHx8MTc2MTIwNDAwMnww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Art",
    categoryColor: "bg-indigo-100 text-indigo-700",
    title: "Digital Art & Illustration",
    rating: 4.9,
    ratingCount: "456",
    instructor: "Olivia Anderson",
    studentCount: "221",
  },
  {
    id: 12,
    image: "https://images.unsplash.com/photo-1603201667230-bd139210db18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBvZmZpY2V8ZW58MXx8fHwxNzYxMTc5Nzk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Business",
    categoryColor: "bg-cyan-100 text-cyan-700",
    title: "Business Management Essentials",
    rating: 4.4,
    ratingCount: "267",
    instructor: "David Lee",
    studentCount: "189",
  },
];

const reviews = [
    {
      id: 1,
      reviewerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      reviewerName: "Sarah Johnson",
      rating: 5,
      timePosted: "2 days ago",
      reviewText: "Kursus ini sangat membantu! Materi dijelaskan dengan sangat detail dan mudah dipahami. Instruktur sangat responsif dalam menjawab pertanyaan. Highly recommended!",
      badge: "Verified Purchase",
      helpfulCount: 24
    },
    {
      id: 2,
      reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      reviewerName: "Michael Chen",
      rating: 4,
      timePosted: "1 week ago",
      reviewText: "Great course overall! The content is well-structured and the projects are practical. Only minor issue is some videos could be updated with newer examples.",
      helpfulCount: 15
    },
    {
      id: 3,
      reviewerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      reviewerName: "Emma Davis",
      rating: 5,
      timePosted: "2 weeks ago",
      reviewText: "Best investment I've made for my career! Dari tidak tahu apa-apa sampai sekarang bisa membuat project sendiri. Thank you!",
      badge: "Top Reviewer"
    },
    {
      id: 4,
      reviewerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      reviewerName: "David Kim",
      rating: 5,
      timePosted: "3 weeks ago",
      reviewText: "Exceptional quality! The instructor breaks down complex concepts into digestible chunks. The community support is also amazing. Worth every penny!",
      badge: "Verified Purchase",
      helpfulCount: 42
    }
  ];

  const courseData1 = {
    averageRating: 4.8,
    totalRatings: 2847,
    ratingDistribution: {
      5: 2145,
      4: 528,
      3: 142,
      2: 23,
      1: 9
    }
  };

  const myProgressData = {
    completedActivities: 15,
    totalActivities: 25,
    studyTime: 180, // dalam menit
    quizScore: 85,
    completionPercentage: 60
  };

  const iconPaths = {
  // Icon Check/Checkmark
  check: {
    path1: "M16.6667 5L7.50002 14.1667L3.33335 10",
  },
  // Icon User/Profile
  user: {
    path1: "M16.6667 17.5V15.8333C16.6667 14.9493 16.3155 14.1014 15.6904 13.4763C15.0652 12.8512 14.2174 12.5 13.3334 12.5H6.66669C5.78265 12.5 4.93478 12.8512 4.30966 13.4763C3.68454 14.1014 3.33335 14.9493 3.33335 15.8333V17.5",
    path2: "M10 9.16667C11.8409 9.16667 13.3334 7.67428 13.3334 5.83333C13.3334 3.99238 11.8409 2.5 10 2.5C8.15907 2.5 6.66669 3.99238 6.66669 5.83333C6.66669 7.67428 8.15907 9.16667 10 9.16667Z",
  },
  // Icon Heart
  heart: {
    path1: "M17.3667 3.84172C16.9411 3.41589 16.4361 3.07778 15.8779 2.84763C15.3198 2.61748 14.7192 2.49951 14.1125 2.50005C13.5059 2.49951 12.9053 2.61748 12.3472 2.84763C11.789 3.07778 11.284 3.41589 10.8584 3.84172L10 4.70005L9.14171 3.84172C8.28243 2.98244 7.11894 2.5004 5.90504 2.5004C4.69114 2.5004 3.52765 2.98244 2.66837 3.84172C1.80909 4.701 1.32705 5.86449 1.32705 7.07839C1.32705 8.29229 1.80909 9.45577 2.66837 10.3151L3.52671 11.1734L10 17.6467L16.4734 11.1734L17.3317 10.3151C17.7575 9.88943 18.0956 9.38445 18.3258 8.82631C18.5559 8.26817 18.6739 7.66761 18.6734 7.06089C18.6739 6.45417 18.5559 5.85361 18.3258 5.29547C18.0956 4.73733 17.7575 4.23235 17.3317 3.80672",
  },
  // Icon Settings/Gear
  settings: {
    path1: "M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z",
    path2: "M16.1667 12.5C16.0558 12.7513 16.0226 13.0301 16.0717 13.3006C16.1207 13.5711 16.2497 13.8211 16.4417 14.0167L16.4917 14.0667C16.6438 14.2186 16.7643 14.3986 16.8464 14.5963C16.9285 14.794 16.9706 15.0056 16.9706 15.2192C16.9706 15.4327 16.9285 15.6443 16.8464 15.842C16.7643 16.0397 16.6438 16.2197 16.4917 16.3717C16.3397 16.5237 16.1597 16.6443 15.962 16.7263C15.7643 16.8084 15.5527 16.8506 15.3392 16.8506C15.1256 16.8506 14.914 16.8084 14.7163 16.7263C14.5186 16.6443 14.3386 16.5237 14.1867 16.3717L14.1367 16.3217C13.9411 16.1297 13.6911 16.0007 13.4206 15.9516C13.1501 15.9026 12.8713 15.9358 12.62 16.0467C12.3732 16.1525 12.1643 16.3308 12.0193 16.5588C11.8743 16.7868 11.7995 17.0545 11.8042 17.3267V17.5C11.8042 17.9421 11.6285 18.3659 11.3159 18.6785C11.0034 18.991 10.5795 19.1667 10.1375 19.1667C9.69549 19.1667 9.27164 18.991 8.95908 18.6785C8.64652 18.3659 8.47084 17.9421 8.47084 17.5V17.4167C8.46047 17.1364 8.37523 16.8645 8.22361 16.6296C8.072 16.3947 7.86003 16.2057 7.61084 16.0833C7.35955 15.9725 7.08073 15.9393 6.81021 15.9883C6.53969 16.0373 6.28972 16.1663 6.09417 16.3583L6.04417 16.4083C5.89223 16.5604 5.71221 16.6809 5.51453 16.763C5.31685 16.8451 5.10522 16.8872 4.89168 16.8872C4.67813 16.8872 4.4665 16.8451 4.26882 16.763C4.07114 16.6809 3.89112 16.5604 3.73918 16.4083C3.58713 16.2564 3.46662 16.0764 3.38454 15.8787C3.30246 15.681 3.26035 15.4694 3.26035 15.2558C3.26035 15.0423 3.30246 14.8307 3.38454 14.633C3.46662 14.4353 3.58713 14.2553 3.73918 14.1033L3.78918 14.0533C3.98114 13.8578 4.11012 13.6078 4.15918 13.3373C4.20824 13.0668 4.17502 12.788 4.06418 12.5367C3.95832 12.2898 3.78001 12.0809 3.55202 11.9359C3.32403 11.7909 3.05631 11.7161 2.78418 11.7208H2.60084C2.15881 11.7208 1.73496 11.5452 1.4224 11.2326C1.10984 10.92 0.934174 10.4962 0.934174 10.0542C0.934174 9.61213 1.10984 9.18828 1.4224 8.87572C1.73496 8.56316 2.15881 8.38749 2.60084 8.38749H2.68418C2.96446 8.37711 3.23634 8.29187 3.47123 8.14026C3.70613 7.98865 3.89511 7.77667 4.01751 7.52749C4.12835 7.2762 4.16157 6.99739 4.11251 6.72686C4.06345 6.45634 3.93447 6.20637 3.74251 6.01082L3.69251 5.96082C3.54046 5.80889 3.41995 5.62887 3.33787 5.43119C3.25579 5.23351 3.21368 5.02188 3.21368 4.80833C3.21368 4.59478 3.25579 4.38315 3.33787 4.18547C3.41995 3.98779 3.54046 3.80777 3.69251 3.65583C3.84444 3.50378 4.02447 3.38327 4.22215 3.30119C4.41983 3.21911 4.63146 3.177 4.845 3.177C5.05855 3.177 5.27018 3.21911 5.46786 3.30119C5.66554 3.38327 5.84556 3.50378 5.9975 3.65583L6.0475 3.70583C6.24305 3.8978 6.49302 4.02677 6.76354 4.07583C7.03407 4.12489 7.31288 4.09168 7.56417 3.98082H7.62084C7.86771 3.87497 8.07661 3.69666 8.22161 3.46867C8.36662 3.24068 8.44142 2.97296 8.43668 2.70082V2.51749C8.43668 2.07545 8.61235 1.6516 8.92491 1.33904C9.23747 1.02648 9.66132 0.850815 10.1033 0.850815C10.5454 0.850815 10.9692 1.02648 11.2818 1.33904C11.5944 1.6516 11.77 2.07545 11.77 2.51749V2.60082C11.7648 2.87296 11.8396 3.14068 11.9846 3.36867C12.1296 3.59666 12.3385 3.77497 12.5854 3.88082C12.8366 3.99168 13.1155 4.02489 13.386 3.97583C13.6565 3.92677 13.9065 3.7978 14.102 3.60583L14.152 3.55583C14.304 3.40378 14.484 3.28327 14.6817 3.20119C14.8793 3.11911 15.091 3.077 15.3045 3.077C15.5181 3.077 15.7297 3.11911 15.9274 3.20119C16.1251 3.28327 16.3051 3.40378 16.457 3.55583C16.6091 3.70777 16.7296 3.88779 16.8117 4.08547C16.8938 4.28315 16.9359 4.49478 16.9359 4.70833C16.9359 4.92188 16.8938 5.13351 16.8117 5.33119C16.7296 5.52887 16.6091 5.70889 16.457 5.86082L16.407 5.91082C16.2151 6.10637 16.0861 6.35634 16.037 6.62686C15.988 6.89739 16.0212 7.1762 16.132 7.42749V7.48416C16.2379 7.73102 16.4162 7.93993 16.6442 8.08493C16.8722 8.22994 17.1399 8.30473 17.412 8.29999H17.5954C18.0374 8.29999 18.4613 8.47566 18.7738 8.78822C19.0864 9.10078 19.262 9.52463 19.262 9.96666C19.262 10.4087 19.0864 10.8325 18.7738 11.1451C18.4613 11.4577 18.0374 11.6333 17.5954 11.6333H17.512C17.2399 11.6281 16.9722 11.7029 16.7442 11.8479C16.5162 11.9929 16.3379 12.2018 16.232 12.4483",
  },
};



export default function Home() {

   const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("grid");
  const [sortBy, setSortBy] = useState("a-z");
  const [currentPage, setCurrentPage] = useState(1);

    const coursesPerPage = 8;
const filteredCourses = coursesData
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "a-z") {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans ">
      <main className="flex min-h-screen w-full flex-col items-center justify-between bg-white sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

         <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Reviews</h2>
          <ReviewList>
            {reviews.slice(0, 2).map((review) => (
              <ReviewCard
                key={review.id}
                reviewerAvatar={review.reviewerAvatar}
                reviewerName={review.reviewerName}
                rating={review.rating}
                timePosted={review.timePosted}
                reviewText={review.reviewText}
                badge={review.badge}
              />
            ))}
          </ReviewList>
        </div>

        <div className="max-w-2xl mx-auto p-4">
      <ProgressCard 
        progressData={myProgressData}
        onExpand={(expanded) => console.log('Card expanded:', expanded)}
      />
    </div>

    <div className="flex items-center gap-6 flex-wrap">
              <CustomIcon
                variant="outline"
                size="medium"
                color="#615fff"
                paths={iconPaths.check}
              />
              <CustomIcon
                variant="outline"
                size="medium"
                color="#10b981"
                paths={iconPaths.user}
              />
              <CustomIcon
                variant="outline"
                size="small"
                color="#ef4444"
                paths={iconPaths.heart}
              />
              <CustomIcon
                variant="filled"
                size="large"
                color="#f59e0b"
                paths={iconPaths.settings}
              />
            </div>
        
        
      </main>
    </div>
  );
}
