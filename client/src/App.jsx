import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useState, useEffect } from "react";

function useAuth() {
  const [isAuthed, setIsAuthed] = useState(false);
  
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthed(!!localStorage.getItem("token"));
    };
    
    checkAuth();
    
    // Listen for storage changes
    window.addEventListener('storage', checkAuth);
    
    // Custom event for same-tab updates
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);
  
  return isAuthed;
}

function Shell({ children }) {
  const nav = useNavigate();
  const out = () => {
    localStorage.removeItem("token");
    // Dispatch custom event to trigger re-render
    window.dispatchEvent(new Event('authChange'));
    nav("/login", { replace: true });
  };
  
  const isAuthed = useAuth();
  
  return (
    <div className="min-h-screen">
      <header className="border-b p-3 flex items-center justify-between">
        <h1 className="font-semibold">Ledgerlite</h1>
        <div className="text-sm text-gray-600">
          API: <code>{import.meta.env.VITE_API_BASE}</code>
        </div>
        {isAuthed && (
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
  const isAuthed = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Shell><Login /></Shell>} />
      <Route path="/register" element={<Shell><Register /></Shell>} />
      <Route
        path="/"
        element={isAuthed ? <Shell><Dashboard /></Shell> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={isAuthed ? "/" : "/login"} replace />} />
    </Routes>
  );
}
