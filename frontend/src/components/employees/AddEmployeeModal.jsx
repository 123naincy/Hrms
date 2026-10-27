import { useState } from "react";
import { createEmployee } from "../../services/employee.service";
import WeekOffPicker from "./WeekOffPicker";

const initialForm = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  role: "EMPLOYEE",
  department: "",
  designation: "",
  joiningDate: "",
  isActive: true,
  weeklyOffs: [0],
};

function AddEmployeeModal({
  onClose,
  onSuccess,
}) {
  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
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

      await createEmployee({
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobile,
        password:
          form.password || undefined,
        role: form.role,
        department:
          form.department || undefined,
        designation:
          form.designation || undefined,
        joiningDate:
          form.joiningDate || undefined,
        weeklyOffs: form.weeklyOffs,
      });

      onSuccess?.();

    } catch (error) {

      console.error(
        "CREATE EMPLOYEE ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create employee."
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
              Add Employee
            </h2>

            <p>
              Create a new employee account.
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

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

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
                placeholder="Enter full name"
                required
              />


              <FormField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="employee@company.com"
                required
              />


              <FormField
                label="Mobile"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
              />

            </div>

          </div>


          {/* =================================================
              LOGIN INFORMATION
          ================================================= */}

          <div className="employee-form-section">

            <div className="employee-form-section-title">
              Login Information
            </div>


            <div className="employee-form-grid">

              <FormField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave empty for default password"
              />


              <div className="employee-form-group">

                <label>
                  Role
                  <span> *</span>
                </label>


                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
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

            </div>

          </div>


          {/* =================================================
              ORGANIZATION
          ================================================= */}

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
                placeholder="Enter department"
              />


              <FormField
                label="Designation"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="Enter designation"
              />


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


          {/* =================================================
              STATUS
          ================================================= */}

          <div className="employee-active-row">

            <div>

              <strong>
                Account Status
              </strong>

              <span>
                Allow this employee to login
              </span>

            </div>


            <label className="employee-switch">

              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />

              <span />

            </label>

          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}

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
                ? "Creating..."
                : "Create Employee"}
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


export default AddEmployeeModal;