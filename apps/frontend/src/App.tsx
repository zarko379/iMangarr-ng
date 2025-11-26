import { useEffect, useState } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [setupDone, setSetupDone] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/setup")
      .then(r => r.json())
      .then(d => setSetupDone(d.setupDone))
      .catch(() => setSetupDone(false));
  }, []);

  if (setupDone === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <p className="text-2xl text-slate-300">Cargando iMangarr-ng...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Si no hay usuarios → FORZAR registro */}
        {!setupDone ? (
          <>
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/register" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;