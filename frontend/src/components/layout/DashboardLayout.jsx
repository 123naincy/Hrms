import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="hrms-layout">

      {/* Sidebar */}
      <Sidebar
  user={user}
  onLogout={onLogout}
  isOpen={sidebarOpen}
/>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="hrms-main">

        <Header
          user={user}
          onLogout={onLogout}
          onMenuClick={() =>
            setSidebarOpen((prev) => !prev)
          }
        />

        <main className="hrms-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;