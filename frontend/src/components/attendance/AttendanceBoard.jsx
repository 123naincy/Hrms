import { useEffect, useState } from "react";
import { Banner, PageFrame } from "../common/PageFrame";

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AttendanceBoard({
  title,
  text,
  eyebrow,
  loader,
}) {
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    loader(date)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) {
          setError(err?.response?.data?.message || "Failed to load attendance");
        }
      });

    return () => {
      active = false;
    };
  }, [date, loader]);

  const summary = data?.summary;

  return (
    <PageFrame eyebrow={eyebrow} title={title} text={text}>
      <Banner error={error} />
      <div className="employees-card">
        <div className="hr-form">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          {summary && (
            <div className="hr-pills">
              <span>Total {summary.total}</span>
              <span>Present {summary.present}</span>
              <span>Leave {summary.leave}</span>
              <span>Absent {summary.absent}</span>
              <span>Week off {summary.weekOff || 0}</span>
              <span>WFH {summary.workFromHome || 0}</span>
              <span>Meeting {summary.meeting || 0}</span>
              <span>Not marked {summary.notMarked}</span>
            </div>
          )}
        </div>
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Status</th>
                <th>Mode</th>
                <th>In</th>
                <th>Out</th>
                <th>Location</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {!data?.rows?.length ? (
                <tr>
                  <td colSpan="8">No attendance rows for this date.</td>
                </tr>
              ) : (
                data.rows.map((row) => (
                  <tr key={row.employeeId}>
                    <td>
                      {row.fullName}
                      <small className="hr-code"> {row.employeeCode}</small>
                    </td>
                    <td>{row.department || "—"}</td>
                    <td>
                      <span className={`hr-status ${String(row.status).toLowerCase()}`}>
                        {row.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td>
                      {row.workMode === "WORK_FROM_HOME"
                        ? "Work from home"
                        : row.workMode === "MEETING"
                          ? "Meeting"
                          : row.workMode === "OFFICE"
                            ? "Office"
                            : "—"}
                    </td>
                    <td>{formatTime(row.punchIn)}</td>
                    <td>{formatTime(row.punchOut)}</td>
                    <td>
                      {[row.punchInLocation, row.punchOutLocation]
                        .filter(Boolean)
                        .filter((value, index, list) => list.indexOf(value) === index)
                        .join(" → ") || "—"}
                    </td>
                    <td>{Number(row.workingHours || 0).toFixed(2)}</td>
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
