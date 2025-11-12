/**
 * Upcoming Webinars Component
 * Calendar-style design with modern, aesthetic, and minimalist approach
 */

'use client';

import { useUpcomingWebinars } from '@/hooks/useUpcomingWebinars';
import { Calendar, Clock, User, ArrowRight, Video } from 'lucide-react';
import Link from 'next/link';


export default function UpcomingWebinars() {
  const { upcomingWebinars, isLoading } = useUpcomingWebinars();

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50/40 via-blue-50/30 to-green-50/20 border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="h-8 bg-gray-200 rounded w-56 mx-auto mb-3 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const hasWebinars = upcomingWebinars && upcomingWebinars.length > 0;

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50/40 via-blue-50/30 to-green-50/20 relative overflow-hidden border-t border-gray-200/50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-200/20 via-blue-200/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tl from-green-200/20 via-blue-200/20 to-transparent rounded-full blur-3xl -ml-32 -mb-32"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>

        {/* Floating decorative shapes */}
        <div className="absolute top-32 left-32 w-16 h-16 bg-gradient-to-br from-blue-300/20 to-blue-400/20 rounded-2xl rotate-12 backdrop-blur-sm"></div>
        <div className="absolute bottom-40 right-40 w-20 h-20 bg-gradient-to-br from-green-300/20 to-blue-300/20 rounded-full backdrop-blur-sm"></div>
      </div>

      {/* Smooth bottom fade transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-blue-50/50 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full text-sm text-blue-600 font-semibold mb-4 shadow-sm">
            <Calendar className="w-4 h-4" />
            <span>Upcoming Events</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent leading-snug">
            Webinar Mendatang
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ikuti webinar terbaru dan tingkatkan pengetahuan Anda
          </p>
        </div>

        {/* Calendar-style Grid or Empty State */}
        {hasWebinars ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {upcomingWebinars.map((webinar) => {
              const webinarDate = new Date(webinar.webinar?.zoomDate ?? new Date());
              const dayName = webinarDate.toLocaleDateString('id-ID', { weekday: 'long' });
              const day = webinarDate.getDate();
              const month = webinarDate.toLocaleDateString('id-ID', { month: 'short' });
              const year = webinarDate.getFullYear();
              const time = webinarDate.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              });

            return (
              <Link
                key={webinar.id}
                href={`/knowledge-center/${webinar.id}`}
                className="group block"
              >
                <article className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-200 hover:shadow-md h-full overflow-hidden">

                  {/* Calendar Header - Minimalist */}
                  <div className="border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/50">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {dayName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{month} {year}</span>
                      </div>
                    </div>
                  </div>

                  {/* Calendar Date Display */}
                  <div className="px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      {/* Large Date Number */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                          <span className="text-3xl font-bold text-white leading-none">
                            {day}
                          </span>
                        </div>
                      </div>

                      {/* Time Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm font-semibold text-gray-900">
                            {time} WIB
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500">
                            Online Webinar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-sm mb-3 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
                      {webinar.title}
                    </h3>

                    {/* Speaker/Author */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <span className="text-xs text-gray-600 line-clamp-1 font-medium">
                        {webinar.createdBy}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-100 mb-3"></div>

                    {/* Action */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                        Lihat Detail
                      </span>
                      <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
        ) : (
          /* Empty State - Modern & Unique Design */
          <div className="py-12">
            <div className="max-w-2xl mx-auto">
              {/* Artistic Empty State Card */}
              <div className="relative bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 overflow-hidden">
                {/* Decorative corner elements */}
                <div className="absolute top-0 left-0 w-24 h-24 border-l-4 border-t-4 border-blue-400 rounded-tl-2xl opacity-30"></div>
                <div className="absolute bottom-0 right-0 w-24 h-24 border-r-4 border-b-4 border-blue-400 rounded-br-2xl opacity-30"></div>
                
                {/* Content */}
                <div className="relative text-center space-y-6">
                  {/* Icon with animated background */}
                  <div className="inline-flex relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center transform rotate-3">
                      <Calendar className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Belum Ada Webinar Terjadwal
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                      Saat ini tidak ada webinar yang dijadwalkan. Pantau terus halaman ini untuk update webinar mendatang.
                    </p>
                  </div>

                  {/* Decorative divider */}
                  <div className="flex items-center justify-center gap-2 py-2">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300"></div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Link
                      href="/knowledge-center?type=webinar"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                      <span>Jelajahi Semua Konten</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}