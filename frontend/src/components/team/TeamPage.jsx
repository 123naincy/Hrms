import { useEffect, useState } from "react";
import { getMyTeam } from "../../services/hr.service";
import { Banner, PageFrame, formatDate } from "../common/PageFrame";

export default function TeamPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyTeam()
      .then(setRows)
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load your team");
      });
  }, []);

  return (
    <PageFrame
      eyebrow="BHL GROUP • TEAM"
      title="My Team"
      text="Employees who report to you. Assign a reporting manager from the employee record."
    >
      <Banner error={error} />
      <div className="employees-card">
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Email</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="6">No direct reports yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id}>
                    <td>{row.employeeCode}</td>
                    <td>{row.fullName}</td>
                    <td>{row.department || "—"}</td>
                    <td>{row.designation || "—"}</td>
                    <td>{row.email}</td>
                    <td>{formatDate(row.joiningDate)}</td>
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
