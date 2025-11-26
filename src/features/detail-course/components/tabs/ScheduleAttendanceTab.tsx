"use client";

import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  format,
  parseISO,
  isWithinInterval,
  addHours,
  subHours,
} from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChartArea } from "lucide-react";
import {
  History,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface CourseSchedule {
  id: string;
  idCourse: string;
  idContent: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  jp: number;
  rbpmp: string | null;
  bahanAjarUrl: string | null;
  bahanTayangUrl: string | null;
  alatPeraga: string | null;
  isMooc: boolean;
  attended?: boolean;
}

interface ScheduleAttendanceTabProps {
  courseId: string;
}

// Dummy data for demonstration - This week's schedule (Nov 18-24, 2025)
const DUMMY_SCHEDULES: CourseSchedule[] = [
  {
    id: "e7fcf721-2eca-4fd8-ad46-c1d190b1c5d3",
    idCourse: "f33b6c5f-9397-4dce-9de7-e1bcc42b2a3c",
    idContent: "0067cb51-2dde-4a96-b887-874298dc09b5",
    name: "Kick-off Diklat Pranata Komputer",
    description:
      "Sesi pembukaan diklat, pengenalan kurikulum, dan ice breaking peserta",
    date: "2025-11-18T00:00:00.000Z", // Monday - Past, attended
    startTime: "1970-01-01T01:30:00.000Z", // 08:30 WIB
    endTime: "1970-01-01T05:00:00.000Z", // 12:00 WIB
    jp: 4,
    rbpmp: null,
    bahanAjarUrl: "https://example.com/bahan-ajar-1.pdf",
    bahanTayangUrl: null,
    alatPeraga: null,
    isMooc: false,
    attended: true,
  },
  {
    id: "a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    idCourse: "f33b6c5f-9397-4dce-9de7-e1bcc42b2a3c",
    idContent: "1234abcd-5678-efgh-ijkl-mnop9876qrst",
    name: "Pengenalan Algoritma dan Struktur Data",
    description:
      "Memahami konsep dasar algoritma, kompleksitas waktu, dan struktur data fundamental",
    date: "2025-11-19T00:00:00.000Z", // Tuesday - Past, attended
    startTime: "1970-01-01T02:00:00.000Z", // 09:00 WIB
    endTime: "1970-01-01T05:30:00.000Z", // 12:30 WIB
    jp: 4,
    rbpmp: "RBPMP-001",
    bahanAjarUrl: "https://example.com/bahan-ajar-2.pdf",
    bahanTayangUrl: "https://example.com/slides-2.pptx",
    alatPeraga: null,
    isMooc: false,
    attended: true,
  },
  {
    id: "b2c3d4e5-6f7g-8h9i-0j1k-l2m3n4o5p6q7",
    idCourse: "f33b6c5f-9397-4dce-9de7-e1bcc42b2a3c",
    idContent: "5678efgh-9012-ijkl-mnop-qrst3456uvwx",
    name: "Database Management System",
    description:
      "Pembelajaran tentang sistem basis data, SQL, normalisasi, dan optimasi query",
    date: "2025-11-20T00:00:00.000Z", // Wednesday - TODAY! Test attendance here
    startTime: "1970-01-01T06:00:00.000Z", // 13:00 WIB (1 PM)
    endTime: "1970-01-01T09:00:00.000Z", // 16:00 WIB (4 PM)
    jp: 3,
    rbpmp: "RBPMP-002",
    bahanAjarUrl: null,
    bahanTayangUrl: "https://example.com/slides-3.pptx",
    alatPeraga: "MySQL Workbench",
    isMooc: false,
    attended: false,
  },
  {
    id: "c3d4e5f6-7g8h-9i0j-1k2l-m3n4o5p6q7r8",
    idCourse: "f33b6c5f-9397-4dce-9de7-e1bcc42b2a3c",
    idContent: "9012ijkl-3456-mnop-qrst-uvwx7890yzab",
    name: "Web Development Fundamentals",
    description:
      "HTML, CSS, JavaScript dasar dan responsive design untuk pengembangan web modern",
    date: "2025-11-21T00:00:00.000Z", // Friday - Upcoming
    startTime: "1970-01-01T12:30:00.000Z", // 08:30 WIB
    endTime: "1970-01-01T14:30:00.000Z", // 11:30 WIB
    jp: 3,
    rbpmp: "RBPMP-003",
    bahanAjarUrl: "https://example.com/bahan-ajar-4.pdf",
    bahanTayangUrl: "https://example.com/slides-4.pptx",
    alatPeraga: "VS Code, Browser DevTools",
    isMooc: false,
    attended: false,
  },
  {
    id: "d4e5f6g7-8h9i-0j1k-2l3m-n4o5p6q7r8s9",
    idCourse: "f33b6c5f-9397-4dce-9de7-e1bcc42b2a3c",
    idContent: "3456mnop-7890-qrst-uvwx-yzab1234cdef",
    name: "Ujian Akhir dan Evaluasi",
    description:
      "Ujian komprehensif dan evaluasi pemahaman seluruh materi diklat",
    date: "2025-11-24T00:00:00.000Z", // Sunday - Upcoming
    startTime: "1970-01-01T01:00:00.000Z", // 08:00 WIB
    endTime: "1970-01-01T04:00:00.000Z", // 11:00 WIB
    jp: 3,
    rbpmp: "RBPMP-004",
    bahanAjarUrl: null,
    bahanTayangUrl: null,
    alatPeraga: null,
    isMooc: false,
    attended: false,
  },
];

export function ScheduleAttendanceTab({
  courseId,
}: ScheduleAttendanceTabProps) {
  const [schedules] = useState<CourseSchedule[]>(DUMMY_SCHEDULES);
  const [selectedSession, setSelectedSession] = useState<CourseSchedule | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<string, boolean>
  >({
    [DUMMY_SCHEDULES[0].id]: true,
    [DUMMY_SCHEDULES[1].id]: true,
  });
  const calendarRef = useRef<FullCalendar>(null);

  // State for expanded attendance details
  const [isAttendanceExpanded, setIsAttendanceExpanded] = useState(false);

  // Helper function to parse time from ISO string
  const parseTime = (
    timeString: string,
  ): { hours: number; minutes: number } => {
    const date = new Date(timeString);
    return {
      hours: date.getUTCHours(),
      minutes: date.getUTCMinutes(),
    };
  };

  // Helper function to combine date and time
  const combineDateTime = (dateString: string, timeString: string): Date => {
    const date = new Date(dateString);
    const time = parseTime(timeString);

    // Create new date with combined date and time
    const combined = new Date(date);
    combined.setHours(time.hours, time.minutes, 0, 0);

    return combined;
  };

  // Check if attendance is available (1 hour before to 1 hour after)
  const isAttendanceAvailable = (schedule: CourseSchedule): boolean => {
    const now = new Date();
    const sessionStart = combineDateTime(schedule.date, schedule.startTime);
    const sessionEnd = combineDateTime(schedule.date, schedule.endTime);

    const attendanceStart = subHours(sessionStart, 1);
    const attendanceEnd = addHours(sessionEnd, 1);

    return isWithinInterval(now, {
      start: attendanceStart,
      end: attendanceEnd,
    });
  };

  // Convert schedules to FullCalendar events
  const calendarEvents = schedules.map((schedule) => {
    const startDateTime = combineDateTime(schedule.date, schedule.startTime);
    const endDateTime = combineDateTime(schedule.date, schedule.endTime);
    const isAttended = attendanceStatus[schedule.id];
    const canAttend = isAttendanceAvailable(schedule);
    const isPast = new Date() > endDateTime;

    // All events use blue color
    const backgroundColor = "#3b82f6"; // Blue for all events
    const borderColor = "#2563eb";

    const event = {
      id: schedule.id,
      title: schedule.name,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      backgroundColor,
      borderColor,
      extendedProps: {
        schedule,
        isAttended,
        canAttend,
        isPast,
      },
    };

    console.log("Calendar Event:", {
      title: event.title,
      start: event.start,
      end: event.end,
      color: event.backgroundColor,
    });

    return event;
  });

  console.log("Total Calendar Events:", calendarEvents.length);

  // Handle event click
  const handleEventClick = (info: any) => {
    const schedule = info.event.extendedProps.schedule;
    setSelectedSession(schedule);
    setIsModalOpen(true);
  };

  // Handle attendance
  const handleAttendance = (scheduleId: string) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [scheduleId]: true,
    }));
    // Here you would typically call an API to record attendance
    alert("Presensi berhasil dicatat!");
  };

  // Calculate attendance stats
  const totalSessions = schedules.length;
  const attendedSessions =
    Object.values(attendanceStatus).filter(Boolean).length;
  const attendancePercentage =
    totalSessions > 0
      ? Math.round((attendedSessions / totalSessions) * 100)
      : 0;

  // Check if any session has available attendance
  const availableSessions = schedules.filter(
    (schedule) =>
      isAttendanceAvailable(schedule) && !attendanceStatus[schedule.id],
  );
  const hasAvailableAttendance = availableSessions.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 mb-4 shadow-md">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span>Presensi Tersedia!</span>
              {availableSessions.length > 1 && (
                <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
                  {availableSessions.length} Sesi
                </span>
              )}
            </h4>
            <p className="text-sm text-gray-700">
              Anda belum melakukan presensi untuk sesi yang sedang berlangsung.
              Silakan tandai kehadiran Anda sekarang.
            </p>
          </div>

          <button
            onClick={() => {
              alert("Berhasil presensi!");
            }}
            className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 font-semibold"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Tandai Kehadiran</span>
          </button>
        </div>
      </div>

      {/* Attendance Summary Card with Integrated Actions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 overflow-hidden">
        {/* Main Summary Section */}
        <div className="p-6">
          <div className="flex items-center justify-between bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <ChartArea className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Ringkasan Kehadiran
                </h3>
                <p className="text-sm text-gray-600">
                  Status kehadiran Anda pada kursus ini
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-baseline gap-1 justify-end mb-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {attendancePercentage}
                </span>
                <span className="text-2xl font-semibold text-blue-600">%</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-blue-200">
                <span className="text-sm font-medium text-gray-700">
                  {attendedSessions} dari {totalSessions} sesi
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-3">
            {/* View Details Button */}
            <button
              onClick={() => setIsAttendanceExpanded(!isAttendanceExpanded)}
              className={`${hasAvailableAttendance ? "flex-none" : "flex-1"} bg-white text-blue-600 border-2 border-blue-200 py-3 px-4 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-semibold`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Detail Kehadiran</span>
              <svg
                className={`w-4 h-4 transition-transform ${isAttendanceExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Expandable Attendance Details */}
        {isAttendanceExpanded && (
          <div className="border-t border-gray-200 bg-white">
            <div className="p-6 space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-600" />
                Riwayat Kehadiran
              </h4>

              {schedules.map((schedule, index) => {
                const isAttended = attendanceStatus[schedule.id];
                const canAttend = isAttendanceAvailable(schedule);
                const sessionStart = combineDateTime(
                  schedule.date,
                  schedule.startTime,
                );
                const sessionEnd = combineDateTime(
                  schedule.date,
                  schedule.endTime,
                );
                const isPast = new Date() > addHours(sessionEnd, 1);

                return (
                  <div
                    key={schedule.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isAttended
                        ? "bg-green-50 border-green-200"
                        : canAttend
                          ? "bg-yellow-50 border-yellow-300"
                          : isPast
                            ? "bg-gray-50 border-gray-200"
                            : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          Sesi {index + 1}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <h5 className="font-medium text-gray-900 text-sm truncate">
                          {schedule.name}
                        </h5>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(sessionStart, "dd MMM yyyy", {
                            locale: idLocale,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(sessionStart, "HH:mm")} -{" "}
                          {format(sessionEnd, "HH:mm")}
                        </span>
                      </div>

                      {isAttended && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-green-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            Presensi:{" "}
                            {format(sessionStart, "HH:mm", {
                              locale: idLocale,
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="ml-3 flex items-center gap-2">
                      {isAttended && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Hadir
                        </span>
                      )}
                      {canAttend && !isAttended && (
                        <>
                          <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-medium rounded flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Tersedia
                          </span>
                          <button
                            onClick={() => {
                              setSelectedSession(schedule);
                              setIsModalOpen(true);
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-xs font-medium"
                          >
                            Presensi
                          </button>
                        </>
                      )}
                      {isPast && !isAttended && (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Tidak Hadir
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">
            <Calendar />
          </span>
          Jadwal Kursus
        </h3>

        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            initialDate="2025-11-20"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
            locale="id"
            buttonText={{
              today: "Hari Ini",
              month: "Bulan",
              week: "Minggu",
              day: "Hari",
            }}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: false,
            }}
            eventContent={(eventInfo) => {
              const isAttended = attendanceStatus[eventInfo.event.id];
              return (
                <div className="fc-event-main-frame">
                  <div className="fc-event-time">{eventInfo.timeText}</div>
                  <div className="fc-event-title-container">
                    <div className="fc-event-title fc-sticky">
                      {isAttended && <span className="mr-1">✓</span>}
                      {eventInfo.event.title}
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </div>

      {/* Session Detail Modal */}
      {isModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {selectedSession.name}
                  </h3>
                  <p className="text-blue-100">{selectedSession.description}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Quick Action - Attendance Button (if available) */}
              {isAttendanceAvailable(selectedSession) &&
                !attendanceStatus[selectedSession.id] && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-green-900 mb-1 flex items-center gap-2">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Presensi Tersedia Sekarang!
                        </h4>
                        <p className="text-sm text-green-700">
                          Klik tombol di bawah untuk mencatat kehadiran Anda
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          handleAttendance(selectedSession.id);
                          setIsModalOpen(false);
                        }}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-bold text-lg flex items-center gap-2 animate-pulse"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Presensi
                      </button>
                    </div>
                  </div>
                )}

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {attendanceStatus[selectedSession.id] ? (
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Sudah Presensi
                  </span>
                ) : isAttendanceAvailable(selectedSession) ? (
                  <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    Presensi Tersedia
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    Belum Waktunya Presensi
                  </span>
                )}
              </div>

              {/* Schedule Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📋</span>
                  Informasi Jadwal
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tanggal</p>
                    <p className="font-medium text-gray-900">
                      {format(
                        combineDateTime(
                          selectedSession.date,
                          selectedSession.startTime,
                        ),
                        "EEEE, dd MMMM yyyy",
                        { locale: idLocale },
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Waktu</p>
                    <p className="font-medium text-gray-900">
                      {format(
                        combineDateTime(
                          selectedSession.date,
                          selectedSession.startTime,
                        ),
                        "HH:mm",
                      )}{" "}
                      -{" "}
                      {format(
                        combineDateTime(
                          selectedSession.date,
                          selectedSession.endTime,
                        ),
                        "HH:mm",
                      )}{" "}
                      WIB
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Jam Pelajaran</p>
                    <p className="font-medium text-gray-900">
                      {selectedSession.jp} JP
                    </p>
                  </div>

                  {selectedSession.rbpmp && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kode RBPMP</p>
                      <p className="font-medium text-gray-900">
                        {selectedSession.rbpmp}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Materials */}
              {(selectedSession.bahanAjarUrl ||
                selectedSession.bahanTayangUrl ||
                selectedSession.alatPeraga) && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📚</span>
                    Materi dan Alat
                  </h4>

                  <div className="space-y-2">
                    {selectedSession.bahanAjarUrl && (
                      <a
                        href={selectedSession.bahanAjarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <span>📄</span>
                        <span>Bahan Ajar</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}

                    {selectedSession.bahanTayangUrl && (
                      <a
                        href={selectedSession.bahanTayangUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <span>🎞️</span>
                        <span>Bahan Tayang (Slides)</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}

                    {selectedSession.alatPeraga && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span>🛠️</span>
                        <span>Alat Peraga: {selectedSession.alatPeraga}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attendance Info */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span>ℹ️</span>
                  Informasi Presensi
                </h4>
                <p className="text-sm text-gray-700">
                  Presensi dapat dilakukan <strong>1 jam sebelum</strong> hingga{" "}
                  <strong>1 jam setelah</strong> sesi berakhir.
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    Waktu presensi:{" "}
                    <strong>
                      {format(
                        subHours(
                          combineDateTime(
                            selectedSession.date,
                            selectedSession.startTime,
                          ),
                          1,
                        ),
                        "HH:mm",
                      )}{" "}
                      -{" "}
                      {format(
                        addHours(
                          combineDateTime(
                            selectedSession.date,
                            selectedSession.endTime,
                          ),
                          1,
                        ),
                        "HH:mm",
                      )}{" "}
                      WIB
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .fc {
          font-family: inherit;
        }

        .fc .fc-button {
          background-color: #3b82f6;
          border-color: #3b82f6;
          text-transform: capitalize;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .fc .fc-button:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        .fc .fc-button:disabled {
          background-color: #93c5fd;
          border-color: #93c5fd;
          opacity: 0.6;
        }

        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #1d4ed8;
          border-color: #1d4ed8;
        }

        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: #e5e7eb;
        }

        .fc-col-header-cell {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
          padding: 0.75rem;
        }

        .fc-daygrid-day-number {
          padding: 0.5rem;
          color: #374151;
          font-weight: 500;
        }

        .fc-day-today {
          background-color: #fef3c7 !important;
        }

        .fc-event {
          cursor: pointer;
          border-radius: 6px;
          padding: 4px 6px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .fc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
          opacity: 0.95;
        }

        .fc-event-time {
          font-weight: 600;
          font-size: 0.75rem;
        }

        .fc-event-title {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Fix text overflow in month view */
        .fc-daygrid-event {
          white-space: nowrap;
          overflow: hidden;
        }

        .fc-daygrid-event-dot {
          display: none;
        }

        .fc-event-title-container {
          overflow: hidden;
        }

        .fc-event-title {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Ensure events don't overflow cells in month view */
        .fc-daygrid-day-events {
          margin-top: 2px;
        }

        .fc-daygrid-event-harness {
          margin-bottom: 2px;
        }

        .calendar-container {
          padding: 1rem;
          background: white;
          border-radius: 0.5rem;
        }

        /* Time grid view styles */
        .fc-timegrid-event {
          border-radius: 4px;
          padding: 4px;
        }

        .fc-timegrid-event-harness {
          margin-right: 2px;
        }

        /* Make events more visible in week/day view */
        .fc-timegrid-slot {
          height: 3em;
        }

        /* Add pointer cursor to all interactive elements */
        .fc-event,
        .fc-daygrid-event,
        .fc-timegrid-event {
          cursor: pointer !important;
        }

        /* Better text display in time grid */
        .fc-timegrid-event .fc-event-title {
          white-space: normal;
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
}
