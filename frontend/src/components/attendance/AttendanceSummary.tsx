"use client";

import {
  AttendanceSummary as SummaryType,
} from "../../types/attendance";

interface Props {
  summary: SummaryType;
}

export default function AttendanceSummary({
  summary,
}: Props) {

  const items = [
    {
      label: "Present",
      value: summary.present,
    },

    {
      label: "Absent",
      value: summary.absent,
    },

    {
      label: "Half Day",
      value: summary.halfDay,
    },

    {
      label: "Leave",
      value: summary.leave,
    },

    {
      label: "Week-Off",
      value: summary.weekOff,
    },

    {
      label: "Holiday",
      value: summary.holiday,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

      {items.map(
        (item) => (

          <div
            key={item.label}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >

            <p className="text-sm text-gray-500">
              {item.label}
            </p>

            <p className="mt-1 text-2xl font-bold">
              {item.value}
            </p>

          </div>

        )
      )}

    </div>
  );
}