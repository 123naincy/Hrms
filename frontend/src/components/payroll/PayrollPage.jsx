import { useEffect, useState } from "react";
import { getEmployees } from "../../services/employee.service";
import {
  generatePayslips,
  getPayslips,
  getSalaries,
  markPayslipPaid,
  saveSalary,
} from "../../services/hr.service";
import { Banner, PageFrame, employeeName } from "../common/PageFrame";

const now = new Date();

export default function PayrollPage() {
  const [employees, setEmployees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [salaryForm, setSalaryForm] = useState({
    employeeId: "",
    basic: "",
    hra: "",
    allowances: "",
    deductions: "",
  });
  const [run, setRun] = useState({
    employeeId: "",
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1),
  });

  const load = async () => {
    const [people, salaryRows, slipRows] = await Promise.all([
      getEmployees(),
      getSalaries(),
      getPayslips(),
    ]);
    setEmployees(people.filter((item) => item.isActive));
    setSalaries(salaryRows);
    setPayslips(slipRows);
  };

  useEffect(() => {
    load().catch((err) => {
      setError(err?.response?.data?.message || "Failed to load payroll");
    });
  }, []);

  const saveStructure = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      await saveSalary(salaryForm);
      setMessage("Salary structure saved.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save salary");
    }
  };

  const generate = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      await generatePayslips({
        employeeId: run.employeeId || undefined,
        year: Number(run.year),
        month: Number(run.month),
      });
      setMessage(
        run.employeeId
          ? "Payslip generated."
          : "Payslips generated for every saved salary."
      );
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not generate payroll");
    }
  };

  const pay = async (id) => {
    try {
      await markPayslipPaid(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not mark payslip paid");
    }
  };

  return (
    <PageFrame
      eyebrow="BHL GROUP • PAYROLL"
      title="Payroll"
      text="Set salary structures and generate monthly payslips from attendance."
    >
      <Banner error={error} success={message} />

      <div className="hr-split">
        <div className="employees-card">
          <h2>Salary structure</h2>
          <form className="hr-form columns" onSubmit={saveStructure}>
            <select
              required
              value={salaryForm.employeeId}
              onChange={(event) =>
                setSalaryForm({ ...salaryForm, employeeId: event.target.value })
              }
            >
              <option value="">Employee</option>
              {employees.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.fullName} ({item.employeeCode})
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              min="0"
              placeholder="Basic"
              value={salaryForm.basic}
              onChange={(event) =>
                setSalaryForm({ ...salaryForm, basic: event.target.value })
              }
            />
            <input
              type="number"
              min="0"
              placeholder="HRA"
              value={salaryForm.hra}
              onChange={(event) =>
                setSalaryForm({ ...salaryForm, hra: event.target.value })
              }
            />
            <input
              type="number"
              min="0"
              placeholder="Allowances"
              value={salaryForm.allowances}
              onChange={(event) =>
                setSalaryForm({
                  ...salaryForm,
                  allowances: event.target.value,
                })
              }
            />
            <input
              type="number"
              min="0"
              placeholder="Fixed deductions"
              value={salaryForm.deductions}
              onChange={(event) =>
                setSalaryForm({
                  ...salaryForm,
                  deductions: event.target.value,
                })
              }
            />
            <button className="leave-primary-button" type="submit">
              Save salary
            </button>
          </form>
        </div>

        <div className="employees-card">
          <h2>Generate payslips</h2>
          <form className="hr-form columns" onSubmit={generate}>
            <select
              value={run.employeeId}
              onChange={(event) =>
                setRun({ ...run, employeeId: event.target.value })
              }
            >
              <option value="">All employees with salary</option>
              {employees.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.fullName}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="2000"
              max="2100"
              value={run.year}
              onChange={(event) =>
                setRun({ ...run, year: event.target.value })
              }
            />
            <input
              type="number"
              min="1"
              max="12"
              value={run.month}
              onChange={(event) =>
                setRun({ ...run, month: event.target.value })
              }
            />
            <button className="leave-primary-button" type="submit">
              Generate
            </button>
          </form>
        </div>
      </div>

      <div className="employees-card">
        <h2>Salary register</h2>
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Basic</th>
                <th>HRA</th>
                <th>Allowances</th>
                <th>Deductions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.length === 0 ? (
                <tr>
                  <td colSpan="5">No salary structures yet.</td>
                </tr>
              ) : (
                salaries.map((row) => (
                  <tr key={row._id}>
                    <td>{employeeName(row.employeeId)}</td>
                    <td>{row.basic}</td>
                    <td>{row.hra}</td>
                    <td>{row.allowances}</td>
                    <td>{row.deductions}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="employees-card">
        <h2>Payslips</h2>
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Present</th>
                <th>Leave</th>
                <th>Absent</th>
                <th>Gross</th>
                <th>LOP</th>
                <th>Net</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan="10">No payslips generated.</td>
                </tr>
              ) : (
                payslips.map((row) => (
                  <tr key={row._id}>
                    <td>{employeeName(row.employeeId)}</td>
                    <td>
                      {row.month}/{row.year}
                    </td>
                    <td>{row.presentDays}</td>
                    <td>{row.leaveDays}</td>
                    <td>{row.absentDays}</td>
                    <td>{row.gross}</td>
                    <td>{row.lop}</td>
                    <td>{row.net}</td>
                    <td>
                      <span className={`hr-status ${row.status === "PAID" ? "on" : "pending"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      {row.status !== "PAID" && (
                        <button type="button" className="hr-link" onClick={() => pay(row._id)}>
                          Mark paid
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
