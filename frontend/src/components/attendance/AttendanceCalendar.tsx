"use client";

import {
  AttendanceDay,
} from "@/types/attendance";

interface Props {
  days: AttendanceDay[];
}

export default function AttendanceCalendar({
  days,
}: Props) {

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <h3 className="text-lg font-semibold">
        Attendance Calendar
      </h3>

      <div className="mt-5 grid grid-cols-7 gap-2">

        {[
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ].map(
          (day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-500"
            >
              {day}
            </div>
          )
        )}

        {days.map(
          (day) => {

            const date =
              new Date(day.date);

            return (
              <div
                key={
                  day.date
                }
                className={`min-h-20 rounded-lg border p-2 ${getStatusClass(
                  day.status
                )}`}
              >

                <div className="text-sm font-semibold">
                  {
                    date.getDate()
                  }
                </div>

                <div className="mt-1 text-[10px] font-medium">
                  {day.status.replace(
                    "_",
                    " "
                  )}
                </div>

                {day.workingHours >
                  0 && (
                    <div className="mt-1 text-[10px]">
                      {
                        day.workingHours
                      }h
                    </div>
                  )}

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}


function getStatusClass(
  status: string
) {

  switch (status) {

    case "PRESENT":
      return "bg-green-50 border-green-200";

    case "ABSENT":
      return "bg-red-50 border-red-200";

    case "LEAVE":
      return "bg-blue-50 border-blue-200";

    case "HALF_DAY":
      return "bg-yellow-50 border-yellow-200";

    case "WEEK_OFF":
      return "bg-gray-100 border-gray-200";

    case "HOLIDAY":
      return "bg-purple-50 border-purple-200";

    case "NOT_PUNCHED":
      return "bg-orange-50 border-orange-200";

    default:
      return "bg-white border-gray-200";
  }
}