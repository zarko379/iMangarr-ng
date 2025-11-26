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
    if (res.ok) window.location.reload();
  };

  if (isSetupDone === null) return <div className="flex min-h-screen items-center justify-center"><p className="text-2xl">Cargando...</p></div>;

  if (isSetupDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">iMangarr-ng</CardTitle>
            <CardDescription>Setup completado</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">Login en desarrollo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md bg-slate-900/70 backdrop-blur-sm border-slate-800">      
        <CardHeader className="space-y-6 text-center">
          <div className="mx-auto size-16 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-xl" />
          <div>
            <CardTitle className="text-4xl font-bold">
              Bienvenido a <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">iMangarr-ng</span>
            </CardTitle>
            <CardDescription className="mt-3 text-lg">
              Crea tu cuenta de administrador
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input {...register("username")} placeholder="admin" />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input {...register("password")} type="password" />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Confirmar contraseña</Label>
              <Input {...register("confirm")} type="password" />
              {errors.confirm && <p className="text-sm text-destructive">{errors.confirm.message}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full">
              Crear cuenta y continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}