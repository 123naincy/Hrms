import { useEffect, useState } from "react";
import {
  getEmployees,
  updateEmployee,
} from "../../services/employee.service";
import WeekOffPicker from "./WeekOffPicker";

function EditEmployeeModal({
  employee,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    department: "",
    designation: "",
    role: "EMPLOYEE",
    joiningDate: "",
    managerId: "",
    weeklyOffs: [],
  });

  const [managers, setManagers] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // LOAD EMPLOYEE DATA
  // =========================================================

  useEffect(() => {
    if (!employee) return;

    setForm({
      fullName: employee.fullName || "",
      email: employee.email || "",
      mobile: employee.mobile || "",
      department: employee.department || "",
      designation: employee.designation || "",
      role: employee.role || "EMPLOYEE",
      joiningDate: employee.joiningDate
        ? employee.joiningDate.substring(0, 10)
        : "",
      managerId:
        employee.managerId?._id ||
        employee.managerId ||
        "",
      weeklyOffs: Array.isArray(employee.weeklyOffs)
        ? employee.weeklyOffs
        : [],
    });
  }, [employee]);

  useEffect(() => {
    getEmployees()
      .then((rows) => {
        setManagers(
          rows.filter(
            (item) =>
              item.isActive &&
              item._id !== employee?._id &&
              ["SUPER_ADMIN", "ADMIN", "HR", "MANAGER"].includes(item.role)
          )
        );
      })
      .catch(() => setManagers([]));
  }, [employee]);


  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await updateEmployee(
        employee._id,
        {
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          department:
            form.department || undefined,
          designation:
            form.designation || undefined,
          role: form.role,
          joiningDate:
            form.joiningDate || undefined,
          managerId: form.managerId || null,
          weeklyOffs: form.weeklyOffs,
        }
      );

      onSuccess?.();

    } catch (error) {
      console.error(
        "UPDATE EMPLOYEE ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update employee."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="employee-modal-overlay"
      onMouseDown={(e) => {
        if (
          e.target ===
          e.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="employee-modal">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="employee-modal-header">

          <div>

            <p className="dashboard-eyebrow">
              EMPLOYEE MANAGEMENT
            </p>

            <h2>
              Edit Employee
            </h2>

            <p>
              Update employee information.
            </p>

          </div>


          <button
            type="button"
            className="employee-modal-close"
            onClick={onClose}
          >
            ×
          </button>

        </div>


        {/* =================================================
            EMPLOYEE CODE
        ================================================= */}

        <div className="employee-code-display">

          <span>
            Employee Code
          </span>

          <strong>
            {employee?.employeeCode}
          </strong>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="employee-form-error">

            <span>!</span>

            <div>
              {error}
            </div>

          </div>
        )}


        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="employee-form"
          onSubmit={handleSubmit}
        >

          {/* BASIC */}

          <div className="employee-form-section">

            <div className="employee-form-section-title">
              Basic Information
            </div>

            <div className="employee-form-grid">

              <FormField
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full name"
                required
              />

              <FormField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />

              <FormField
                label="Mobile"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Mobile"
                required
              />

            </div>

          </div>


          {/* ORGANIZATION */}

          <div className="employee-form-section">

            <div className="employee-form-section-title">
              Organization Details
            </div>

            <div className="employee-form-grid">

              <FormField
                label="Department"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Department"
              />

              <FormField
                label="Designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="Designation"
              />

              <div className="employee-form-group">
                <label>Reporting manager</label>
                <select
                  name="managerId"
                  value={form.managerId}
                  onChange={handleChange}
                >
                  <option value="">None</option>
                  {managers.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.fullName} ({item.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="employee-form-group">

                <label>
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >

                  <option value="EMPLOYEE">
                    Employee
                  </option>

                  <option value="MANAGER">
                    Manager
                  </option>

                  <option value="HR">
                    HR
                  </option>

                  <option value="ADMIN">
                    Admin
                  </option>

                  <option value="SUPER_ADMIN">
                    Super Admin
                  </option>

                </select>

              </div>


              <FormField
                label="Joining Date"
                name="joiningDate"
                type="date"
                value={form.joiningDate}
                onChange={handleChange}
              />

            </div>

            <WeekOffPicker
              value={form.weeklyOffs}
              onChange={(weeklyOffs) =>
                setForm((current) => ({ ...current, weeklyOffs }))
              }
            />

          </div>


          {/* ACTIONS */}

          <div className="employee-modal-actions">

            <button
              type="button"
              className="employee-cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="employee-submit-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


// =========================================================
// FORM FIELD
// =========================================================

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div className="employee-form-group">

      <label>

        {label}

        {required && (
          <span> *</span>
        )}

      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />

    </div>
  );
}

export default EditEmployeeModal;