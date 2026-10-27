const FIELD_LABELS: Record<string, string> = {
  fullName: "Full name",
  email: "Email",
  mobile: "Mobile number",
  employeeCode: "Employee code",
  name: "Name",
  code: "Code",
  title: "Title",
  password: "Password",
  reason: "Reason",
};

function fieldLabel(path?: string) {
  if (!path) return "This field";
  return FIELD_LABELS[path] || path;
}

export function friendlyError(error: any): string {
  if (!error) return "Request failed";

  if (error.code === 11000 || String(error.message || "").includes("E11000")) {
    const field = Object.keys(error.keyValue || error.keyPattern || {})[0];

    if (field === "name") return "This name is already in use";
    if (field === "code") return "This code is already in use";
    if (field === "email") return "This email is already in use";
    if (field === "mobile") return "This mobile number is already in use";
    if (field === "employeeCode") return "This employee code is already in use";

    return "This record already exists";
  }

  if (error.name === "ValidationError" && error.errors) {
    const first = Object.values(error.errors)[0] as {
      path?: string;
      kind?: string;
      properties?: { minlength?: number; maxlength?: number };
    };

    const label = fieldLabel(first?.path);

    if (first?.kind === "required") return `${label} is required`;
    if (first?.kind === "minlength") {
      const min = first.properties?.minlength;
      return min
        ? `${label} must be at least ${min} characters`
        : `${label} is too short`;
    }
    if (first?.kind === "maxlength") return `${label} is too long`;
    if (first?.kind === "enum") return `${label} is not a valid value`;

    return "Please check the form and try again";
  }

  const message = String(error.message || "Request failed");

  if (message.includes("Path `") || message.includes("E11000")) {
    return "Please check the form and try again";
  }

  return message;
}
