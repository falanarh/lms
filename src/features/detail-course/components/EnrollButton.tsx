interface EnrollButtonProps {
  isEnrolled: boolean;
  onToggle: () => void;
}

export const EnrollButton = ({ isEnrolled, onToggle }: EnrollButtonProps) => {
  return (
    <button
      onClick={onToggle}
      className={`
        w-full font-semibold text-base py-4 px-6 rounded-xl transition-all duration-200 
        flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl hover:-translate-y-0.5
        ${
          isEnrolled
            ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-green-500/25 hover:shadow-green-500/35"
            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/25 hover:shadow-blue-500/35"
        }
      `}
    >
      {isEnrolled ? (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.6667 5L7.50004 14.1667L3.33337 10"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Enrolled</span>
        </>
      ) : (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 4V16M4 10H16"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Enroll Now</span>
        </>
      )}
    </button>
  );
};
