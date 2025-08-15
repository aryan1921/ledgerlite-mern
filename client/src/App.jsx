import { Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics"; // ✅ add analytics page

function useAuth() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = () => setIsAuthed(!!localStorage.getItem("token"));
    checkAuth();

    // cross-tab updates
    window.addEventListener("storage", checkAuth);

    // same-tab updates (your custom event)
    const handleAuthChange = () => checkAuth();
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  return isAuthed;
}

function Shell({ children, isAuthed }) {
  const nav = useNavigate();
  const out = () => {
    localStorage.removeItem("token");
    try { localStorage.removeItem("user"); } catch {}
    window.dispatchEvent(new Event("authChange"));
    nav("/login", { replace: true });
  };

  // (optional) show logged-in email if saved at login
  let userEmail = "";
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    userEmail = u?.email || "";
  } catch {}

  return (
    <div className="min-h-screen">
      <header className="border-b p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold">Ledgerlite</h1>
          {isAuthed && (
            <nav className="flex items-center gap-2 text-sm">
              <Link className="underline" to="/">Dashboard</Link>
              <span>·</span>
              <Link className="underline" to="/analytics">Analytics</Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          {userEmail && <span className="text-xs text-gray-600">{userEmail}</span>}
          <div className="text-xs text-gray-600">
            API: <code>{import.meta.env.VITE_API_BASE}</code>
          </div>
          {isAuthed && (
            <button onClick={out} className="border px-3 py-1 text-sm">
              Logout
            </button>
          )}
        </div>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}

export default function App() {
  const isAuthed = useAuth();

  return (
    <Routes>
      {/* redirect away from auth pages if already logged in */}
      <Route
        path="/login"
        element={
          isAuthed ? (
            <Navigate to="/" replace />
          ) : (
            <Shell isAuthed={isAuthed}>
              <Login />
            </Shell>
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthed ? (
            <Navigate to="/" replace />
          ) : (
            <Shell isAuthed={isAuthed}>
              <Register />
            </Shell>
          )
        }
      />

      {/* protected pages */}
      <Route
        path="/"
        element={
          isAuthed ? (
            <Shell isAuthed={isAuthed}>
              <Dashboard />
            </Shell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/analytics"
        element={
          isAuthed ? (
            <Shell isAuthed={isAuthed}>
              <Analytics />
            </Shell>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* fallback */}
      <Route
        path="*"
        element={<Navigate to={isAuthed ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
