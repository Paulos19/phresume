"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function UserClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date()); // Seta a hora inicial no cliente
    const timer = setInterval(() => setTime(new Date()), 1000); // Atualiza a cada segundo
    return () => clearInterval(timer);
  }, []);

  if (!time) return null; // Não renderiza nada no servidor

  return (
    <div className="flex flex-col items-end mr-4 hidden md:flex">
      <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
        <Clock className="w-3 h-3" />
        <span>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground mt-0.5 capitalize">
        {time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
      </span>
    </div>
  );
}