"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  ChevronLeft, 
  Rocket,
  CreditCard
} from "lucide-react";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", color: "text-sky-500" },
  { label: "Currículos", icon: FileText, href: "/dashboard/resumes", color: "text-violet-500" },
  { label: "Assinatura", icon: CreditCard, href: "/dashboard/billing", color: "text-pink-700" },
  { label: "Configurações", icon: Settings, href: "/dashboard/settings", color: "text-gray-500" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <motion.aside 
      initial={{ width: 240 }}
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 20 }}
      className="h-full bg-white border-r flex flex-col fixed left-0 top-0 z-40 shadow-sm hidden md:flex"
    >
      {/* LOGO AREA */}
      <div className={cn("h-16 flex items-center border-b px-6 transition-all", isCollapsed ? "justify-center px-2" : "justify-between")}>
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-indigo-200 shadow-md">
             <Rocket className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="font-bold text-xl tracking-tight text-slate-800 whitespace-nowrap"
            >
              Resume<span className="text-indigo-600">AI</span>
            </motion.span>
          )}
        </Link>
      </div>

      {/* ROUTES */}
      <div className="flex-1 flex flex-col gap-1 py-4 px-3 overflow-y-auto custom-scrollbar">
        {routes.map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
          
          return (
            <Link key={route.href} href={route.href} className="block group">
              <div className={cn(
                "flex items-center p-3 w-full rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-indigo-50 text-indigo-600 shadow-sm font-medium" 
                  : "text-muted-foreground hover:bg-slate-50 hover:text-slate-900",
                isCollapsed && "justify-center px-0"
              )}>
                <route.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-indigo-600" : route.color)} />
                
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    className="ml-3 text-sm whitespace-nowrap overflow-hidden"
                  >
                    {route.label}
                  </motion.span>
                )}
                
                {/* Tooltip simples para modo colapsado */}
                {isCollapsed && (
                    <div className="absolute left-16 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-lg">
                        {route.label}
                    </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* FOOTER TOGGLE */}
      <div className="p-3 border-t bg-slate-50/50">
         <Button 
            onClick={toggleSidebar} 
            variant="ghost" 
            className="w-full flex items-center justify-center hover:bg-slate-200/50"
         >
            <ChevronLeft className={cn("w-5 h-5 transition-transform duration-300 text-muted-foreground", isCollapsed && "rotate-180")} />
         </Button>
      </div>
    </motion.aside>
  );
}