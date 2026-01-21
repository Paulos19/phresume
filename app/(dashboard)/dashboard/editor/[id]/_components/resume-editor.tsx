"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResumeContent, PersonalInfo, Experience, Education, Skill, TemplateConfig } from "@/types/resume";
import { updateResume } from "@/actions/resume";
import { generateResumePDF } from "@/actions/generate";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  User, Briefcase, GraduationCap, Code, Wand2, 
  ChevronRight, ChevronLeft, Save, CheckCircle2, Loader2, ArrowLeft,
  Eye, EyeOff, Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; 
import Link from "next/link";

// Imports dos Forms
import { PersonalForm } from "./forms/personal-form";
import { ExperienceForm } from "./forms/experience-form";
import { EducationForm } from "./forms/education-form";
import { SkillsForm } from "./forms/skills-form";
import { DesignForm } from "./forms/design-form"; // <--- NOVO
import { LivePreview } from "./live-preview";
import { ReviewStep } from "./forms/review-step";

// Configuração padrão para evitar erros de undefined
const DEFAULT_CONFIG: TemplateConfig = {
  layout: 'modern',
  fontFamily: 'Inter',
  photoPosition: 'left',
  primaryColor: '#4f46e5',
  texture: 'none'
};

const STEPS = [
  { id: 'personal', label: 'Pessoal', title: 'Vamos começar pelo básico', subtitle: 'Como os recrutadores podem te encontrar?', icon: User },
  { id: 'experience', label: 'Experiência', title: 'Sua jornada até aqui', subtitle: 'Conte sobre suas conquistas profissionais.', icon: Briefcase },
  { id: 'education', label: 'Educação', title: 'Sua base acadêmica', subtitle: 'Onde você aprendeu o que sabe?', icon: GraduationCap },
  { id: 'skills', label: 'Skills', title: 'Seus superpoderes', subtitle: 'Quais ferramentas você domina?', icon: Code },
  { id: 'design', label: 'Aparência', title: 'Personalize o visual', subtitle: 'Escolha cores, fontes e o layout do seu currículo.', icon: Palette }, // <--- NOVO PASSO
  { id: 'review', label: 'Finalizar', title: 'Toque de Mágica', subtitle: 'Tudo pronto para gerar seu PDF.', icon: Wand2 },
];

interface ResumeEditorProps {
  resumeId: string;
  initialData: ResumeContent;
  resumeTitle: string;
}

