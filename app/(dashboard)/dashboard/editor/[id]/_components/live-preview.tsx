"use client";

import { ResumeContent } from "@/types/resume";
import { cn } from "@/lib/utils";
import { User, Briefcase, GraduationCap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface LivePreviewProps {
  data: ResumeContent;
  className?: string;
}

export function LivePreview({ data, className }: LivePreviewProps) {
  // Helpers para verificar se há dados
  const hasPersonal = !!data.personalInfo.fullName;
  const hasExp = data.experience.length > 0;
  const hasEdu = data.education.length > 0;
  const hasSkills = data.skills.length > 0;

  if (!hasPersonal && !hasExp && !hasEdu && !hasSkills) {
    return (
      <div className={cn("h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground", className)}>
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="font-semibold text-lg">Seu currículo aparecerá aqui</h3>
        <p className="text-sm mt-2 max-w-[200px]">
          Preencha os campos ao lado e veja a mágica acontecer em tempo real.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white h-full shadow-lg rounded-xl overflow-hidden border border-slate-100 flex flex-col", className)}>
      {/* HEADER VISUAL (Papel A4 Scale Down) */}
      <div className="bg-slate-50 flex-1 p-8 overflow-y-auto custom-scrollbar relative">
        <div className="absolute inset-0 pointer-events-none border-[16px] border-slate-100 z-10" />
        
        <div className="max-w-[600px] mx-auto bg-white min-h-[800px] shadow-sm p-8 text-[10px] md:text-xs leading-relaxed text-slate-700 space-y-6 origin-top transform scale-[0.85] md:scale-100">
            
            {/* Header */}
            <motion.div layout className="border-b pb-4">
                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{data.personalInfo.fullName || "Seu Nome"}</h1>
                <p className="text-indigo-600 font-medium text-sm mt-1">{data.personalInfo.headline || "Seu Cargo"}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-slate-500">
                    {data.personalInfo.email && <span>✉️ {data.personalInfo.email}</span>}
                    {data.personalInfo.phone && <span>📱 {data.personalInfo.phone}</span>}
                    {data.personalInfo.location && <span>📍 {data.personalInfo.location}</span>}
                </div>
            </motion.div>

            {/* Resumo */}
            {data.personalInfo.summary && (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="italic text-slate-600 border-l-2 border-indigo-200 pl-3">
                        {data.personalInfo.summary}
                    </p>
                </motion.div>
            )}

            {/* Experiência */}
            {hasExp && (
                <motion.div layout className="space-y-3">
                    <h2 className="font-bold text-slate-900 uppercase border-b pb-1 flex items-center gap-2">
                        <Briefcase className="w-3 h-3" /> Experiência
                    </h2>
                    {data.experience.map(exp => (
                        <div key={exp.id}>
                            <div className="flex justify-between font-semibold">
                                <span>{exp.position}</span>
                                <span className="text-slate-400 text-[10px]">{exp.startDate}</span>
                            </div>
                            <div className="text-indigo-600 text-[10px]">{exp.company}</div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Educação */}
            {hasEdu && (
                <motion.div layout className="space-y-3">
                    <h2 className="font-bold text-slate-900 uppercase border-b pb-1 flex items-center gap-2">
                        <GraduationCap className="w-3 h-3" /> Formação
                    </h2>
                    {data.education.map(edu => (
                        <div key={edu.id}>
                            <div className="font-semibold">{edu.degree}</div>
                            <div className="text-slate-500">{edu.institution}</div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Skills */}
            {hasSkills && (
                 <motion.div layout>
                    <h2 className="font-bold text-slate-900 uppercase border-b pb-1 mb-2">Skills</h2>
                    <div className="flex flex-wrap gap-1">
                        {data.skills.map(s => (
                            <span key={s.id} className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                                {s.name}
                            </span>
                        ))}
                    </div>
                 </motion.div>
            )}

        </div>
      </div>
      
      <div className="p-3 bg-slate-50 border-t text-center text-xs text-muted-foreground">
         Pré-visualização ao vivo
      </div>
    </div>
  );
}