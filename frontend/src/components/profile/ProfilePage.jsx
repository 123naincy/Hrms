import { useEffect, useState } from "react";
import {
  changePassword,
  getPayslips,
  getProfile,
  updateProfile,
} from "../../services/hr.service";
import { formatRole } from "../../utils/format";
import { Banner, PageFrame, formatDate } from "../common/PageFrame";

export default function ProfilePage({ user, onUserChange }) {
  const [profile, setProfile] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [form, setForm] = useState({ fullName: "", mobile: "" });
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          fullName: data.fullName || "",
          mobile: data.mobile || "",
        });
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load profile");
      });

    getPayslips({ mine: "true" })
      .then(setPayslips)
      .catch(() => setPayslips([]));
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      const updated = await updateProfile(form);
      setProfile(updated);
      const stored = {
        ...user,
        fullName: updated.fullName,
        email: updated.email,
        department: updated.department,
        designation: updated.designation,
      };
      localStorage.setItem("user", JSON.stringify(stored));
      onUserChange?.(stored);
      setMessage("Profile updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update profile");
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      await changePassword(password);
      setPassword({ currentPassword: "", newPassword: "" });
      setMessage("Password updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update password");
    }
  };

  return (
    <PageFrame
      eyebrow="BHL GROUP • PROFILE"
      title="My Profile"
      text="Your employee record, password, and payslips."
    >
      <Banner error={error} success={message} />

      <div className="hr-split">
        <div className="employees-card">
          <h2>Details</h2>
          {profile && (
            <dl className="hr-meta">
              <div><dt>Employee code</dt><dd>{profile.employeeCode}</dd></div>
              <div><dt>Email</dt><dd>{profile.email}</dd></div>
              <div><dt>Role</dt><dd>{formatRole(profile.role)}</dd></div>
              <div><dt>Department</dt><dd>{profile.department || "—"}</dd></div>
              <div><dt>Designation</dt><dd>{profile.designation || "—"}</dd></div>
              <div><dt>Joined</dt><dd>{formatDate(profile.joiningDate)}</dd></div>
            </dl>
          )}
          <form className="hr-form columns" onSubmit={saveProfile}>
            <input
              required
              value={form.fullName}
              onChange={(event) =>
                setForm({ ...form, fullName: event.target.value })
              }
            />
            <input
              required
              value={form.mobile}
              onChange={(event) =>
                setForm({ ...form, mobile: event.target.value })
              }
            />
            <button className="leave-primary-button" type="submit">
              Save profile
            </button>
          </form>
        </div>

        <div className="employees-card">
          <h2>Password</h2>
          <form className="hr-form columns" onSubmit={savePassword}>
            <input
              required
              type="password"
              placeholder="Current password"
              value={password.currentPassword}
              onChange={(event) =>
                setPassword({
                  ...password,
                  currentPassword: event.target.value,
                })
              }
            />
            <input
              required
              type="password"
              minLength="6"
              placeholder="New password"
              value={password.newPassword}
              onChange={(event) =>
                setPassword({
                  ...password,
                  newPassword: event.target.value,
                })
              }
            />
            <button className="leave-primary-button" type="submit">
              Update password
            </button>
          </form>
        </div>
      </div>

      <div className="employees-card">
        <h2>My payslips</h2>
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Gross</th>
                <th>Net</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan="6">No payslips yet.</td>
                </tr>
              ) : (
                payslips.map((row) => (
                  <tr key={row._id}>
                    <td>
                      {row.month}/{row.year}
                    </td>
                    <td>{row.presentDays}</td>
                    <td>{row.absentDays}</td>
                    <td>{row.gross}</td>
                    <td>{row.net}</td>
                    <td>{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageFrame>
  );
}
