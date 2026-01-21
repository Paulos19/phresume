"use client";

import { ResumeContent } from "@/types/resume";
import { cn } from "@/lib/utils";
import { Briefcase, GraduationCap, Sparkles, Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
import { motion } from "framer-motion";

interface LivePreviewProps {
  data: ResumeContent;
  className?: string;
}

export function LivePreview({ data, className }: LivePreviewProps) {
  const { personalInfo, experience, education, skills, templateConfig } = data;

  // Configurações padrão caso o config não exista
  const config = templateConfig || {
    layout: 'modern',
    fontFamily: 'Inter',
    photoPosition: 'left',
    primaryColor: '#4f46e5',
    texture: 'none'
  };

  const hasPersonal = !!personalInfo.fullName;
  const hasExp = experience.length > 0;
  const hasEdu = education.length > 0;
  const hasSkills = skills.length > 0;

  if (!hasPersonal && !hasExp && !hasEdu && !hasSkills) {
    return (
      <div className={cn("h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground bg-white", className)}>
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="font-semibold text-lg text-slate-900">Seu currículo aparecerá aqui</h3>
        <p className="text-sm mt-2 max-w-[200px]">
          Preencha os campos ao lado e veja a mágica acontecer em tempo real.
        </p>
      </div>
    );
  }

  // Mapeamento de texturas para CSS
  const textures = {
    none: "",
    dots: "radial-gradient(#cbd5e1 1px, transparent 1px)",
    waves: "radial-gradient(circle at 100% 50%, transparent 20%, rgba(0,0,0,0.03) 21%, rgba(0,0,0,0.03) 34%, transparent 35%), radial-gradient(circle at 0% 50%, transparent 20%, rgba(0,0,0,0.03) 21%, rgba(0,0,0,0.03) 34%, transparent 35%)",
    lines: "repeating-linear-gradient(45deg, rgba(0,0,0,0.01) 0px, rgba(0,0,0,0.01) 2px, transparent 2px, transparent 10px)"
  };

  return (
    <div className={cn("bg-white h-full shadow-lg rounded-xl overflow-hidden border border-slate-100 flex flex-col", className)}>
      <div className="bg-slate-50 flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar relative">
        {/* Camada de Textura/Marca d'água */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 z-0" 
          style={{ 
            backgroundImage: textures[config.texture as keyof typeof textures],
            backgroundSize: config.texture === 'dots' ? '20px 20px' : config.texture === 'waves' ? '20px 40px' : 'auto'
          }} 
        />
        
        {/* Folha A4 Simulada */}
        <div 
          className="max-w-[800px] mx-auto bg-white min-h-[1000px] shadow-sm p-8 md:p-12 text-[10px] md:text-xs leading-relaxed text-slate-700 space-y-8 origin-top transform scale-[0.95] md:scale-100 relative z-10"
          style={{ fontFamily: `'${config.fontFamily}', sans-serif` }}
        >
            
            {/* Header Dinâmico */}
            <motion.div 
              layout 
              className={cn(
                "flex gap-6 pb-6 border-b-2",
                config.photoPosition === 'right' ? "flex-row-reverse text-right" : 
                config.photoPosition === 'center' ? "flex-col items-center text-center" : "flex-row"
              )}
              style={{ borderColor: `${config.primaryColor}20` }}
            >
                {personalInfo.photoUrl && (
                  <div className="shrink-0">
                    <img 
                      src={personalInfo.photoUrl} 
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md bg-slate-100" 
                      alt="Foto de perfil"
                    />
                  </div>
                )}
                
                <div className="flex-1 space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight" style={{ color: config.primaryColor }}>
                      {personalInfo.fullName || "Seu Nome"}
                    </h1>
                    <p className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-widest italic">
                      {personalInfo.headline || "Seu Cargo Desejado"}
                    </p>
                    
                    <div className={cn(
                      "flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-[9px] md:text-[11px]",
                      config.photoPosition === 'center' && "justify-center"
                    )}>
                        {personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {personalInfo.email}</span>}
                        {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {personalInfo.phone}</span>}
                        {personalInfo.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {personalInfo.location}</span>}
                    </div>
                </div>
            </motion.div>

            {/* Resumo Profissional */}
            {personalInfo.summary && (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: config.primaryColor }}>Sobre Mim</h2>
                    <p className="text-slate-600 text-justify leading-relaxed pl-4 border-l-2" style={{ borderColor: `${config.primaryColor}40` }}>
                        {personalInfo.summary}
                    </p>
                </motion.div>
            )}

            {/* Experiência Profissional */}
            {hasExp && (
                <motion.div layout className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1" style={{ color: config.primaryColor, borderColor: `${config.primaryColor}20` }}>
                      Experiência Profissional
                    </h2>
                    <div className="space-y-6">
                      {experience.map(exp => (
                          <div key={exp.id} className="space-y-1">
                              <div className="flex justify-between items-baseline font-bold text-slate-800">
                                  <span className="text-sm">{exp.position}</span>
                                  <span className="text-[9px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{exp.startDate} — {exp.current ? 'Atual' : exp.endDate}</span>
                              </div>
                              <div className="text-xs font-semibold" style={{ color: config.primaryColor }}>{exp.company}</div>
                              <p className="text-slate-600 text-justify whitespace-pre-line mt-2 leading-relaxed">
                                {exp.description}
                              </p>
                          </div>
                      ))}
                    </div>
                </motion.div>
            )}

            {/* Formação Acadêmica */}
            {hasEdu && (
                <motion.div layout className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1" style={{ color: config.primaryColor, borderColor: `${config.primaryColor}20` }}>
                      Formação Acadêmica
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {education.map(edu => (
                          <div key={edu.id} className="space-y-1">
                              <div className="font-bold text-slate-800">{edu.degree}</div>
                              <div className="text-slate-500 font-medium">{edu.institution}</div>
                              <div className="text-[9px] text-slate-400 italic">{edu.startDate} — {edu.endDate || 'Presente'}</div>
                          </div>
                      ))}
                    </div>
                </motion.div>
            )}

            {/* Habilidades */}
            {hasSkills && (
                 <motion.div layout className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1" style={{ color: config.primaryColor, borderColor: `${config.primaryColor}20` }}>Habilidades</h2>
                    <div className="flex flex-wrap gap-2">
                        {skills.map(s => (
                            <span 
                              key={s.id} 
                              className="px-3 py-1 rounded text-[10px] font-bold shadow-sm transition-all"
                              style={{ backgroundColor: `${config.primaryColor}10`, color: config.primaryColor }}
                            >
                                {s.name}
                            </span>
                        ))}
                    </div>
                 </motion.div>
            )}

        </div>
      </div>
      
      <div className="p-3 bg-white border-t text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
         Visualização Dinâmica • ResumeAI
      </div>
    </div>
  );
}