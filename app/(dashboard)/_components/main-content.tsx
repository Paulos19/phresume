"use client";

import { useSidebar } from "@/components/providers/sidebar-provider";
import { motion } from "framer-motion";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <motion.main
      initial={false}
      animate={{ paddingLeft: isCollapsed ? 80 : 240 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 100, damping: 20 }}
      className="pt-20 px-6 pb-10 min-h-screen transition-all w-full"
    >
      <div className="max-w-7xl mx-auto h-full">
        {children}
      </div>
    </motion.main>
  );
}