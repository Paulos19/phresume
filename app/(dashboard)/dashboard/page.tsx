import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Download } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreateResumeDialog } from "@/components/dashboard/create-resume-dialog";

export default async function DashboardPage() {
  const session = await auth();

  // Busca currículos do usuário logado, ordenados pelo mais recente
  const resumes = await prisma.resume.findMany({
    where: { userId: session?.user?.id },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="space-y-8">
      {/* HEADER DA SEÇÃO */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meus Currículos</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie e personalize suas versões profissionais.
          </p>
        </div>
        {/* Só mostra o botão de novo no header se JÁ TIVER currículos */}
        {resumes.length > 0 && (
          <CreateResumeDialog />
        )}
      </div>

      {/* EMPTY STATE (Estado Vazio) */}
      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-xl bg-muted/20 p-8 text-center animate-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20 mb-6">
            <FileText className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          
          <h3 className="text-xl font-semibold">Nenhum currículo criado</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Você ainda não criou nenhum currículo. Comece agora e use nossa IA para estruturar sua experiência.
          </p>
          
          {/* AÇÃO: Abre o Modal ao invés de navegar */}
          <div className="mt-8">
            <CreateResumeDialog />
          </div>
        </div>
      ) : (
        /* GRID DE CURRÍCULOS EXISTENTES */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div 
              key={resume.id} 
              className="group relative flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-500/50"
            >
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    {/* Futuro: Menu de dropdown (Deletar/Duplicar) pode vir aqui */}
                 </div>
                 
                 <div>
                    <h3 className="font-semibold text-lg truncate pr-4" title={resume.title}>
                        {resume.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      Atualizado {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true, locale: ptBR })}
                    </p>
                 </div>
              </div>

              <div className="mt-6 flex items-center gap-2 pt-4 border-t">
                  <Link href={`/dashboard/editor/${resume.id}`} className="flex-1">
                     <Button variant="outline" className="w-full hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 hover:border-indigo-200 transition-colors">
                        Editar Conteúdo
                     </Button>
                  </Link>
                  
                  {/* Botão de Download (só aparece se o n8n já tiver gerado o PDF) */}
                  {resume.pdfUrl && (
                    <Button variant="ghost" size="icon" asChild className="hover:text-indigo-600">
                       <a href={resume.pdfUrl} target="_blank" rel="noopener noreferrer" title="Baixar PDF">
                         <Download className="h-4 w-4" />
                       </a>
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}