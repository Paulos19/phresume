"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createResume } from "@/actions/resume";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AddResumeCard() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setIsLoading(true);
    
    // Cria com um título padrão, depois o usuário edita
    const result = await createResume("Novo Currículo");
    
    if (result.success && result.id) {
        toast.success("Currículo criado!");
        router.push(`/dashboard/editor/${result.id}`);
    } else {
        setIsLoading(false);
        toast.error("Erro ao criar currículo.");
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={isLoading}
      className={cn(
        "h-[280px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group bg-slate-50/50",
        isLoading && "opacity-70 cursor-not-allowed"
      )}
    >
      <div className="w-14 h-14 rounded-full bg-white border shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
        {isLoading ? (
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        ) : (
            <Plus className="w-6 h-6 text-indigo-600" />
        )}
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-900">Criar Novo Currículo</p>
        <p className="text-xs text-muted-foreground mt-1">Comece do zero</p>
      </div>
    </button>
  );
}