"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResumeContent, PersonalInfo, Experience, Education, Skill } from "@/types/resume";
import { updateResume } from "@/actions/resume";
import { generateResumePDF } from "@/actions/generate"; // Importando a Action Real
import { Button } from "@/components/ui/button";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Wand2, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  CheckCircle2, 
  Loader2,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; 

// --- IMPORTAÇÃO DOS SUB-FORMULÁRIOS ---
import { PersonalForm } from "./forms/personal-form";
import { ExperienceForm } from "./forms/experience-form";
import { EducationForm } from "./forms/education-form";
import { SkillsForm } from "./forms/skills-form";
import { ReviewStep } from "./forms/review-step";

const STEPS = [
  { id: 'personal', label: 'Dados Pessoais', icon: User },
  { id: 'experience', label: 'Experiência', icon: Briefcase },
  { id: 'education', label: 'Educação', icon: GraduationCap },
  { id: 'skills', label: 'Habilidades', icon: Code },
  { id: 'review', label: 'Gerar com IA', icon: Wand2 },
];

interface ResumeEditorProps {
  resumeId: string;
  initialData: ResumeContent;
  resumeTitle: string;
}

export function ResumeEditor({ resumeId, initialData, resumeTitle }: ResumeEditorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ResumeContent>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // --- LÓGICA DE PERSISTÊNCIA (Salvar no Banco) ---
  const handleSave = async (silent = false) => {
    setIsSaving(true);
    
    const result = await updateResume(resumeId, data);
    
    setIsSaving(false);
    
    if (result.success) {
      setLastSaved(new Date());
      if (!silent) toast.success("Alterações salvas com sucesso!");
    } else {
      if (!silent) toast.error("Erro ao salvar. Verifique sua conexão.");
    }
  };

  // --- LÓGICA DE NAVEGAÇÃO ---
  const scrollToTop = () => {
    document.getElementById('editor-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextStep = async () => {
    // Salva automaticamente ao tentar avançar
    await handleSave(true);
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(c => c + 1);
      scrollToTop();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
      scrollToTop();
    }
  };

  // --- HANDLERS DE GERAÇÃO (Conexão Real com n8n) ---
  const handleGeneratePDF = async () => {
    // 1. Garante que a versão mais recente está salva no banco
    await handleSave(true);
    
    setIsSaving(true);
    toast.info("Enviando dados para a Inteligência Artificial...", { 
        duration: 4000,
        icon: <Wand2 className="w-4 h-4 text-indigo-500" />
    });

    try {
        // 2. Chama a Server Action que bate no Webhook do n8n
        const result = await generateResumePDF(resumeId);

        if (result.success && result.pdfUrl) {
            toast.success("PDF Gerado com sucesso!", {
                action: {
                    label: "Abrir PDF",
                    onClick: () => window.open(result.pdfUrl, '_blank')
                }
            });
            // Abre automaticamente em nova aba
            window.open(result.pdfUrl, '_blank');
        } else {
            toast.error(result.error || "Erro ao gerar PDF. Tente novamente.");
        }
    } catch (error) {
        toast.error("Falha na comunicação com o gerador.");
    } finally {
        setIsSaving(false);
    }
  };

  // --- ATUALIZADORES DE ESTADO (MEMOIZADOS) ---
  // O uso de useCallback aqui é OBRIGATÓRIO para evitar re-render loops infinitos
  // pois essas funções são passadas como dependências para os useEffects dos filhos.

  const updatePersonalInfo = useCallback((personalInfo: PersonalInfo) => {
    setData(prev => {
        if (JSON.stringify(prev.personalInfo) === JSON.stringify(personalInfo)) return prev;
        return { ...prev, personalInfo };
    });
  }, []);

  const updateExperience = useCallback((experience: Experience[]) => {
    setData(prev => {
        if (JSON.stringify(prev.experience) === JSON.stringify(experience)) return prev;
        return { ...prev, experience };
    });
  }, []);

  const updateEducation = useCallback((education: Education[]) => {
    setData(prev => {
        if (JSON.stringify(prev.education) === JSON.stringify(education)) return prev;
        return { ...prev, education };
    });
  }, []);

  const updateSkills = useCallback((skills: Skill[]) => {
    setData(prev => {
        if (JSON.stringify(prev.skills) === JSON.stringify(skills)) return prev;
        return { ...prev, skills };
    });
  }, []);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      
      {/* 1. HEADER DO EDITOR */}
      <header className="flex items-center justify-between py-4 mb-6 border-b shrink-0 bg-background z-20">
        <div>
          <h1 className="text-xl font-bold truncate max-w-[200px] md:max-w-md flex items-center gap-2" title={resumeTitle}>
            <FileText className="w-5 h-5 text-indigo-600" />
            {resumeTitle}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
             <span className="hidden md:inline">Passo {currentStep + 1} de {STEPS.length}:</span>
             <span className="font-medium text-foreground">{STEPS[currentStep].label}</span>
             
             {lastSaved && (
               <span className="hidden md:flex text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full items-center gap-1 ml-2 border border-emerald-100 animate-in fade-in">
                 <CheckCircle2 className="w-3 h-3" /> Salvo às {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
             )}
          </div>
        </div>
        <div className="flex gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleSave(false)} 
                disabled={isSaving}
                className="gap-2 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
               {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               {isSaving ? "Salvando..." : "Salvar Rascunho"}
            </Button>
        </div>
      </header>

      {/* 2. STEPPER VISUAL */}
      <div className="flex justify-between items-center mb-6 px-2 md:px-4 overflow-x-auto pb-4 shrink-0 no-scrollbar">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 min-w-[70px] md:min-w-[100px]">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 shadow-sm cursor-pointer hover:bg-indigo-50",
                  isActive ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-indigo-200 hover:bg-indigo-700" : 
                  isCompleted ? "bg-white border-indigo-600 text-indigo-600" : 
                  "bg-white border-zinc-200 text-zinc-300"
                )}
                onClick={() => {
                    // Permite voltar, mas bloqueia avanço não sequencial
                    if (index < currentStep) setCurrentStep(index);
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] md:text-xs mt-2 font-medium transition-colors text-center block max-w-[80px]",
                isActive ? "text-indigo-600" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
              
              {/* Linha Conectora */}
              {index !== STEPS.length - 1 && (
                 <div className="hidden md:block absolute top-5 left-1/2 w-[calc(100%-20px)] h-[2px] -z-10 bg-zinc-100">
                    <div 
                        className="h-full bg-indigo-600 transition-all duration-500" 
                        style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                 </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. ÁREA DE CONTEÚDO (Forms Dinâmicos) */}
      <div className="flex-1 bg-card border rounded-xl shadow-sm overflow-hidden relative flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            id="editor-content"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar"
          >
            {/* PASSO 0: DADOS PESSOAIS */}
            {currentStep === 0 && (
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold tracking-tight">Quem é você?</h2>
                        <p className="text-muted-foreground">
                            Suas informações de contato e resumo profissional.
                        </p>
                    </div>
                    <PersonalForm 
                        initialData={data.personalInfo} 
                        onUpdate={updatePersonalInfo} 
                    />
                </div>
            )}
            
            {/* PASSO 1: EXPERIÊNCIA */}
            {currentStep === 1 && (
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold tracking-tight">Histórico Profissional</h2>
                        <p className="text-muted-foreground">
                            Experiências relevantes, focando em conquistas e resultados.
                        </p>
                    </div>
                    <ExperienceForm 
                        initialData={data.experience} 
                        onUpdate={updateExperience} 
                    />
                </div>
            )}

            {/* PASSO 2: EDUCAÇÃO */}
            {currentStep === 2 && (
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold tracking-tight">Formação Acadêmica</h2>
                        <p className="text-muted-foreground">
                            Graduações, cursos técnicos e certificações.
                        </p>
                    </div>
                    <EducationForm 
                        initialData={data.education} 
                        onUpdate={updateEducation} 
                    />
                </div>
            )}

            {/* PASSO 3: SKILLS */}
             {currentStep === 3 && (
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold tracking-tight">Habilidades & Tecnologias</h2>
                        <p className="text-muted-foreground">
                            Tags para suas competências técnicas (Hard Skills) e comportamentais (Soft Skills).
                        </p>
                    </div>
                    <SkillsForm 
                        initialData={data.skills} 
                        onUpdate={updateSkills} 
                    />
                </div>
            )}
            
            {/* PASSO 4: REVIEW & GERAÇÃO */}
             {currentStep === 4 && (
                <div className="h-full flex flex-col justify-center max-w-4xl mx-auto w-full">
                    <ReviewStep 
                        data={data}
                        onGenerate={handleGeneratePDF}
                        isGenerating={isSaving}
                    />
                </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* 4. FOOTER DE NAVEGAÇÃO */}
      <div className="flex justify-between items-center py-6 mt-4 shrink-0 border-t bg-background z-10">
         <Button 
            variant="ghost" 
            onClick={prevStep} 
            disabled={currentStep === 0}
            className="text-muted-foreground hover:text-foreground pl-0 md:pl-4 transition-colors"
         >
            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
         </Button>

         <div className="flex gap-4">
             {/* Botão Próximo / Gerar */}
             <Button 
                onClick={currentStep === STEPS.length - 1 ? handleGeneratePDF : nextStep}
                disabled={isSaving}
                size="lg"
                className={cn(
                    "min-w-[140px] shadow-lg transition-all active:scale-95",
                    currentStep === STEPS.length - 1 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/20"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                )}
             >
                {isSaving ? (
                     <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {currentStep === STEPS.length - 1 ? "Gerando..." : "Salvando..."}
                     </>
                ) : currentStep === STEPS.length - 1 ? (
                    <>
                        Gerar Currículo <Wand2 className="w-4 h-4 ml-2" />
                    </>
                ) : (
                    <>
                        Salvar e Avançar <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                )}
             </Button>
         </div>
      </div>

    </div>
  );
}