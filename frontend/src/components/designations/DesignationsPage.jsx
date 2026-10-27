import { useEffect, useState } from "react";
import {
  createDesignation,
  getDepartments,
  getDesignations,
  updateDesignation,
} from "../../services/hr.service";
import { Banner, PageFrame } from "../common/PageFrame";

const emptyForm = { title: "", code: "", department: "", level: "1" };

export default function DesignationsPage() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [designations, departmentRows] = await Promise.all([
        getDesignations(),
        getDepartments(),
      ]);
      setRows(designations);
      setDepartments(departmentRows.filter((item) => item.isActive));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load designations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");
      await createDesignation({
        ...form,
        level: Number(form.level) || 1,
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save designation");
    }
  };

  const toggle = async (row) => {
    try {
      await updateDesignation(row._id, { isActive: !row.isActive });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update designation");
    }
  };

  return (
    <PageFrame
      eyebrow="BHL GROUP • ORGANIZATION"
      title="Designations"
      text="Job titles used on employee records."
    >
      <Banner error={error} />

      <div className="employees-card">
        <form className="hr-form" onSubmit={onSubmit}>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
          />
          <input
            required
            placeholder="Code"
            value={form.code}
            onChange={(event) =>
              setForm({ ...form, code: event.target.value })
            }
          />
          <select
            value={form.department}
            onChange={(event) =>
              setForm({ ...form, department: event.target.value })
            }
          >
            <option value="">Department</option>
            {departments.map((item) => (
              <option key={item._id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            placeholder="Level"
            value={form.level}
            onChange={(event) =>
              setForm({ ...form, level: event.target.value })
            }
          />
          <button className="leave-primary-button" type="submit">
            Add designation
          </button>
        </form>

        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Code</th>
                <th>Department</th>
                <th>Level</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">Loading designations...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="6">No designations yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id}>
                    <td>{row.title}</td>
                    <td>{row.code}</td>
                    <td>{row.department || "—"}</td>
                    <td>{row.level}</td>
                    <td>
                      <span className={`hr-status ${row.isActive ? "on" : "off"}`}>
                        {row.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="hr-link" onClick={() => toggle(row)}>
                        {row.isActive ? "Deactivate" : "Activate"}
                      </button>
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
