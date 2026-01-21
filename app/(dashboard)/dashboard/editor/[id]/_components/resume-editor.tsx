"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResumeContent, PersonalInfo, Experience, Education, Skill } from "@/types/resume";
import { updateResume } from "@/actions/resume";
import { generateResumePDF } from "@/actions/generate";
import { Button } from "@/components/ui/button";
import { 
  User, Briefcase, GraduationCap, Code, Wand2, 
  ChevronRight, ChevronLeft, Save, CheckCircle2, Loader2, ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; 
import Link from "next/link";

// Imports dos Forms
import { PersonalForm } from "./forms/personal-form";
import { ExperienceForm } from "./forms/experience-form";
import { EducationForm } from "./forms/education-form";
import { SkillsForm } from "./forms/skills-form";
import { LivePreview } from "./live-preview"; // <--- NOVO
import { ReviewStep } from "./forms/review-step";

const STEPS = [
  { id: 'personal', label: 'Pessoal', title: 'Vamos começar pelo básico', subtitle: 'Como os recrutadores podem te encontrar?', icon: User },
  { id: 'experience', label: 'Experiência', title: 'Sua jornada até aqui', subtitle: 'Conte sobre suas conquistas profissionais.', icon: Briefcase },
  { id: 'education', label: 'Educação', title: 'Sua base acadêmica', subtitle: 'Onde você aprendeu o que sabe?', icon: GraduationCap },
  { id: 'skills', label: 'Skills', title: 'Seus superpoderes', subtitle: 'Quais ferramentas você domina?', icon: Code },
  { id: 'review', label: 'Finalizar', title: 'Toque de Mágica', subtitle: 'Tudo pronto para gerar seu PDF.', icon: Wand2 },
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

  // --- LÓGICA DE PERSISTÊNCIA ---
  const handleSave = async (silent = false) => {
    setIsSaving(true);
    const result = await updateResume(resumeId, data);
    setIsSaving(false);
    if (result.success) {
      setLastSaved(new Date());
      if (!silent) toast.success("Salvo!");
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
            toast.error(result.error || "Erro ao gerar.");
        }
    } catch {
        toast.error("Erro de conexão.");
    } finally {
        setIsSaving(false);
    }
  };

  // --- UPDATERS ---
  const updatePersonalInfo = useCallback((personalInfo: PersonalInfo) => {
    setData(prev => (JSON.stringify(prev.personalInfo) === JSON.stringify(personalInfo) ? prev : { ...prev, personalInfo }));
  }, []);

  const updateExperience = useCallback((experience: Experience[]) => {
    setData(prev => (JSON.stringify(prev.experience) === JSON.stringify(experience) ? prev : { ...prev, experience }));
  }, []);

  const updateEducation = useCallback((education: Education[]) => {
    setData(prev => (JSON.stringify(prev.education) === JSON.stringify(education) ? prev : { ...prev, education }));
  }, []);

  const updateSkills = useCallback((skills: Skill[]) => {
    setData(prev => (JSON.stringify(prev.skills) === JSON.stringify(skills) ? prev : { ...prev, skills }));
  }, []);

  // Calc Progress
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row overflow-hidden h-screen">
      
      {/* =======================
          LADO ESQUERDO: EDITOR
         ======================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Navigation Bar */}
        <header className="px-8 py-5 border-b bg-white flex items-center justify-between shrink-0 z-20">
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
                            Passo {currentStep + 1} de {STEPS.length}
                        </span>
                        {lastSaved && (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-1 bg-emerald-50 px-1.5 rounded">
                                <CheckCircle2 className="w-3 h-3" /> Salvo
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Save Button Manual */}
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSave(false)} 
                disabled={isSaving}
                className="hidden md:flex"
            >
               {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </Button>
        </header>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
            <motion.div 
                className="h-full bg-indigo-600" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>

        {/* Main Form Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 relative">
            <div className="max-w-2xl mx-auto pb-20">
                
                {/* Step Header (Onboarding Style) */}
                <motion.div 
                    key={`header-${currentStep}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 shadow-sm">
                        {(() => { const Icon = STEPS[currentStep].icon; return <Icon className="w-6 h-6" /> })()}
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {STEPS[currentStep].title}
                    </h2>
                    <p className="text-slate-500 mt-2 text-lg">
                        {STEPS[currentStep].subtitle}
                    </p>
                </motion.div>

                {/* Dynamic Form Render */}
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
                        {currentStep === 4 && <ReviewStep data={data} onGenerate={handleGeneratePDF} isGenerating={isSaving} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>

        {/* Footer Navigation (Floating) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t flex justify-between items-center z-10">
            <Button 
                variant="ghost" 
                onClick={prevStep} 
                disabled={currentStep === 0}
                className="text-slate-500 hover:text-slate-900"
            >
                <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>
            
            <Button 
                onClick={currentStep === STEPS.length - 1 ? handleGeneratePDF : nextStep}
                disabled={isSaving}
                className={cn(
                    "px-8 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95",
                    currentStep === STEPS.length - 1 
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                )}
            >
                 {isSaving ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                 ) : currentStep === STEPS.length - 1 ? (
                    <>Gerar PDF <Wand2 className="ml-2 w-4 h-4" /></>
                 ) : (
                    <>Continuar <ChevronRight className="ml-2 w-4 h-4" /></>
                 )}
            </Button>
        </div>
      </div>

      {/* =======================
          LADO DIREITO: PREVIEW
         ======================= */}
      <div className="hidden lg:block w-[45%] bg-slate-100/50 border-l p-8 h-full overflow-hidden relative">
         <div className="h-full flex flex-col">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Preview ao Vivo</h3>
                <div className="text-xs text-muted-foreground bg-white px-2 py-1 rounded border">A4 Portrait</div>
            </div>
            
            <div className="flex-1 overflow-hidden rounded-xl shadow-2xl border border-slate-200/60 ring-4 ring-slate-100">
                <LivePreview data={data} className="h-full w-full" />
            </div>
         </div>
      </div>

    </div>
  );
}