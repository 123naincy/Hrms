import { useEffect, useState } from "react";
import {
  createHoliday,
  deleteHoliday,
  getHolidays,
  getSettings,
  updateSettings,
} from "../../services/hr.service";
import { Banner, PageFrame, formatDate } from "../common/PageFrame";

const WEEK_DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export default function SettingsPage({ user }) {
  const canEdit =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
  const [form, setForm] = useState(null);
  const [holiday, setHoliday] = useState({ name: "", date: "" });
  const [holidays, setHolidays] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const [settings, holidayRows] = await Promise.all([
      getSettings(),
      getHolidays(),
    ]);
    setForm({
      companyName: settings.companyName || "",
      email: settings.email || "",
      phone: settings.phone || "",
      address: settings.address || "",
      workStart: settings.workStart || "09:30",
      workEnd: settings.workEnd || "18:30",
      weeklyOffs: settings.weeklyOffs || [0],
    });
    setHolidays(holidayRows);
  };

  useEffect(() => {
    load().catch((err) => {
      setError(err?.response?.data?.message || "Failed to load settings");
    });
  }, []);

  const toggleDay = (value) => {
    const weeklyOffs = form.weeklyOffs.includes(value)
      ? form.weeklyOffs.filter((day) => day !== value)
      : [...form.weeklyOffs, value];
    setForm({ ...form, weeklyOffs });
  };

  const save = async (event) => {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      await updateSettings(form);
      setMessage("Company settings saved.");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save settings");
    }
  };

  const addHoliday = async (event) => {
    event.preventDefault();

    try {
      setError("");
      await createHoliday(holiday);
      setHoliday({ name: "", date: "" });
      setHolidays(await getHolidays());
    } catch (err) {
      setError(err?.response?.data?.message || "Could not add holiday");
    }
  };

  const remove = async (id) => {
    try {
      await deleteHoliday(id);
      setHolidays(await getHolidays());
    } catch (err) {
      setError(err?.response?.data?.message || "Could not delete holiday");
    }
  };

  if (!form) {
    return (
      <PageFrame eyebrow="BHL GROUP • SETTINGS" title="Settings" text="Loading company settings." />
    );
  }

  return (
    <PageFrame
      eyebrow="BHL GROUP • SETTINGS"
      title="Settings"
      text="Company profile, working hours, and the holiday calendar."
    >
      <Banner error={error} success={message} />

      <div className="employees-card">
        <h2>Company</h2>
        <form className="hr-form columns" onSubmit={save}>
          <input
            required
            disabled={!canEdit}
            placeholder="Company name"
            value={form.companyName}
            onChange={(event) =>
              setForm({ ...form, companyName: event.target.value })
            }
          />
          <input
            disabled={!canEdit}
            placeholder="Email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />
          <input
            disabled={!canEdit}
            placeholder="Phone"
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
          />
          <input
            disabled={!canEdit}
            placeholder="Address"
            value={form.address}
            onChange={(event) =>
              setForm({ ...form, address: event.target.value })
            }
          />
          <label className="hr-field">
            Work start
            <input
              type="time"
              disabled={!canEdit}
              value={form.workStart}
              onChange={(event) =>
                setForm({ ...form, workStart: event.target.value })
              }
            />
          </label>
          <label className="hr-field">
            Work end
            <input
              type="time"
              disabled={!canEdit}
              value={form.workEnd}
              onChange={(event) =>
                setForm({ ...form, workEnd: event.target.value })
              }
            />
          </label>
          <div className="hr-days">
            {WEEK_DAYS.map((day) => (
              <label key={day.value}>
                <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={form.weeklyOffs.includes(day.value)}
                  onChange={() => toggleDay(day.value)}
                />
                {day.label}
              </label>
            ))}
          </div>
          {canEdit && (
            <button className="leave-primary-button" type="submit">
              Save settings
            </button>
          )}
        </form>
      </div>

      <div className="employees-card">
        <h2>Holidays</h2>
        {canEdit || user?.role === "HR" ? (
          <form className="hr-form" onSubmit={addHoliday}>
            <input
              required
              placeholder="Holiday name"
              value={holiday.name}
              onChange={(event) =>
                setHoliday({ ...holiday, name: event.target.value })
              }
            />
            <input
              required
              type="date"
              value={holiday.date}
              onChange={(event) =>
                setHoliday({ ...holiday, date: event.target.value })
              }
            />
            <button className="leave-primary-button" type="submit">
              Add holiday
            </button>
          </form>
        ) : null}
        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan="3">No holidays added.</td>
                </tr>
              ) : (
                holidays.map((row) => (
                  <tr key={row._id}>
                    <td>{row.name}</td>
                    <td>{formatDate(row.date)}</td>
                    <td>
                      {(canEdit || user?.role === "HR") && (
                        <button type="button" className="hr-link" onClick={() => remove(row._id)}>
                          Remove
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
