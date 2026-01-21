"use client";

import { useSidebar } from "@/components/providers/sidebar-provider";
import { UserClock } from "@/components/user-clock";
import { UserNav } from "@/components/dashboard/user-nav";
import { motion } from "framer-motion";
import { User } from "next-auth"; // ou seu tipo de user

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const { isCollapsed } = useSidebar();

  return (
    <motion.header
      initial={false}
      animate={{ paddingLeft: isCollapsed ? 80 : 240 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 right-0 left-0 z-30 h-16 border-b bg-white/80 backdrop-blur-md flex items-center transition-all hidden md:flex"
    >
      <div className="flex items-center justify-between w-full px-6">
        
        {/* Lado Esquerdo (Boas vindas ou Breadcrumbs) */}
        <div className="flex flex-col justify-center">
            <h2 className="text-sm font-semibold text-slate-800">
                Olá, {user.name?.split(" ")[0]} 👋
            </h2>
            <p className="text-xs text-muted-foreground">
                Vamos criar algo incrível hoje?
            </p>
        </div>

        {/* Lado Direito: Ações */}
        <div className="flex items-center gap-4">
            {/* Relógio Local */}
            <UserClock />

            <div className="h-6 w-px bg-slate-200 mx-2" />

            {/* Menu do Usuário */}
            <UserNav user={user} />
        </div>
      </div>
    </motion.header>
  );
}