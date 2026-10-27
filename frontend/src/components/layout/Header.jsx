import { useEffect, useState } from "react";
import { navigate } from "../../utils/navigate";
import { formatRole } from "../../utils/format";
import {
  getLeaveRequests,
  getMyLeaves,
} from "../../services/hr.service";

function Header({ user, onLogout, onMenuClick }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState([]);

  const role = user?.role || "EMPLOYEE";
  const formattedRole = formatRole(role);
  const canReview = ["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"].includes(role);

  useEffect(() => {
    let active = true;
    const load = canReview
      ? getLeaveRequests("PENDING")
      : getMyLeaves();

    load
      .then((rows) => {
        if (!active) return;
        const pending = (rows || []).filter(
          (item) => item.status === "PENDING"
        );
        setNotes(pending.slice(0, 5));
      })
      .catch(() => {
        if (active) setNotes([]);
      });

    return () => {
      active = false;
    };
  }, [canReview, role]);

  return (
    <header className="hrms-header">

      {/* Mobile Menu */}
      <button
        type="button"
        className="mobile-menu-button"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Page / Brand */}
      <div className="header-left">
        <div className="header-title">
          <h1>HRMS</h1>
          <span>Human Resource Management System</span>
        </div>
      </div>

      {/* Header Right */}
      <div className="header-right">

        {/* Notifications */}
        <div className="profile-wrapper">
          <button
            type="button"
            className="header-icon-button"
            title="Notifications"
            onClick={() => {
              setShowNotes((open) => !open);
              setShowProfile(false);
            }}
          >
            🔔
            {notes.length > 0 && <span className="notification-dot" />}
          </button>

          {showNotes && (
            <div className="profile-dropdown notes-dropdown">
              <strong>Notifications</strong>
              {notes.length === 0 ? (
                <p>No pending leave requests.</p>
              ) : (
                notes.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setShowNotes(false);
                      navigate(
                        canReview
                          ? role === "MANAGER"
                            ? "/leave-approvals"
                            : "/leave"
                          : "/my-leave"
                      );
                    }}
                  >
                    {item.leaveType} · {item.reason}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="profile-wrapper">

          <button
            type="button"
            className="profile-button"
            onClick={() => {
              setShowProfile((prev) => !prev);
              setShowNotes(false);
            }}
          >

            <div className="profile-avatar">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="profile-details">
              <strong>
                {user?.fullName || "User"}
              </strong>

              <span>
                {formattedRole}
              </span>
            </div>

            <span className="profile-arrow">
              {showProfile ? "▲" : "▼"}
            </span>

          </button>

          {showProfile && (
            <div className="profile-dropdown">

              <div className="dropdown-user">
                <div className="profile-avatar large">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div>
                  <strong>
                    {user?.fullName || "User"}
                  </strong>

                  <span>
                    {user?.email || ""}
                  </span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setShowProfile(false);
                  navigate("/profile");
                }}
              >
                👤 My Profile
              </button>

              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
              >
                ⚙ Settings
              </button>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item logout-dropdown"
                onClick={onLogout}
              >
                ↪ Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Header;