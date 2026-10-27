import { useEffect, useState } from "react";
import { getDashboard } from "../../services/hr.service";
import { navigate } from "../../utils/navigate";
import { formatRole } from "../../utils/format";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const pieColors = [
  "#3b6cff",
  "#7aa0ff",
  "#b9ccff",
  "#12b76a",
  "#8b9cff",
];

function DashIcon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const shapes = {
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="3.5" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a3.5 3.5 0 0 1 0 6.74" />
      </>
    ),
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="8" r="4" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.5 2.5 4.5-5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6l4 2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 14 4-4 3 3 5-6" />
      </>
    ),
    pie: (
      <>
        <path d="M12 3a9 9 0 1 0 9 9h-9V3z" />
        <path d="M14 3.5a9 9 0 0 1 6.5 6.5H14V3.5z" />
      </>
    ),
    building: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 21v-4h6v4M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 10h18M16 15h2" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </>
    ),
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    activity: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  };

  return <svg {...common}>{shapes[name] || shapes.activity}</svg>;
}

function activityIconName(icon) {
  const map = {
    "✓": "check",
    "▤": "calendar",
    "👤": "user",
    "▦": "grid",
    "💼": "briefcase",
    "₹": "wallet",
    "⚙": "settings",
    "📅": "calendar",
    "◉": "user",
    "🔐": "lock",
    "◷": "clock",
    "✕": "activity",
  };

  return map[icon] || "activity";
}

