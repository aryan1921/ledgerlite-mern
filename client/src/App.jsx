import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function isAuthed() {
  return !!localStorage.getItem("token");
}

function Shell({ children }) {
  const nav = useNavigate();
  const out = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };
  return (
    <div className="min-h-screen">
      <header className="border-b p-3 flex items-center justify-between">
        <h1 className="font-semibold">Ledgerlite</h1>
        <div className="text-sm text-gray-600">
          API: <code>{import.meta.env.VITE_API_BASE}</code>
        </div>
        {isAuthed() && (
          <button onClick={out} className="border px-3 py-1 text-sm">
            Logout
          </button>
        )}
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Shell><Login /></Shell>} />
      <Route path="/register" element={<Shell><Register /></Shell>} />
      <Route
        path="/"
        element={isAuthed() ? <Shell><Dashboard /></Shell> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={isAuthed() ? "/" : "/login"} replace />} />
    </Routes>
  );
}
