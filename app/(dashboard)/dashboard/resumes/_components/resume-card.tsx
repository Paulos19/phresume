"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreVertical, FileText, Trash2, PenLine, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteResume } from "@/actions/resume";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Resume } from "@prisma/client"; // Certifique-se que o Prisma gerou os tipos

interface ResumeCardProps {
  resume: Resume;
}

export function ResumeCard({ resume }: ResumeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evita abrir o link
    e.stopPropagation();
    
    if (!confirm("Tem certeza? Essa ação não pode ser desfeita.")) return;

    setIsDeleting(true);
    const result = await deleteResume(resume.id);
    setIsDeleting(false);

    if (result.success) {
        toast.success("Currículo removido.");
    } else {
        toast.error("Erro ao remover.");
    }
  };

  return (
    <Link href={`/dashboard/editor/${resume.id}`} className="block group relative">
      <div className="border rounded-xl bg-white hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-[280px]">
        
        {/* Área de Preview (Topo) */}
        <div className="flex-1 bg-slate-50/50 flex items-center justify-center border-b group-hover:bg-indigo-50/30 transition-colors relative">
           <FileText className="w-16 h-16 text-slate-300 group-hover:text-indigo-300 transition-colors" />
           
           {/* Overlay ao passar o mouse */}
           <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" className="shadow-sm">
                    <PenLine className="w-4 h-4 mr-2" /> Editar
                </Button>
           </div>
        </div>

        {/* Área de Informações (Base) */}
        <div className="p-4 bg-white">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
                <h3 className="font-semibold text-slate-900 truncate max-w-[160px]" title={resume.title}>
                    {resume.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                    Editado {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true, locale: ptBR })}
                </p>
            </div>

            {/* Menu de Ações */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 -mr-2 text-muted-foreground hover:text-slate-900"
                        onClick={(e) => e.preventDefault()} // Evita navegação ao clicar no menu
                    >
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => window.open(`/dashboard/editor/${resume.id}`, '_blank')}>
                        <ExternalLink className="w-4 h-4 mr-2" /> Abrir em nova aba
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Link>
  );
}