function DashboardHome({ user, embedded = false }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch((error) => {
        console.error("Dashboard load failed:", error);
      });
  }, []);

  const attendanceTrend = stats?.attendanceTrend || [];
  const departmentData = stats?.departmentData || [];
  const leaveData = stats?.leaveData || [];
  const employeeGrowth = stats?.employeeGrowth || [];

  const role = user?.role || "EMPLOYEE";
  const isSelf = role === "EMPLOYEE";
  const isTeam = role === "MANAGER";

  const roleName = formatRole(role);
  const selfStatus = stats?.presentToday
    ? "Present"
    : stats?.onLeave
      ? "On Leave"
      : stats?.absentToday
        ? "Absent"
        : stats
          ? "Not marked"
          : "—";

  return (
    <div className="glass-dashboard">

      {/* =====================================================
          WELCOME
      ===================================================== */}

      {!embedded && (
      <section className="glass-welcome">

        <div>
          <div className="dashboard-eyebrow">
            BHL GROUP • ENTERPRISE HRMS
          </div>

          <h1>
            Welcome back,{" "}
            <span>{user?.fullName || roleName}</span>
          </h1>

          <p>
            Here's an overview of your HRMS activity today.
          </p>
        </div>

        <div className="glass-date">
          <span className="date-icon">
            <DashIcon name="calendar" size={18} />
          </span>
          <div>
            <span>Today</span>
            <strong>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>

      </section>
      )}


      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <section className="glass-kpi-grid">

        <GlassKpi
          icon="users"
          tone="blue"
          label={isSelf ? "Today" : isTeam ? "My Team" : "Total Employees"}
          value={isSelf ? selfStatus : String(stats?.totalEmployees ?? 0)}
          change={
            isSelf
              ? "attendance status"
              : `${stats?.activeEmployees ?? 0} active`
          }
          positive
        />

        <GlassKpi
          icon="check"
          tone="green"
          label="Present Today"
          value={String(stats?.presentToday ?? 0)}
          change="punched in"
          positive
        />

        <GlassKpi
          icon="calendar"
          tone="amber"
          label={isSelf ? "Leave Balance" : "On Leave"}
          value={String(
            isSelf ? stats?.availableLeave ?? 0 : stats?.onLeave ?? 0
          )}
          change={
            isSelf
              ? "days available"
              : `${stats?.pendingLeaves ?? 0} pending`
          }
        />

        <GlassKpi
          icon="clock"
          tone="rose"
          label={isSelf ? "Pending Requests" : "Not Marked"}
          value={String(
            isSelf
              ? stats?.pendingLeaves ?? 0
              : stats?.notMarkedToday ?? 0
          )}
          change={
            isSelf
              ? "awaiting approval"
              : `${stats?.absentToday ?? 0} marked absent`
          }
        />

      </section>


      {/* =====================================================
          CHART ROW 1
      ===================================================== */}

      <section className="glass-chart-grid large">

        {/* Attendance Trend */}

        <GlassChartCard
          icon="chart"
          title="Attendance Trend"
          subtitle="Daily attendance overview"
          className="chart-large"
        >

          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart data={attendanceTrend}>

              <defs>

                <linearGradient
                  id="presentGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#3b6cff"
                    stopOpacity={0.28}
                  />

                  <stop
                    offset="100%"
                    stopColor="#3b6cff"
                    stopOpacity={0}
                  />
                </linearGradient>

              </defs>

              <CartesianGrid
                stroke="rgba(16, 24, 40, 0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                stroke="#667085"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <YAxis
                stroke="#667085"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e6ebf3",
                  borderRadius: "12px",
                  color: "#101828",
                }}
              />

              <Area
                type="monotone"
                dataKey="present"
                stroke="#3b6cff"
                strokeWidth={3}
                fill="url(#presentGradient)"
              />

              <Area
                type="monotone"
                dataKey="leave"
                stroke="#7aa0ff"
                strokeWidth={2}
                fill="transparent"
              />

              <Area
                type="monotone"
                dataKey="absent"
                stroke="#9cb6ff"
                strokeWidth={2}
                fill="transparent"
              />

              <Legend />

            </AreaChart>
          </ResponsiveContainer>

        </GlassChartCard>


        {/* Department Distribution */}

        <GlassChartCard
          icon="pie"
          title="Employees by Department"
          subtitle="Current workforce distribution"
        >

          {departmentData.length === 0 ? (
            <p className="glass-empty">No department split yet.</p>
          ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>

              <Pie
                data={departmentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="44%"
                innerRadius="48%"
                outerRadius="68%"
                paddingAngle={3}
              >

                {departmentData.map(
                  (entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        pieColors[
                          index %
                            pieColors.length
                        ]
                      }
                    />
                  )
                )}

              </Pie>

              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e6ebf3",
                  borderRadius: "12px",
                  color: "#101828",
                }}
              />

              <Legend wrapperStyle={{ width: "100%", fontSize: 12 }} />

            </PieChart>
          </ResponsiveContainer>
          )}

        </GlassChartCard>

      </section>


      {/* =====================================================
          CHART ROW 2
      ===================================================== */}

      <section className="glass-chart-grid">

        {/* Leave Usage */}

        <GlassChartCard
          icon="calendar"
          title="Leave Overview"
          subtitle="Used vs available leave balance"
        >

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart data={leaveData}>

              <CartesianGrid
                stroke="rgba(16, 24, 40, 0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="type"
                stroke="#667085"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <YAxis
                stroke="#667085"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e6ebf3",
                  borderRadius: "12px",
                  color: "#101828",
                }}
              />

              <Legend />

              <Bar
                dataKey="used"
                name="Used"
                fill="#3b6cff"
                radius={[6, 6, 0, 0]}
              />

              <Bar
                dataKey="available"
                name="Available"
                fill="#3b6cff"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </GlassChartCard>


        {/* Employee Growth */}

        <GlassChartCard
          icon="users"
          title="Employee Growth"
          subtitle="Workforce growth over the last 6 months"
        >

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart data={employeeGrowth}>

              <defs>

                <linearGradient
                  id="growthGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#3b6cff"
                    stopOpacity={0.45}
                  />

                  <stop
                    offset="100%"
                    stopColor="#3b6cff"
                    stopOpacity={0}
                  />

                </linearGradient>

              </defs>

              <CartesianGrid
                stroke="rgba(16, 24, 40, 0.08)"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                stroke="#667085"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <YAxis
                stroke="#667085"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />

              <Tooltip
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e6ebf3",
                  borderRadius: "12px",
                  color: "#101828",
                }}
              />

              <Area
                type="monotone"
                dataKey="employees"
                stroke="#3b6cff"
                strokeWidth={3}
                fill="url(#growthGradient)"
              />

            </AreaChart>

          </ResponsiveContainer>

        </GlassChartCard>

      </section>


      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <section className="glass-bottom-grid">

        <div className="glass-panel">

          <div className="glass-panel-header">

            <div className="panel-heading">
              <DashIcon name="activity" />
              <div>
                <h2>Recent Activity</h2>
                <p>Latest HRMS activities</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  role === "SUPER_ADMIN" ? "/audit" : "/leave"
                )
              }
            >
              View All
            </button>

          </div>

          {(stats?.recentActivity || []).length === 0 ? (
            <p className="glass-empty">No activity recorded yet.</p>
          ) : (
            stats.recentActivity.map((item) => (
              <Activity
                key={item.id}
                icon={item.icon}
                title={item.title}
                description={item.description}
                time={item.time}
              />
            ))
          )}

        </div>


        <div className="glass-panel quick-panel">

          <div className="glass-panel-header">

            <div className="panel-heading">
              <DashIcon name="grid" />
              <div>
                <h2>Quick Actions</h2>
                <p>Frequently used actions</p>
              </div>
            </div>

          </div>

          <div className="quick-glass-grid">

            <QuickAction
              icon={role === "EMPLOYEE" ? "user" : "users"}
              title={
                role === "MANAGER"
                  ? "My Team"
                  : role === "EMPLOYEE"
                    ? "My Profile"
                    : "Employees"
              }
              onClick={() =>
                navigate(
                  role === "MANAGER"
                    ? "/my-team"
                    : role === "EMPLOYEE"
                      ? "/profile"
                      : "/employees"
                )
              }
            />

            <QuickAction
              icon="clock"
              title="Attendance"
              onClick={() => navigate("/employee/attendance")}
            />

            <QuickAction
              icon="calendar"
              title="Leave"
              onClick={() =>
                navigate(
                  role === "EMPLOYEE" || role === "MANAGER"
                    ? "/my-leave"
                    : "/leave"
                )
              }
            />

            <QuickAction
              icon={
                role === "ADMIN" || role === "EMPLOYEE"
                  ? "wallet"
                  : role === "HR"
                    ? "building"
                    : "chart"
              }
              title={
                role === "SUPER_ADMIN"
                  ? "Analytics"
                  : role === "ADMIN"
                    ? "Payroll"
                    : role === "HR"
                      ? "Departments"
                      : role === "MANAGER"
                        ? "Team Attendance"
                        : "Payslips"
              }
              onClick={() =>
                navigate(
                  role === "SUPER_ADMIN"
                    ? "/analytics"
                    : role === "ADMIN"
                      ? "/payroll"
                      : role === "HR"
                        ? "/departments"
                        : role === "MANAGER"
                          ? "/team-attendance"
                          : "/profile"
                )
              }
            />

          </div>

        </div>

      </section>

    </div>
  );
}


