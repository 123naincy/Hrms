import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Login({ onLogin }) {
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmployeeCode");

    if (saved) {
      setEmployeeCode(saved);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        employeeCode,
        password,
      });

      const token = response.data.data.token;
      const user = response.data.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (remember) {
        localStorage.setItem(
          "rememberedEmployeeCode",
          employeeCode.trim().toUpperCase()
        );
      } else {
        localStorage.removeItem("rememberedEmployeeCode");
      }

      onLogin(user);
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        error?.response?.data?.message ||
          "Invalid Employee Code or Password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

       <div className="login-brand">

  <div className="brand-logo">
    <img
      src="/logo.png"
      alt="BHL Group"
    />
  </div>

  <div className="brand-content">

    <h1>HRMS</h1>

    <p>
      Human Resource
      <br />
      Management System
    </p>

    <span>
      Manage people. Track performance.
      <br />
      Build a better workplace.
    </span>

  </div>

  <div className="brand-footer">
    © 2026 BHL Group
  </div>

</div>

        {/* Right Section */}
        <div className="login-form-section">

          <div className="login-form-wrapper">

            <div className="mobile-logo">
              BHL
            </div>

            <div className="login-heading">
              <h2>Welcome Back</h2>

              <p>
                Sign in to access your HRMS account
              </p>
            </div>

            {error && (
              <div className="login-error">
                <span>!</span>
                {error}
              </div>
            )}

            {notice && (
              <div className="login-notice">
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Employee Code */}
              <div className="input-group">

                <label htmlFor="employeeCode">
                  Employee Code
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ID
                  </span>

                  <input
                    id="employeeCode"
                    type="text"
                    value={employeeCode}
                    onChange={(e) =>
                      setEmployeeCode(
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="Enter employee code"
                    autoComplete="username"
                    required
                  />

                </div>
              </div>

              {/* Password */}
              <div className="input-group">

                <div className="password-label">
                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() =>
                      setNotice(
                        "Please contact HR to reset your password."
                      )
                    }
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="input-wrapper">

                  <span className="input-icon">
                    *
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="show-password"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>
              </div>

              {/* Remember */}
              <div className="remember-row">

                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) =>
                      setRemember(event.target.checked)
                    }
                  />
                  <span>Remember me</span>
                </label>

              </div>

              {/* Login */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="arrow">
                      →
                    </span>
                  </>
                )}
              </button>

            </form>

            <div className="login-security">
              <span>🔒</span>
              Secure & protected access
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}