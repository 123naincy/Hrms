const SHORT_WORDS = new Set(["HR", "EL", "IT"]);

export function formatRole(role) {
  if (!role) return "";

  return String(role)
    .split("_")
    .map((part) => {
      if (SHORT_WORDS.has(part)) return part;

      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}
