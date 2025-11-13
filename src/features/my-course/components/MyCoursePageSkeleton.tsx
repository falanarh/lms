import { PageContainer } from "@/features/detail-course/components";

export const MyCoursePageSkeleton = () => {
  return (
    <>
      {/* Mobile Layout - No Sidebar */}
      <div className="lg:hidden">
        <PageContainer>
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center space-x-2 pt-6 pb-3">
            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>

          {/* Content Player Skeleton */}
          <div className="w-full mb-6">
            <div className="relative w-full bg-gray-200 rounded-xl overflow-hidden aspect-video flex items-center justify-center animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons Skeleton */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-12 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
          </div>

          {/* Course Title Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>

          {/* Tabs & Content Skeleton */}
          <div className="space-y-6 pb-8 mt-8">
            {/* Tab Navigation Skeleton - All 4 tabs for mobile */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <div className="h-12 bg-gray-200 rounded-md flex-1 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-md flex-1 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-md flex-1 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-md flex-1 animate-pulse"></div>
            </div>

            {/* Information Tab Content Skeleton */}
            <div className="space-y-6">
              {/* Course Info Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Metode Card */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>

                {/* Silabus Card */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>

                {/* Total JP Card */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>

                {/* Kuota Card */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Description Skeleton */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Desktop Layout - With Sidebar */}
      <div className="hidden lg:block">
        <div className="lg:mr-[300px] xl:mr-[350px] 2xl:mr-[400px] transition-all duration-300 ease-in-out">
          <PageContainer>
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center space-x-2 pt-6 pb-3">
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>

            {/* Content Player Skeleton */}
            <div className="w-full mb-6">
              <div className="relative w-full bg-gray-200 rounded-xl overflow-hidden aspect-[4/3] md:max-h-[450px] flex items-center justify-center animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons Skeleton */}
            <div className="flex justify-between items-center mb-6">
              <div className="h-12 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
            </div>

            {/* Course Title Skeleton */}
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Tabs & Content Skeleton */}
            <div className="space-y-6 pb-8 mt-8">
              {/* Tab Navigation Skeleton - Only 3 tabs (no course contents) */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <div className="h-12 bg-gray-200 rounded-md flex-1 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-md flex-1 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-md flex-1 animate-pulse"></div>
              </div>

              {/* Information Tab Content Skeleton */}
              <div className="space-y-6">
                {/* Course Info Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Metode Card */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>

                  {/* Silabus Card */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                  </div>

                  {/* Total JP Card */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>

                  {/* Kuota Card */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Description Skeleton */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </div>

        {/* Desktop Sidebar Skeleton */}
        <div className="fixed top-0 right-0 h-full w-[300px] xl:w-[350px] 2xl:w-[400px] bg-white border-l border-gray-200 z-40">
          <div className="p-6 space-y-6">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-4 overflow-y-auto">
              {[1, 2, 3, 4, 5].map((section) => (
                <div key={section} className="space-y-3">
                  {/* Section Header */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Section Items */}
                  <div className="ml-4 space-y-2">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                        <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