/* =========================================================
   KPI
========================================================= */

function GlassKpi({
  icon,
  tone = "blue",
  label,
  value,
  change,
  positive,
}) {
  return (
    <div className="glass-kpi">

      <div className={`glass-kpi-icon tone-${tone}`}>
        <DashIcon name={icon} size={22} />
      </div>

      <div className="glass-kpi-content">

        <span>{label}</span>

        <strong>{value}</strong>

        <small
          className={
            positive
              ? "positive"
              : ""
          }
        >
          {change}
          {positive ? " ↑" : ""}
        </small>

      </div>

    </div>
  );
}


/* =========================================================
   CHART CARD
========================================================= */

function GlassChartCard({
  icon,
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div
      className={`glass-chart-card ${className}`}
    >

      <div className="glass-chart-header">

        <div className="panel-heading">
          {icon && <DashIcon name={icon} />}
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>

      </div>

      <div className="glass-chart-body">
        {children}
      </div>

    </div>
  );
}


/* =========================================================
   ACTIVITY
========================================================= */

function Activity({
  icon,
  title,
  description,
  time,
}) {
  return (
    <div className="glass-activity">

      <div className="activity-icon">
        <DashIcon name={activityIconName(icon)} size={18} />
      </div>

      <div className="activity-content">

        <strong>{title}</strong>

        <span>{description}</span>

      </div>

      <time>{time}</time>

    </div>
  );
}


/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  title,
  onClick,
}) {
  return (
    <button
      type="button"
      className="quick-glass-action"
      onClick={onClick}
    >

      <span className="quick-icon">
        <DashIcon name={icon} size={18} />
      </span>

      <strong>
        {title}
      </strong>

      <small>
        <DashIcon name="arrow" size={16} />
      </small>

    </button>
  );
}


export default DashboardHome;