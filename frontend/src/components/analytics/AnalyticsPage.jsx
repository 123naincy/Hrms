import DashboardHome from "../dashboard/DashboardHome";
import { PageFrame } from "../common/PageFrame";

export default function AnalyticsPage({ user }) {
  return (
    <PageFrame
      eyebrow="BHL GROUP • ANALYTICS"
      title="Analytics"
      text="Live workforce, attendance, leave, and headcount trends."
    >
      <DashboardHome user={user} embedded />
    </PageFrame>
  );
}
