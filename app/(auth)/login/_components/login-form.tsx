"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition, useState } from "react";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { login } from "@/actions/login"; // A action que criamos acima

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email("Insira um email válido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

export function LoginForm({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setError("");
    startTransition(async () => {
      const data = await login(values);
      if (data?.error) {
        setError(data.error);
        form.resetField("password"); // UX: Limpa senha em caso de erro
      }
      // Sucesso redireciona automaticamente via Server Action
    });
  };

  return (
    <div className={cn("grid gap-6", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Campo de Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="seu@email.com"
                      type="email"
                      disabled={isPending}
                      className="pl-9 bg-background/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500 transition-all"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de Senha */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                   <FormLabel>Senha</FormLabel>
                   <a href="#" className="text-xs text-muted-foreground hover:text-indigo-500 transition-colors">
                     Esqueceu a senha?
                   </a>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="******"
                      type={showPassword ? "text" : "password"}
                      disabled={isPending}
                      className="pl-9 pr-9 bg-background/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-indigo-500 transition-all"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Esconder senha" : "Mostrar senha"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Feedback de Erro Geral */}
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 flex items-center justify-center animate-in fade-in-50 slide-in-from-top-1">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          {/* Botão de Submit */}
          <Button 
            type="submit" 
            disabled={isPending} 
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Entrar na Plataforma <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}