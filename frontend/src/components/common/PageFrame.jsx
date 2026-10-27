export function PageFrame({
  eyebrow,
  title,
  text,
  extra,
  children,
}) {
  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <p className="dashboard-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}

export function Banner({ error, success, children }) {
  if (!error && !success && !children) {
    return null;
  }

  return (
    <div className={`hr-banner ${error ? "error" : "success"}`}>
      {error || success || children}
    </div>
  );
}

export function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function employeeName(employee) {
  if (!employee) return "—";
  if (typeof employee === "string") return employee;
  return employee.fullName || employee.employeeCode || "—";
}
