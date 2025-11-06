export const DetailCourseSkeleton = () => {
  return (
    <div className="animate-pulse pt-8">
      {/* Breadcrumb & Title */}
      <div className="mb-6">
        <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
        <div className="h-8 bg-gray-200 rounded w-2/3"></div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 mt-4">
        {/* Thumbnail */}
        <div className="lg:col-span-2">
          <div className="aspect-video bg-gray-200 rounded-xl"></div>
        </div>

        {/* Course Info Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Category & Rating */}
            <div className="p-5 border-b border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>

            {/* Instructor */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-5 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>

            {/* Enroll Button */}
            <div className="p-5">
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6 pb-8 ">
        <div className="flex justify-center gap-8 border-b border-gray-200 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded flex-1 max-w-[8rem] mb-2"
            ></div>
          ))}
        </div>

        {/* Tab Content - Information Tab */}
        <div className="space-y-6">
          {/* CourseInfoCards Skeleton - 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CourseDescription Skeleton */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
