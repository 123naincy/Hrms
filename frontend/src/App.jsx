import { useEffect, useState } from "react";

import Login from "./components/auth/Login";
import DashboardLayout from "./components/layout/DashboardLayout";
import AppRouter from "./AppRouter";
import { navigate } from "./utils/navigate";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState(window.location.pathname);

  /* =====================================================
     CHECK EXISTING LOGIN
  ===================================================== */

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
      }
    } catch (error) {
      console.error(
        "Failed to restore login:",
        error
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);


  /* =====================================================
     LOGIN SUCCESS
  ===================================================== */

  const handleLogin = (loggedInUser) => {
    const destination =
      loggedInUser?.role === "EMPLOYEE"
        ? "/employee/attendance"
        : "/";

    setUser(loggedInUser);
    navigate(destination);
    setPath(destination);
  };

  useEffect(() => {
    if (user?.role !== "EMPLOYEE") return;
    if (path !== "/" && path !== "") return;

    navigate("/employee/attendance");
    setPath("/employee/attendance");
  }, [user, path]);


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    navigate("/");
    setPath("/");
  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />

        <p>
          Loading HRMS...
        </p>
      </div>
    );
  }


  /* =====================================================
     LOGIN
  ===================================================== */

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


  /* =====================================================
     DASHBOARD
  ===================================================== */

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
    >
      <AppRouter
        user={user}
        path={path}
        onUserChange={setUser}
      />
    </DashboardLayout>
  );
}

export default App;