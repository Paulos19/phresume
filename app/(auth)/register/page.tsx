'use client';

import * as React from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/actions/register"; // Importando a server action

// Schema local para o form (deve bater com o da action)
const formSchema = z.object({
  name: z.string().min(2, "Nome curto demais"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export default function RegisterPage() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setError("");
    setSuccess("");
    
    startTransition(async () => {
      const data = await registerUser(values);
      
      if (data.error) {
        setError(data.error);
      }
      
      if (data.success) {
        setSuccess(data.success);
        form.reset();
        // Opcional: Redirecionar via router.push('/login') após delay
      }
    });
  };

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Crie sua conta
        </h1>
        <p className="text-sm text-muted-foreground">
          Comece a gerar currículos profissionais hoje
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            
            {/* Campo Nome */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                {...form.register("name")}
                id="name"
                placeholder="Ex: João Silva"
                disabled={isPending}
                className="bg-background/50"
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Campo Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...form.register("email")}
                id="email"
                placeholder="nome@exemplo.com"
                type="email"
                disabled={isPending}
                className="bg-background/50"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                {...form.register("password")}
                id="password"
                type="password"
                disabled={isPending}
                className="bg-background/50"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Mensagens de Erro/Sucesso */}
            {error && (
              <div className="p-3 bg-red-500/15 border border-red-500/50 rounded text-sm text-red-500 text-center">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/50 rounded text-sm text-emerald-500 text-center">
                {success}
              </div>
            )}

            <Button disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground">
           Já tem uma conta?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary font-medium text-foreground">
            Fazer Login
          </Link>
        </p>
      </div>
    </>
  );
}