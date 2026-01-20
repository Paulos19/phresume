"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createResume } from "@/actions/resume";
import { Loader2, Plus, Sparkles, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres."),
});

export function CreateResumeDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await createResume(values.title);
      
      if (result.success && result.id) {
        setOpen(false);
        reset();
        // Redirecionamento forçado para garantir que a rota carregue
        router.push(`/dashboard/editor/${result.id}`);
      } else {
        // Exibe o erro real retornado pelo servidor
        alert(result.error || "Ocorreu um erro inesperado.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
          <Plus className="mr-2 h-4 w-4" /> Novo Currículo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             Criar novo currículo <Sparkles className="h-4 w-4 text-amber-500" />
          </DialogTitle>
          <DialogDescription>
            Dê um nome para identificar este currículo (ex: "FullStack 2026").
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm font-medium">Título do Currículo</Label>
            <Input
              id="title"
              placeholder="Ex: Desenvolvedor React Sênior"
              {...register("title")}
              className="col-span-3 bg-muted/30"
              disabled={isPending}
              autoComplete="off"
            />
            {errors.title && (
              <div className="flex items-center text-red-500 text-xs mt-1">
                 <AlertCircle className="w-3 h-3 mr-1" />
                 {errors.title.message}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
                type="submit" 
                disabled={isPending} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
              ) : (
                  "Criar e Editar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}