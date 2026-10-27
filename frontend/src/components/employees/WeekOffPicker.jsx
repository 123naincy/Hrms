const WEEK_DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export default function WeekOffPicker({ value = [], onChange }) {
  const toggle = (day) => {
    const next = value.includes(day)
      ? value.filter((item) => item !== day)
      : [...value, day].sort((left, right) => left - right);

    onChange(next);
  };

  return (
    <div className="employee-form-group employee-weekoff">
      <label>Weekly off</label>
      <div className="hr-days">
        {WEEK_DAYS.map((day) => (
          <label key={day.value}>
            <input
              type="checkbox"
              checked={value.includes(day.value)}
              onChange={() => toggle(day.value)}
            />
            {day.label}
          </label>
        ))}
      </div>
      <small className="hr-code">
        Each employee can have a different week off. Leave blank to use the company week off.
      </small>
    </div>
  );
}
