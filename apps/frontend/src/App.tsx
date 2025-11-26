import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: "Las contraseñas no coinciden",
  path: ["confirm"],
});

type FormData = z.infer<typeof schema>;

export default function App() {
  const [isSetupDone, setIsSetupDone] = useState<boolean | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    fetch("http://localhost:3000/setup")
      .then(r => r.json())
      .then(d => setIsSetupDone(d.setupDone))
      .catch(() => setIsSetupDone(false));
  }, []);

  const onSubmit = async (data: FormData) => {
    const res = await fetch("http://localhost:3000/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: data.username, password: data.password }),
    });
  
    if (res.ok) {
      alert("¡Cuenta creada! Ya puedes hacer login");
      window.location.reload();
    } else {
      alert("Error al crear cuenta");
    }
  };

  if (isSetupDone === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <p className="text-2xl text-slate-300">Cargando iMangarr-ng...</p>
      </div>
    );
  }

  if (isSetupDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <Card className="w-96 bg-slate-900/70 backdrop-blur border-slate-800">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white">iMangarr-ng</CardTitle>
            <CardDescription className="text-slate-400">Setup completado</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-300">Login en desarrollo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Usuario</Label>
              <Input {...register("username")} placeholder="admin" className="h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500" />
              {errors.username && <p className="text-sm text-red-400">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Contraseña</Label>
              <Input {...register("password")} type="password" className="h-12 bg-slate-800/50 border-slate-700 text-white" />
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Confirmar contraseña</Label>
              <Input {...register("confirm")} type="password" className="h-12 bg-slate-800/50 border-slate-700 text-white" />
              {errors.confirm && <p className="text-sm text-red-400">{errors.confirm.message}</p>}
            </div>

            {/* ← EL BOTÓN CON type="submit" FORZADO */}
            <Button type="submit" size="lg" className="w-full h-12 text-lg font-medium bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500">
              Crear cuenta y continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}