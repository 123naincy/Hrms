import { useEffect, useState } from "react";
import { getAuditLogs } from "../../services/hr.service";
import { Banner, PageFrame, employeeName, formatDate } from "../common/PageFrame";

export default function AuditPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuditLogs()
      .then(setRows)
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load audit logs");
      });
  }, []);

  return (
    <PageFrame
      eyebrow="BHL GROUP • COMPLIANCE"
      title="Audit Logs"
      text="Successful create, update, and delete actions recorded from the API."
    >
      <Banner error={error} />
      <div className="employees-card">
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>When</th>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Path</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="6">No audit events yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id}>
                    <td>{formatDate(row.createdAt)}</td>
                    <td>{employeeName(row.userId)}</td>
                    <td>{row.role || "—"}</td>
                    <td>{row.method}</td>
                    <td>{row.path}</td>
                    <td>{row.statusCode}</td>
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
