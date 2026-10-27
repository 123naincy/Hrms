import { useEffect, useState } from "react";
import { formatRole } from "../../utils/format";

const menuItems = {
  SUPER_ADMIN: [
    { label: "Dashboard", icon: "⌂", path: "/" },
    { label: "Employees", icon: "👥", path: "/employees" },
    { label: "Departments", icon: "▦", path: "/departments" },
    { label: "Designations", icon: "💼", path: "/designations" },
    { label: "Attendance", icon: "◷", path: "/employee/attendance" },
    { label: "Leave Management", icon: "▤", path: "/leave" },
    { label: "Payroll", icon: "₹", path: "/payroll" },
    { label: "Roles & Permissions", icon: "🔐", path: "/roles" },
    { label: "Analytics", icon: "▥", path: "/analytics" },
    { label: "Audit Logs", icon: "☷", path: "/audit" },
    { label: "Settings", icon: "⚙", path: "/settings" },
  ],

  ADMIN: [
    { label: "Dashboard", icon: "⌂", path: "/" },
    { label: "Employees", icon: "👥", path: "/employees" },
    { label: "Departments", icon: "▦", path: "/departments" },
    { label: "Designations", icon: "💼", path: "/designations" },
    { label: "Attendance", icon: "◷", path: "/employee/attendance" },
    { label: "Leave Management", icon: "▤", path: "/leave" },
    { label: "Payroll", icon: "₹", path: "/payroll" },
    { label: "Settings", icon: "⚙", path: "/settings" },
  ],

  HR: [
    { label: "Dashboard", icon: "⌂", path: "/" },
    { label: "Employees", icon: "👥", path: "/employees" },
    { label: "Attendance", icon: "◷", path: "/employee/attendance" },
    { label: "Leave Management", icon: "▤", path: "/leave" },
    { label: "Settings", icon: "⚙", path: "/settings" },
    { label: "Departments", icon: "▦", path: "/departments" },
    { label: "Designations", icon: "💼", path: "/designations" },
  ],

  MANAGER: [
    { label: "Dashboard", icon: "⌂", path: "/" },
    { label: "My Team", icon: "👥", path: "/my-team" },
    { label: "Team Attendance", icon: "◷", path: "/team-attendance" },
    { label: "Leave Approvals", icon: "▤", path: "/leave-approvals" },
    { label: "My Attendance", icon: "✓", path: "/employee/attendance" },
    { label: "My Leave", icon: "▧", path: "/my-leave" },
  ],

  EMPLOYEE: [
    { label: "Punch In", icon: "◷", path: "/employee/attendance" },
    { label: "My Leave", icon: "▤", path: "/my-leave" },
    { label: "My Profile", icon: "◉", path: "/profile" },
  ],
};

function Sidebar({ user, onLogout, isOpen }) {
  const role = user?.role || "EMPLOYEE";

  const items =
    menuItems[role] || menuItems.EMPLOYEE;

  const currentPath =
    window.location.pathname;

  const [active, setActive] = useState(
    currentPath
  );

  useEffect(() => {
    const sync = () => setActive(window.location.pathname);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const handleNavigation = (item) => {
    setActive(item.path);

    window.history.pushState(
      {},
      "",
      item.path
    );

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );
  };

  return (
    <aside
      className={`hrms-sidebar ${
        isOpen ? "open" : ""
      }`}
    >

      <div className="sidebar-brand">

        <div className="sidebar-logo">
          BHL
        </div>

        <div>
          <h2>BHL Group</h2>
          <span>Enterprise HRMS</span>
        </div>

      </div>

      <div className="sidebar-divider" />

      <nav className="sidebar-menu">

        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`sidebar-item ${
              active === item.path
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleNavigation(item)
            }
          >

            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>

          </button>
        ))}

      </nav>

      <div className="sidebar-bottom">

        <div className="sidebar-user">

          <div className="user-avatar">
            {user?.fullName
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div className="user-info">

            <strong>
              {user?.fullName || "User"}
            </strong>

            <span>
              {formatRole(role)}
            </span>

          </div>

        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;