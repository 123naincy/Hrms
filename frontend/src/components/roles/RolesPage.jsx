import { useEffect, useState } from "react";
import { getRoles } from "../../services/hr.service";
import { formatRole } from "../../utils/format";
import { Banner, PageFrame } from "../common/PageFrame";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load roles");
      });
  }, []);

  return (
    <PageFrame
      eyebrow="BHL GROUP • ACCESS"
      title="Roles & Permissions"
      text="What each role can do in the HRMS. Assign a role from the employee record."
    >
      <Banner error={error} />
      <div className="hr-role-grid">
        {roles.map((role) => (
          <article key={role.role} className="employees-card">
            <div className="hr-role-head">
              <h2>{formatRole(role.role)}</h2>
              <span>{role.userCount} users</span>
            </div>
            <p>{role.description}</p>
            <ul>
              {role.permissions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </PageFrame>
  );
}
