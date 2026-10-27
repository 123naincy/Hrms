import { useEffect, useMemo, useState } from "react";
import { getEmployees } from "../../services/employee.service";
import api from "../../services/api";
import {
  applyLeave,
  approveLeave,
  cancelLeave,
  getLeaveRequests,
  getMyLeaveBalances,
  getMyLeaves,
  rejectLeave,
} from "../../services/hr.service";
import { Banner, PageFrame, employeeName, formatDate } from "../common/PageFrame";

const emptyForm = {
  leaveType: "EL",
  startDate: "",
  endDate: "",
  dayType: "FULL_DAY",
  reason: "",
};

export default function LeavePage({ user, mode = "manage" }) {
  const role = user?.role || "EMPLOYEE";
  const isMine = mode === "mine" || role === "EMPLOYEE";
  const isApprovals = mode === "approvals";
  const [rows, setRows] = useState([]);
  const [balances, setBalances] = useState([]);
  const [filter, setFilter] = useState(isApprovals ? "PENDING" : "ALL");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [employees, setEmployees] = useState([]);
  const [balanceEmployeeId, setBalanceEmployeeId] = useState("");

  const load = async () => {
    const requests = isMine
      ? await getMyLeaves()
      : await getLeaveRequests(isApprovals ? "PENDING" : undefined);
    setRows(Array.isArray(requests) ? requests : []);

    if (isMine) {
      const balanceRows = await getMyLeaveBalances().catch(() => []);
      setBalances(Array.isArray(balanceRows) ? balanceRows : []);
    }
  };

  useEffect(() => {
    load().catch((err) => {
      setError(err?.response?.data?.message || "Failed to load leave");
    });

    if (!isMine) {
      getEmployees()
        .then((rows) => setEmployees(rows.filter((item) => item.isActive)))
        .catch(() => setEmployees([]));
    }
  }, [isMine, isApprovals]);

  const initializeBalances = async () => {
    if (!balanceEmployeeId) return;

    try {
      setError("");
      setMessage("");
      await api.post("/leave-balances/initialize", {
        employeeId: balanceEmployeeId,
      });
      setMessage("Leave balances initialized.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not initialize leave balances. Seed the leave policy first."
      );
    }
  };

  const visible = useMemo(() => {
    if (filter === "ALL") return rows;
    return rows.filter((row) => row.status === filter);
  }, [rows, filter]);

  const pending = rows.filter((row) => row.status === "PENDING").length;

  const submit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      await applyLeave(form);
      setForm(emptyForm);
      setShowForm(false);
      setMessage("Leave request submitted.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not apply leave");
    }
  };

  const decide = async (id, action) => {
    try {
      setError("");
      if (action === "approve") {
        const remarks = window.prompt("Approval remarks", "Approved") || "";
        await approveLeave(id, remarks);
      } else {
        const reason = window.prompt("Rejection reason");
        if (!reason) return;
        await rejectLeave(id, reason);
      }
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update leave");
    }
  };

  const cancel = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;

    try {
      await cancelLeave(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not cancel leave");
    }
  };

  const title = isApprovals
    ? "Leave Approvals"
    : isMine
      ? "My Leave"
      : "Leave Management";

  return (
    <PageFrame
      eyebrow="BHL GROUP • LEAVE"
      title={title}
      text={
        isApprovals
          ? "Review pending leave from your team."
          : "Balances, requests, and approvals in one place."
      }
      extra={
        isMine ? (
          <button
            type="button"
            className="leave-primary-button"
            onClick={() => setShowForm((value) => !value)}
          >
            Apply leave
          </button>
        ) : null
      }
    >
      <Banner error={error} success={message} />

      <div className="hr-pills">
        <span>Requests {rows.length}</span>
        <span>Pending {pending}</span>
        {balances.map((item) => (
          <span key={item._id || item.leaveType}>
            {item.leaveType}: {item.available} available
          </span>
        ))}
      </div>

      {showForm && (
        <form className="employees-card hr-form columns" onSubmit={submit}>
          <select
            value={form.leaveType}
            onChange={(event) =>
              setForm({ ...form, leaveType: event.target.value })
            }
          >
            <option value="EL">Earned Leave</option>
            <option value="CSL">Casual / Sick Leave</option>
            <option value="MATERNITY">Maternity</option>
            <option value="BEREAVEMENT">Bereavement</option>
          </select>
          <input
            required
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm({ ...form, startDate: event.target.value })
            }
          />
          <input
            required
            type="date"
            value={form.endDate}
            onChange={(event) =>
              setForm({ ...form, endDate: event.target.value })
            }
          />
          <select
            value={form.dayType}
            onChange={(event) =>
              setForm({ ...form, dayType: event.target.value })
            }
          >
            <option value="FULL_DAY">Full day</option>
            <option value="FIRST_HALF">First half</option>
            <option value="SECOND_HALF">Second half</option>
          </select>
          <input
            required
            minLength="3"
            placeholder="Reason"
            value={form.reason}
            onChange={(event) =>
              setForm({ ...form, reason: event.target.value })
            }
          />
          <button className="leave-primary-button" type="submit">
            Submit request
          </button>
        </form>
      )}

      {!isMine && !isApprovals && (
        <div className="employees-card hr-form">
          <select
            value={balanceEmployeeId}
            onChange={(event) => setBalanceEmployeeId(event.target.value)}
          >
            <option value="">Initialize balances for...</option>
            {employees.map((item) => (
              <option key={item._id} value={item._id}>
                {item.fullName} ({item.employeeCode})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="leave-primary-button"
            onClick={initializeBalances}
          >
            Initialize balances
          </button>
        </div>
      )}

      <div className="employees-card">
        {!isApprovals && (
          <div className="hr-form">
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="ALL">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        )}
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                {!isMine && <th>Employee</th>}
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={isMine ? 7 : 8}>No leave requests.</td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr key={row._id}>
                    {!isMine && <td>{employeeName(row.employeeId)}</td>}
                    <td>{row.leaveType}</td>
                    <td>{formatDate(row.startDate)}</td>
                    <td>{formatDate(row.endDate)}</td>
                    <td>{row.chargeableDays}</td>
                    <td>{row.reason}</td>
                    <td>
                      <span className={`hr-status ${String(row.status).toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="hr-actions">
                      {!isMine && row.status === "PENDING" && (
                        <>
                          <button type="button" className="hr-link" onClick={() => decide(row._id, "approve")}>
                            Approve
                          </button>
                          <button type="button" className="hr-link" onClick={() => decide(row._id, "reject")}>
                            Reject
                          </button>
                        </>
                      )}
                      {isMine && row.status === "PENDING" && (
                        <button type="button" className="hr-link" onClick={() => cancel(row._id)}>
                          Cancel
                        </button>
                      )}
                    </td>
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
