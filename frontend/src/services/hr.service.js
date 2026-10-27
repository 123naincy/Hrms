import api from "./api";

const unwrap = (response) => response.data.data;

export const getDashboard = async () =>
  unwrap(await api.get("/dashboard"));

export const getDepartments = async () =>
  unwrap(await api.get("/departments"));

export const createDepartment = async (payload) =>
  unwrap(await api.post("/departments", payload));

export const updateDepartment = async (id, payload) =>
  unwrap(await api.put(`/departments/${id}`, payload));

export const getDesignations = async () =>
  unwrap(await api.get("/designations"));

export const createDesignation = async (payload) =>
  unwrap(await api.post("/designations", payload));

export const updateDesignation = async (id, payload) =>
  unwrap(await api.put(`/designations/${id}`, payload));

export const getHolidays = async () =>
  unwrap(await api.get("/holidays"));

export const createHoliday = async (payload) =>
  unwrap(await api.post("/holidays", payload));

export const deleteHoliday = async (id) =>
  unwrap(await api.delete(`/holidays/${id}`));

export const getSettings = async () =>
  unwrap(await api.get("/settings"));

export const updateSettings = async (payload) =>
  unwrap(await api.put("/settings", payload));

export const getAuditLogs = async () =>
  unwrap(await api.get("/audit-logs"));

export const getRoles = async () =>
  unwrap(await api.get("/roles"));

export const getSalaries = async () =>
  unwrap(await api.get("/payroll/salaries"));

export const saveSalary = async (payload) =>
  unwrap(await api.post("/payroll/salaries", payload));

export const getPayslips = async (params) =>
  unwrap(await api.get("/payroll/payslips", { params }));

export const generatePayslips = async (payload) =>
  unwrap(await api.post("/payroll/payslips/generate", payload));

export const markPayslipPaid = async (id) =>
  unwrap(await api.patch(`/payroll/payslips/${id}/pay`));

export const getMyTeam = async () =>
  unwrap(await api.get("/employees/team"));

export const getOrgAttendance = async (date) =>
  unwrap(await api.get("/attendance/org", { params: { date } }));

export const getTeamAttendance = async (date) =>
  unwrap(await api.get("/attendance/team", { params: { date } }));

export const getMyLeaves = async () =>
  unwrap(await api.get("/leave-requests/my"));

export const getLeaveRequests = async (status) =>
  unwrap(
    await api.get("/leave-requests", {
      params: status ? { status } : undefined,
    })
  );

export const applyLeave = async (payload) =>
  unwrap(await api.post("/leave-requests", payload));

export const approveLeave = async (id, hrRemarks) =>
  unwrap(
    await api.patch(`/leave-requests/${id}/approve`, { hrRemarks })
  );

export const rejectLeave = async (id, rejectionReason) =>
  unwrap(
    await api.patch(`/leave-requests/${id}/reject`, {
      rejectionReason,
    })
  );

export const cancelLeave = async (id) =>
  unwrap(await api.patch(`/leave-requests/${id}/cancel`));

export const getMyLeaveBalances = async () =>
  unwrap(await api.get("/leave-balances/my"));

export const getProfile = async () =>
  unwrap(await api.get("/auth/me"));

export const updateProfile = async (payload) =>
  unwrap(await api.put("/auth/profile", payload));

export const changePassword = async (payload) =>
  unwrap(await api.patch("/auth/password", payload));
