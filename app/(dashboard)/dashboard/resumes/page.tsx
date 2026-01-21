import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddResumeCard } from "./_components/add-resume-card";
import { ResumeCard } from "./_components/resume-card";

export const metadata = {
  title: "Meus Currículos | ResumeAI",
};

export default async function ResumesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Busca currículos do usuário, ordenados pelo mais recente
  const resumes = await prisma.resume.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meus Currículos</h1>
            <p className="text-muted-foreground mt-2">
                Gerencie, edite e baixe seus documentos profissionais.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Card de Adicionar Sempre Primeiro */}
        <AddResumeCard />

        {/* Lista de Currículos */}
        {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
        ))}
      </div>
      
      {resumes.length === 0 && (
          <div className="text-center py-12">
              <p className="text-sm text-muted-foreground italic">
                Você ainda não tem nenhum currículo. Crie o primeiro acima!
              </p>
          </div>
      )}
    </div>
  );
}