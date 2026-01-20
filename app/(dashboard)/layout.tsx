import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/dashboard/user-nav";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double check de segurança (além do middleware)
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden w-64 border-r bg-muted/20 md:block min-h-screen">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">RB</span>
            </div>
            <span>Resume Builder</span>
          </Link>
        </div>
        <div className="p-4 space-y-4">
           <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
              Gerenciar
            </h2>
            <div className="space-y-1">
              <Link href="/dashboard" className="flex items-center gap-3 rounded-md bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80">
                <FileText className="h-4 w-4" />
                Meus Currículos
              </Link>
            </div>
           </div>
           
           <div className="px-3 py-2">
             <Link href="/dashboard/new" className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 shadow-sm">
                <Plus className="h-4 w-4" />
                Criar Novo
              </Link>
           </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        {/* HEADER MOBILE/DESKTOP */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="md:hidden">
             {/* Aqui entraria um Sheet/Menu Mobile (podemos fazer depois) */}
             <span className="font-bold text-lg">RB</span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
             <span className="text-sm text-muted-foreground hidden md:inline-block">
               Bem-vindo de volta, {session.user.name?.split(' ')[0]}
             </span>
             <UserNav user={session.user} />
          </div>
        </header>

        {/* PÁGINA */}
        <div className="flex-1 p-6 md:p-8 pt-6 max-w-6xl mx-auto w-full">
           {children}
        </div>
      </main>
    </div>
  );
}