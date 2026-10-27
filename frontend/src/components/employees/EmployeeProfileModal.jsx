import { formatRole } from "../../utils/format";

function EmployeeProfileModal({
  employee,
  onClose,
  onEdit,
  onStatusChange,
}) {
  if (!employee) return null;

  const getRoleLabel = (role) => {
    if (!role) return "—";

    return formatRole(role);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div
      className="employee-profile-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="employee-profile-modal">

        {/* HEADER */}

        <div className="employee-profile-header">

          <div className="employee-profile-user">

            <div className="employee-profile-avatar">
              {employee.fullName
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div>
              <p className="dashboard-eyebrow">
                EMPLOYEE PROFILE
              </p>

              <h2>
                {employee.fullName}
              </h2>

              <span>
                {employee.employeeCode}
              </span>
            </div>

          </div>

          <button
            type="button"
            className="employee-modal-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        {/* STATUS */}

        <div className="employee-profile-status-row">

          <span
            className={`status-badge ${
              employee.isActive
                ? "active"
                : "inactive"
            }`}
          >
            {employee.isActive
              ? "Active"
              : "Inactive"}
          </span>

          <span className="role-badge">
            {getRoleLabel(employee.role)}
          </span>

        </div>


        {/* INFORMATION */}

        <div className="employee-profile-grid">

          <ProfileItem
            label="Email"
            value={employee.email}
          />

          <ProfileItem
            label="Mobile"
            value={employee.mobile}
          />

          <ProfileItem
            label="Department"
            value={employee.department}
          />

          <ProfileItem
            label="Designation"
            value={employee.designation}
          />

          <ProfileItem
            label="Role"
            value={getRoleLabel(employee.role)}
          />

          <ProfileItem
            label="Joining Date"
            value={formatDate(
              employee.joiningDate
            )}
          />

        </div>


        {/* ACTIONS */}

        <div className="employee-profile-actions">

          <button
            type="button"
            className="employee-cancel-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="employee-submit-button"
            onClick={() => {
              onClose();
              onEdit(employee);
            }}
          >
            Edit Employee
          </button>

          <button
            type="button"
            className="employee-profile-status-button"
            onClick={() =>
              onStatusChange(employee)
            }
          >
            {employee.isActive
              ? "Deactivate"
              : "Activate"}
          </button>

        </div>

      </div>
    </div>
  );
}


function ProfileItem({
  label,
  value,
}) {
  return (
    <div className="employee-profile-item">

      <span>
        {label}
      </span>

      <strong>
        {value || "—"}
      </strong>

    </div>
  );
}


export default EmployeeProfileModal;