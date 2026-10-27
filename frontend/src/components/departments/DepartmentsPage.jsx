import { useEffect, useState } from "react";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
} from "../../services/hr.service";
import { Banner, PageFrame } from "../common/PageFrame";

const emptyForm = { name: "", code: "", description: "" };

export default function DepartmentsPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      setRows(await getDepartments());
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load departments");
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
      await createDepartment(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save department");
    }
  };

  const toggle = async (row) => {
    try {
      await updateDepartment(row._id, { isActive: !row.isActive });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update department");
    }
  };

  return (
    <PageFrame
      eyebrow="BHL GROUP • ORGANIZATION"
      title="Departments"
      text="Create the departments employees are assigned to."
    >
      <Banner error={error} />

      <div className="employees-card">
        <form className="hr-form" onSubmit={onSubmit}>
          <input
            required
            placeholder="Department name"
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
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
          <input
            placeholder="Description"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
          <button className="leave-primary-button" type="submit">
            Add department
          </button>
        </form>

        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Description</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading departments...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="5">No departments yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id}>
                    <td>{row.name}</td>
                    <td>{row.code}</td>
                    <td>{row.description || "—"}</td>
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
