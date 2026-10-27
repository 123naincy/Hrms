import TodayAttendance from "./components/attendance/TodayAttendance";
import AttendanceBoard from "./components/attendance/AttendanceBoard";
import DashboardHome from "./components/dashboard/DashboardHome";
import EmployeesPage from "./components/employees/EmployeesPage";
import LeavePage from "./components/leaves/LeavePage";
import DepartmentsPage from "./components/departments/DepartmentsPage";
import DesignationsPage from "./components/designations/DesignationsPage";
import PayrollPage from "./components/payroll/PayrollPage";
import RolesPage from "./components/roles/RolesPage";
import AnalyticsPage from "./components/analytics/AnalyticsPage";
import AuditPage from "./components/audit/AuditPage";
import SettingsPage from "./components/settings/SettingsPage";
import TeamPage from "./components/team/TeamPage";
import ProfilePage from "./components/profile/ProfilePage";
import {
  getOrgAttendance,
  getTeamAttendance,
} from "./services/hr.service";
import { PageFrame } from "./components/common/PageFrame";
import { navigate } from "./utils/navigate";

const orgRoles = ["SUPER_ADMIN", "ADMIN", "HR"];

const pageAccess = {
  "/employees": ["SUPER_ADMIN", "ADMIN", "HR"],
  "/departments": ["SUPER_ADMIN", "ADMIN", "HR"],
  "/designations": ["SUPER_ADMIN", "ADMIN", "HR"],
  "/payroll": ["SUPER_ADMIN", "ADMIN"],
  "/roles": ["SUPER_ADMIN"],
  "/analytics": ["SUPER_ADMIN"],
  "/audit": ["SUPER_ADMIN"],
  "/my-team": ["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"],
  "/team-attendance": ["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"],
  "/leave-approvals": ["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"],
};

function AccessDenied() {
  return (
    <PageFrame
      eyebrow="BHL GROUP • ACCESS"
      title="Access restricted"
      text="Your role does not include this module."
      extra={
        <button
          type="button"
          className="leave-primary-button"
          onClick={() => navigate("/")}
        >
          Back to dashboard
        </button>
      }
    />
  );
}

function AppRouter({ user, path, onUserChange }) {
  const allowed = pageAccess[path];

  if (allowed && !allowed.includes(user?.role)) {
    return <AccessDenied />;
  }

  switch (path) {
    case "/employee/attendance":
      return (
        <>
          <TodayAttendance
            user={user}
            autoStart={user?.role === "EMPLOYEE"}
          />
          {orgRoles.includes(user?.role) && (
            <AttendanceBoard
              eyebrow="BHL GROUP • ATTENDANCE"
              title="Organization Attendance"
              text="Today's status for every active employee."
              loader={getOrgAttendance}
            />
          )}
        </>
      );

    case "/employees":
      return <EmployeesPage user={user} />;

    case "/departments":
      return <DepartmentsPage />;

    case "/designations":
      return <DesignationsPage />;

    case "/leave":
      return <LeavePage user={user} mode="manage" />;

    case "/payroll":
      return <PayrollPage />;

    case "/roles":
      return <RolesPage />;

    case "/analytics":
      return <AnalyticsPage user={user} />;

    case "/audit":
      return <AuditPage />;

    case "/settings":
      return <SettingsPage user={user} />;

    case "/my-team":
      return <TeamPage />;

    case "/team-attendance":
      return (
        <AttendanceBoard
          eyebrow="BHL GROUP • TEAM"
          title="Team Attendance"
          text="Attendance for employees who report to you."
          loader={getTeamAttendance}
        />
      );

    case "/leave-approvals":
      return <LeavePage user={user} mode="approvals" />;

    case "/my-leave":
      return <LeavePage user={user} mode="mine" />;

    case "/profile":
      return (
        <ProfilePage user={user} onUserChange={onUserChange} />
      );

    case "/":
    default:
      return <DashboardHome user={user} />;
  }
}

export default AppRouter;
