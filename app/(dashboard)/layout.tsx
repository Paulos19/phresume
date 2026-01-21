import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { Sidebar } from "./_components/sidebar";
import { Header } from "./_components/header";
import { MainContent } from "./_components/main-content";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double check de segurança
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50/50">
        
        {/* DESKTOP SIDEBAR */}
        <Sidebar />

        {/* HEADER FLUTUANTE */}
        <Header user={session.user} />

        {/* ÁREA PRINCIPAL */}
        <MainContent>
            {children}
        </MainContent>

        {/* MOBILE FALLBACK (Simples para garantir usabilidade em telas pequenas) */}
        <div className="md:hidden flex flex-col h-screen">
             {/* Você pode implementar um Sheet/Drawer do Shadcn aqui futuramente */}
             <div className="p-4 bg-white border-b flex justify-between items-center sticky top-0 z-50">
                <span className="font-bold">ResumeAI</span>
                {/* UserNav Mobile */}
             </div>
             <div className="flex-1 p-4 overflow-auto">
                {children}
             </div>
        </div>

      </div>
    </SidebarProvider>
  );
}