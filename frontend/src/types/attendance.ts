export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LEAVE"
  | "WEEK_OFF"
  | "HOLIDAY"
  | "NOT_PUNCHED"
  | "UPCOMING";

export interface TodayAttendance {
  date: string;

  status: AttendanceStatus;

  leaveType?: string | null;

  leaveRequestId?: string | null;

  punchIn?: string | null;

  punchOut?: string | null;

  totalMinutes: number;

  workingHours: number;

  canPunchIn: boolean;

  canPunchOut: boolean;
}

export interface AttendanceDay {
  date: string;

  status: AttendanceStatus;

  punchIn?: string | null;

  punchOut?: string | null;

  totalMinutes: number;

  workingHours: number;

  leaveType?: string | null;

  leaveRequestId?: string | null;

  holidayName?: string | null;

  source: string;
}

export interface AttendanceSummary {
  present: number;

  absent: number;

  halfDay: number;

  leave: number;

  weekOff: number;

  holiday: number;

  totalWorkingMinutes: number;

  totalWorkingHours: number;
}

export interface MonthlyAttendance {
  year: number;

  month: number;

  totalDays: number;

  summary: AttendanceSummary;

  days: AttendanceDay[];
}