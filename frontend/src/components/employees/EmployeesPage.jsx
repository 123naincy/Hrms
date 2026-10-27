import { useEffect, useMemo, useState } from "react";

import {
  getEmployees,
  updateEmployeeStatus,
} from "../../services/employee.service";

import { formatRole } from "../../utils/format";
import AddEmployeeModal from "./AddEmployeeModal";
import EditEmployeeModal from "./EditEmployeeModal";
import EmployeeProfileModal from "./EmployeeProfileModal";
import ResetPasswordModal from "./ResetPasswordModal";

function EmployeesPage({ user }) {
const [employees, setEmployees] = useState([]);
const [editingEmployee, setEditingEmployee] =
    useState(null);
const [viewingEmployee, setViewingEmployee] =
  useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [search, setSearch] = useState("");
const [roleFilter, setRoleFilter] = useState("ALL");
const [statusFilter, setStatusFilter] =
    useState("ALL");

const [showAddEmployee, setShowAddEmployee] =
    useState(false);


  // =========================================================
  // LOAD EMPLOYEES
  // =========================================================

  useEffect(() => {
    loadEmployees();
  }, []);


  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees();

      setEmployees(
        Array.isArray(data) ? data : []
      );

    } catch (error) {
      console.error(
        "GET EMPLOYEES ERROR:",
        error
      );

      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load employees"
      );

    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // PERMISSION
  // =========================================================

  const canCreateEmployee =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "HR";


  // =========================================================
  // STATISTICS
  // =========================================================

  const totalEmployees =
    employees.length;

  const activeEmployees =
    employees.filter(
      (employee) => employee.isActive
    ).length;

  const inactiveEmployees =
    employees.filter(
      (employee) => !employee.isActive
    ).length;

  const managementEmployees =
    employees.filter(
      (employee) =>
        employee.role === "HR" ||
        employee.role === "MANAGER"
    ).length;


  // =========================================================
  // FILTER
  // =========================================================

  const filteredEmployees = useMemo(() => {

    return employees.filter(
      (employee) => {

        const searchText =
          search.toLowerCase().trim();


        const matchesSearch =
          !searchText ||
          employee.fullName
            ?.toLowerCase()
            .includes(searchText) ||
          employee.employeeCode
            ?.toLowerCase()
            .includes(searchText) ||
          employee.email
            ?.toLowerCase()
            .includes(searchText) ||
          employee.mobile
            ?.toLowerCase()
            .includes(searchText);


        const matchesRole =
          roleFilter === "ALL" ||
          employee.role === roleFilter;


        const matchesStatus =
          statusFilter === "ALL" ||
          (
            statusFilter === "ACTIVE" &&
            employee.isActive
          ) ||
          (
            statusFilter === "INACTIVE" &&
            !employee.isActive
          );


        return (
          matchesSearch &&
          matchesRole &&
          matchesStatus
        );
      }
    );

  }, [
    employees,
    search,
    roleFilter,
    statusFilter,
  ]);


  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const handleStatusChange = async (
    employee
  ) => {

    const newStatus =
      !employee.isActive;


    const confirmed =
      window.confirm(
        newStatus
          ? `Activate ${employee.fullName}?`
          : `Deactivate ${employee.fullName}?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await updateEmployeeStatus(
        employee._id,
        newStatus
      );

      await loadEmployees();

    } catch (error) {

      console.error(
        "UPDATE STATUS ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update employee status"
      );
    }
  };


  // =========================================================
  // ROLE LABEL
  // =========================================================

  const getRoleLabel = (role) => {

    if (!role) {
      return "—";
    }

    return formatRole(role);
  };

  return (
    <div className="employees-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="employees-header">

        <div>

          <p className="dashboard-eyebrow">
            BHL GROUP • PEOPLE MANAGEMENT
          </p>

          <h1>
            Employees
          </h1>

          <p>
            Manage employees, roles and
            employment information.
          </p>

        </div>


        {canCreateEmployee && (
          <button
            type="button"
            className="primary-gold-button"
            onClick={() =>
              setShowAddEmployee(true)
            }
          >
            <span>+</span>
            Add Employee
          </button>
        )}

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="employee-page-error">

          <span>!</span>

          <div>
            <strong>
              Unable to load employees
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={loadEmployees}
          >
            Retry
          </button>

        </div>
      )}


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="employee-stats">

        <div className="employee-stat-card">

          <span className="employee-stat-icon">
            👥
          </span>

          <div>
            <small>
              Total Employees
            </small>

            <strong>
              {loading
                ? "—"
                : totalEmployees}
            </strong>
          </div>

        </div>


        <div className="employee-stat-card">

          <span className="employee-stat-icon active">
            ✓
          </span>

          <div>
            <small>
              Active
            </small>

            <strong>
              {loading
                ? "—"
                : activeEmployees}
            </strong>
          </div>

        </div>


        <div className="employee-stat-card">

          <span className="employee-stat-icon inactive">
            ○
          </span>

          <div>
            <small>
              Inactive
            </small>

            <strong>
              {loading
                ? "—"
                : inactiveEmployees}
            </strong>
          </div>

        </div>


        <div className="employee-stat-card">

          <span className="employee-stat-icon">
            HR
          </span>

          <div>
            <small>
              HR / Management
            </small>

            <strong>
              {loading
                ? "—"
                : managementEmployees}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          EMPLOYEE LIST
      ===================================================== */}

      <div className="employees-card">

        {/* TOOLBAR */}

        <div className="employees-toolbar">

          <div className="employee-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search by name, employee code or email..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
          >

            <option value="ALL">
              All Roles
            </option>

            <option value="ADMIN">
              Admin
            </option>

            <option value="HR">
              HR
            </option>

            <option value="MANAGER">
              Manager
            </option>

            <option value="EMPLOYEE">
              Employee
            </option>

          </select>


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="ALL">
              All Status
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>

          </select>

        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="employees-table-wrapper">

          <table className="employees-table">

            <thead>

              <tr>
                <th>Employee</th>
                <th>Employee Code</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>


            <tbody>

              {/* LOADING */}

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="employees-empty"
                  >

                    <div>

                      <div className="employee-loading-spinner" />

                      <h3>
                        Loading employees...
                      </h3>

                      <p>
                        Fetching employee records.
                      </p>

                    </div>

                  </td>

                </tr>


              ) : filteredEmployees.length === 0 ? (

                /* EMPTY */

                <tr>

                  <td
                    colSpan="7"
                    className="employees-empty"
                  >

                    <div>

                      <div className="employees-empty-icon">
                        👥
                      </div>

                      <h3>
                        No employees found
                      </h3>

                      <p>
                        {search ||
                          roleFilter !== "ALL" ||
                          statusFilter !== "ALL"
                          ? "Try changing your search or filters."
                          : "Employee records will appear here."}
                      </p>


                      {canCreateEmployee &&
                        !search &&
                        roleFilter === "ALL" &&
                        statusFilter === "ALL" && (
                          <button
                            type="button"
                            className="secondary-gold-button"
                            onClick={() =>
                              setShowAddEmployee(
                                true
                              )
                            }
                          >
                            + Add First Employee
                          </button>
                        )}

                    </div>

                  </td>

                </tr>


              ) : (

                /* DATA */

                filteredEmployees.map(
                  (employee) => (

                    <tr
                      key={employee._id}
                    >

                      {/* EMPLOYEE */}

                      <td>

                        <div className="employee-name-cell">

                          <div className="employee-avatar">

                            {employee.fullName
                              ?.charAt(0)
                              ?.toUpperCase()}

                          </div>


                          <div>

                            <strong>
                              {employee.fullName}
                            </strong>

                            <span>
                              {employee.email}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* CODE */}

                      <td>
                        {employee.employeeCode}
                      </td>


                      {/* DEPARTMENT */}

                      <td>
                        {employee.department ||
                          "—"}
                      </td>


                      {/* DESIGNATION */}

                      <td>
                        {employee.designation ||
                          "—"}
                      </td>


                      {/* ROLE */}

                      <td>

                        <span
                          className={`role-badge ${employee.role
                            ?.toLowerCase()
                            }`}
                        >
                          {getRoleLabel(
                            employee.role
                          )}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`status-badge ${employee.isActive
                            ? "active"
                            : "inactive"
                            }`}
                        >
                          {employee.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="employee-actions">

                          <button
                            type="button"
                            className="table-action"
                            onClick={() =>
                              setViewingEmployee(employee)
                            }
                          >
                            View
                          </button>

                          {canCreateEmployee && (
                            <button
                              type="button"
                              className="table-action"
                              onClick={() =>
                                setEditingEmployee(employee)
                              }
                            >
                              Edit
                            </button>
                          )}

                          {canCreateEmployee && (
                            <button
                              type="button"
                              className="table-action"
                              onClick={() =>
                                handleStatusChange(employee)
                              }
                            >
                              {employee.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          ADD EMPLOYEE MODAL
      ===================================================== */}
{showAddEmployee && (
  <AddEmployeeModal
    user={user}
    onClose={() =>
      setShowAddEmployee(false)
    }
    onSuccess={() => {
      setShowAddEmployee(false);
      loadEmployees();
    }}
  />
)}

{editingEmployee && (
  <EditEmployeeModal
    employee={editingEmployee}
    user={user}
    onClose={() =>
      setEditingEmployee(null)
    }
    onSuccess={() => {
      setEditingEmployee(null);
      loadEmployees();
    }}
  />
)}

{viewingEmployee && (
  <EmployeeProfileModal
    employee={viewingEmployee}
    onClose={() =>
      setViewingEmployee(null)
    }
    onEdit={(employee) =>
      setEditingEmployee(employee)
    }
    onStatusChange={handleStatusChange}
  />
)}
     

    </div>
  );

}

export default EmployeesPage;