import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Guardamos que está autenticado (simple pero efectivo)
        localStorage.setItem("isAuthenticated", "true");
        window.location.href = "/dashboard";
      } else {
        const msg = await res.text();
        setError(msg || "Usuario o contraseña incorrectos");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4">
      <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border-slate-700 shadow-2xl">
        <CardHeader className="space-y-8 text-center">
          <div className="mx-auto size-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-2xl shadow-purple-500/40" />
          
          <div>
            <CardTitle className="text-4xl font-bold text-white">
              i<span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">Mangarr</span>-ng
            </CardTitle>
            <CardDescription className="text-lg text-slate-400 mt-2">
              Inicia sesión para continuar
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300 text-base">Usuario</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="h-12 bg-slate-800/60 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-base">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-slate-800/60 border-slate-600 text-white focus:border-cyan-500 transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-70"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            ¿Primer acceso? Crea tu cuenta en <span className="text-cyan-400 hover:underline cursor-pointer" onClick={() => {
              localStorage.clear();
              window.location.href = "/register";
            }}>registro</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}