export function ResumeEditor({ resumeId, initialData, resumeTitle }: ResumeEditorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ResumeContent>({
    ...initialData,
    templateConfig: initialData.templateConfig || DEFAULT_CONFIG // Garante config inicial
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // --- LÓGICA DE PERSISTÊNCIA ---
  const handleSave = async (silent = false) => {
    setIsSaving(true);
    const result = await updateResume(resumeId, data);
    setIsSaving(false);
    if (result.success) {
      setLastSaved(new Date());
      if (!silent) toast.success("Alterações salvas!");
    }
  };

  // --- NAVEGAÇÃO ---
  const nextStep = async () => {
    await handleSave(true);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(c => c + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleGeneratePDF = async () => {
    await handleSave(true);
    setIsSaving(true);
    toast.info("A IA está montando seu PDF...", { icon: <Wand2 className="animate-pulse text-indigo-500" /> });

    try {
        const result = await generateResumePDF(resumeId);
        if (result.success && result.pdfUrl) {
            toast.success("Pronto! Abrindo PDF...");
            window.open(result.pdfUrl, '_blank');
        } else {
            toast.error(result.error || "Erro ao gerar PDF.");
        }
    } catch {
        toast.error("Erro de conexão com o servidor.");
    } finally {
        setIsSaving(false);
    }
  };

  // --- UPDATERS (Usando useCallback para performance) ---
  const updatePersonalInfo = useCallback((personalInfo: PersonalInfo) => {
    setData(prev => ({ ...prev, personalInfo }));
  }, []);

  const updateExperience = useCallback((experience: Experience[]) => {
    setData(prev => ({ ...prev, experience }));
  }, []);

  const updateEducation = useCallback((education: Education[]) => {
    setData(prev => ({ ...prev, education }));
  }, []);

  const updateSkills = useCallback((skills: Skill[]) => {
    setData(prev => ({ ...prev, skills }));
  }, []);

  const updateTemplateConfig = useCallback((templateConfig: TemplateConfig) => {
    setData(prev => ({ ...prev, templateConfig }));
  }, []);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col h-screen overflow-hidden">
      
      {/* Top Navigation Bar */}
      <header className="px-8 py-4 border-b bg-white flex items-center justify-between shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
              <Link href="/dashboard/resumes">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                      <ArrowLeft className="w-5 h-5 text-slate-500" />
                  </Button>
              </Link>
              <div>
                  <h1 className="font-bold text-slate-800 text-lg leading-none">{resumeTitle}</h1>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-medium">
                          Passo {currentStep + 1} de {STEPS.length} • {STEPS[currentStep].label}
                      </span>
                      {lastSaved && (
                          <span className="text-[10px] text-emerald-600 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              <CheckCircle2 className="w-3 h-3" /> Atualizado
                          </span>
                      )}
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-inner">
              {showPreview ? <Eye className="w-4 h-4 text-indigo-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
              <Label htmlFor="preview-mode" className="text-[10px] uppercase font-bold tracking-wider cursor-pointer text-slate-600">
                Preview
              </Label>
              <Switch 
                id="preview-mode" 
                checked={showPreview} 
                onCheckedChange={setShowPreview} 
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>

            <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSave(false)} 
                disabled={isSaving}
                className="hidden md:flex bg-white hover:bg-slate-50 border-slate-200"
            >
               {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
               Salvar
            </Button>
          </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1 shrink-0">
          <motion.div 
              className="h-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
          />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LADO ESQUERDO: EDITOR */}
        <motion.div 
          layout
          className={cn(
            "flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 relative transition-all duration-500",
            !showPreview ? "max-w-4xl mx-auto w-full" : "w-full"
          )}
        >
            <div className={cn("mx-auto pb-24 transition-all duration-500", !showPreview ? "max-w-3xl" : "max-w-2xl")}>
                
                {/* Step Header */}
                <motion.div 
                    key={`header-${currentStep}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 shadow-sm">
                        {(() => { const Icon = STEPS[currentStep].icon; return <Icon className="w-7 h-7" /> })()}
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {STEPS[currentStep].title}
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg leading-relaxed">
                        {STEPS[currentStep].subtitle}
                    </p>
                </motion.div>

                {/* Renderização Dinâmica dos Formulários */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {currentStep === 0 && <PersonalForm initialData={data.personalInfo} onUpdate={updatePersonalInfo} />}
                        {currentStep === 1 && <ExperienceForm initialData={data.experience} onUpdate={updateExperience} />}
                        {currentStep === 2 && <EducationForm initialData={data.education} onUpdate={updateEducation} />}
                        {currentStep === 3 && <SkillsForm initialData={data.skills} onUpdate={updateSkills} />}
                        {currentStep === 4 && (
                          <DesignForm 
                            config={data.templateConfig || DEFAULT_CONFIG} 
                            onUpdate={updateTemplateConfig} 
                          />
                        )}
                        {currentStep === 5 && (
                          <ReviewStep 
                            data={data} 
                            onGenerate={handleGeneratePDF} 
                            isGenerating={isSaving} 
                          />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>

        {/* LADO DIREITO: LIVE PREVIEW */}
        <AnimatePresence>
          {showPreview && (
            <motion.div 
              initial={{ opacity: 0, x: 300, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "45%" }}
              exit={{ opacity: 0, x: 300, width: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="hidden lg:block bg-slate-100/50 border-l p-8 h-full overflow-hidden relative shrink-0"
            >
               <div className="h-full flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Preview ao Vivo
                      </h3>
                      <div className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded border shadow-sm uppercase tracking-tight">
                        Formato A4
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-hidden rounded-xl shadow-2xl border border-slate-200/60 ring-8 ring-slate-200/20 bg-white">
                      {/* O LivePreview agora recebe os dados completos, incluindo o estilo */}
                      <LivePreview data={data} className="h-full w-full" />
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <footer className="p-6 bg-white/90 backdrop-blur-md border-t flex justify-between items-center z-10 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <Button 
              variant="ghost" 
              onClick={prevStep} 
              disabled={currentStep === 0}
              className="text-slate-500 hover:text-slate-900 font-medium px-6"
          >
              <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          
          <Button 
              onClick={currentStep === STEPS.length - 1 ? handleGeneratePDF : nextStep}
              disabled={isSaving}
              className={cn(
                  "px-8 font-bold shadow-lg transition-all hover:scale-105 active:scale-95",
                  currentStep === STEPS.length - 1 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none shadow-indigo-200" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
              )}
          >
               {isSaving ? (
                   <>Aguarde... <Loader2 className="ml-2 w-4 h-4 animate-spin" /></>
               ) : currentStep === STEPS.length - 1 ? (
                  <>Finalizar Currículo <Wand2 className="ml-2 w-4 h-4" /></>
               ) : (
                  <>Avançar <ChevronRight className="ml-2 w-4 h-4" /></>
               )}
          </Button>
      </footer>
    </div>
  );
}