import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    const res = await fetch("http://localhost:3000/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      alert("Cuenta creada! Redirigiendo al login...");
      window.location.href = "/login";
    } else {
      const msg = await res.text();
      setError(msg || "Error al crear cuenta");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
      <Card className="w-full max-w-md bg-slate-900/70 backdrop-blur border-slate-800 shadow-2xl">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="mx-auto size-16 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-2xl shadow-purple-500/30" />
          <div>
            <CardTitle className="text-4xl font-bold text-white">
              Bienvenido a <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">iMangarr-ng</span>
            </CardTitle>
            <CardDescription className="mt-3 text-lg text-slate-400">
              Crea tu cuenta de administrador
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Usuario</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required className="h-12 bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Contraseña</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="h-12 bg-slate-800/50 border-slate-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Confirmar contraseña</Label>
              <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required className="h-12 bg-slate-800/50 border-slate-700 text-white" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" size="lg" className="w-full h-12 text-lg font-medium bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500">
              Crear cuenta y continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}