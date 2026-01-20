"use client";

import { ResumeContent } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Wand2, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface ReviewStepProps {
  data: ResumeContent;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function ReviewStep({ data, onGenerate, isGenerating }: ReviewStepProps) {
  
  // Verificação simples de completude
  const checks = [
    { label: "Dados Pessoais", valid: !!data.personalInfo.fullName && !!data.personalInfo.email },
    { label: "Experiência Profissional", valid: data.experience.length > 0 },
    { label: "Formação Acadêmica", valid: data.education.length > 0 },
    { label: "Habilidades Técnicas", valid: data.skills.length >= 3 },
  ];

  const allValid = checks.every(c => c.valid);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto text-center">
      
      <div className="mb-8">
         <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-10 h-10 text-indigo-600" />
         </div>
         <h2 className="text-2xl font-bold">Tudo pronto para a mágica?</h2>
         <p className="text-muted-foreground mt-2">
            Nossa IA vai analisar seus dados, estruturar as bullets points e gerar um PDF otimizado para ATS.
         </p>
      </div>

      {/* Checklist de Validação */}
      <div className="bg-card border rounded-xl p-6 shadow-sm text-left">
         <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Checklist de Qualidade</h3>
         <div className="space-y-3">
            {checks.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.valid ? (
                        <div className="flex items-center text-emerald-600 text-xs font-bold gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Completo
                        </div>
                    ) : (
                        <div className="flex items-center text-amber-600 text-xs font-bold gap-1 bg-amber-50 px-2 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3" /> Pendente
                        </div>
                    )}
                </div>
            ))}
         </div>
      </div>

      <div className="pt-4">
        <Button 
            size="lg" 
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]"
            onClick={onGenerate}
            disabled={isGenerating || !allValid}
        >
            {isGenerating ? "Gerando seu Currículo..." : "Gerar PDF com Inteligência Artificial"}
        </Button>
        {!allValid && (
            <p className="text-xs text-red-500 mt-2">
                Preencha os itens pendentes para liberar a geração.
            </p>
        )}
      </div>

    </div>
  );
}