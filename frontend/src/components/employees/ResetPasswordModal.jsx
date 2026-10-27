import { useState } from "react";
import { resetEmployeePassword } from "../../services/employee.service";

function ResetPasswordModal({
  employee,
  onClose,
  onSuccess,
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");


    if (!password) {
      setError(
        "Please enter a new password."
      );
      return;
    }


    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }


    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }


    try {

      setLoading(true);

      await resetEmployeePassword(
        employee._id,
        password
      );

      setSuccess(
        "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");


      setTimeout(() => {
        onSuccess?.();
      }, 800);

    } catch (error) {

      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reset password."
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
          e.target === e.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div className="employee-reset-password-modal">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="employee-modal-header">

          <div>

            <p className="dashboard-eyebrow">
              ACCOUNT SECURITY
            </p>

            <h2>
              Reset Password
            </h2>

            <p>
              Set a new password for this employee.
            </p>

          </div>


          <button
            type="button"
            className="employee-modal-close"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>

        </div>


        {/* =================================================
            EMPLOYEE
        ================================================= */}

        <div className="reset-password-employee">

          <div className="reset-password-avatar">
            {employee?.fullName
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <div>

            <strong>
              {employee?.fullName}
            </strong>

            <span>
              {employee?.employeeCode}
            </span>

          </div>

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
            SUCCESS
        ================================================= */}

        {success && (
          <div className="employee-form-success">

            <span>✓</span>

            <div>
              {success}
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

          {/* PASSWORD */}

          <div className="employee-form-group">

            <label>
              New Password
            </label>

            <div className="password-input-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter new password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="employee-form-group">

            <label>
              Confirm Password
            </label>

            <div className="password-input-wrapper">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
              >
                {showConfirmPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>


          {/* PASSWORD RULE */}

          <div className="password-requirement">

            <span>•</span>

            Password must contain at least
            6 characters.

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
                ? "Updating..."
                : "Reset Password"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ResetPasswordModal;