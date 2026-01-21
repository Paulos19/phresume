"use client";

import { useState, useEffect } from "react";
import { Skill } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea"; // Importando Textarea
import { X, Code, Plus, Sparkles, Wand2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { generateContentFromText } from "@/actions/ai"; // Importando a action

interface SkillsFormProps {
  initialData: Skill[];
  onUpdate: (data: Skill[]) => void;
}

export function SkillsForm({ initialData, onUpdate }: SkillsFormProps) {
  const [skills, setSkills] = useState<Skill[]>(initialData || []);
  const [inputValue, setInputValue] = useState("");

  // Estados da IA
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);

  useEffect(() => {
    onUpdate(skills);
  }, [skills, onUpdate]);

  // --- LÓGICA DA IA ---
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
        toast.error("Liste suas habilidades ou tecnologias.");
        return;
    }

    setIsGenerating(true);
    toast.info("Extraindo habilidades do texto...", { icon: <Sparkles className="text-indigo-400 animate-pulse"/> });

    try {
        // Envia para o n8n com o tipo "skills"
        // O n8n deve retornar: { skills: ["React", "Node.js", "AWS"] }
        const result = await generateContentFromText(aiPrompt, "skills");

        if (result.success && result.data && Array.isArray(result.data.skills)) {
            const newSkillsNames = result.data.skills as string[];
            let addedCount = 0;

            const newSkillsObjects: Skill[] = [];

            newSkillsNames.forEach(name => {
                const trimmedName = name.trim();
                // Verifica duplicidade (Case insensitive)
                const exists = skills.some(s => s.name.toLowerCase() === trimmedName.toLowerCase()) || 
                               newSkillsObjects.some(s => s.name.toLowerCase() === trimmedName.toLowerCase());

                if (!exists && trimmedName.length > 0) {
                    newSkillsObjects.push({
                        id: crypto.randomUUID(),
                        name: trimmedName,
                        level: "Advanced"
                    });
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                setSkills(prev => [...prev, ...newSkillsObjects]);
                toast.success(`${addedCount} habilidades adicionadas!`);
                setShowAiInput(false);
                setAiPrompt("");
            } else {
                toast.info("Nenhuma habilidade nova encontrada (talvez já existam na lista).");
            }
        } else {
            toast.error("Não foi possível identificar habilidades no texto.");
        }
    } catch (error) {
        toast.error("Erro na comunicação com a IA.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const addSkill = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Evita duplicatas (case insensitive)
    if (skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      toast.warning("Essa habilidade já está na lista.");
      return;
    }

    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: trimmed,
      level: "Advanced" // Default
    };

    setSkills([...skills, newSkill]);
    setInputValue("");
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- CARD DE IA --- */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
         <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Extrair com IA
            </h3>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAiInput(!showAiInput)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 h-8"
            >
                {showAiInput ? "Fechar" : "Abrir"}
            </Button>
         </div>
         
         {showAiInput ? (
             <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <Textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Cole um texto ou lista aqui. Ex: 'Tenho experiência sólida em React, Next.js e Tailwind CSS. Também uso Docker e AWS no dia a dia.'"
                    className="bg-white/80 min-h-[80px] text-sm"
                />
                <div className="flex justify-end">
                    <Button 
                        onClick={handleAIGenerate} 
                        disabled={isGenerating}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Wand2 className="w-4 h-4 mr-2"/>}
                        {isGenerating ? "Processando..." : "Extrair Tags"}
                    </Button>
                </div>
             </div>
         ) : (
             <p className="text-xs text-indigo-700/80 cursor-pointer" onClick={() => setShowAiInput(true)}>
                 Clique em <strong>"Abrir"</strong> para colar uma lista ou descrição e deixar a IA extrair as tags para você.
             </p>
         )}
      </div>

      <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
            <Code className="w-4 h-4" /> Dica de Especialista
          </h3>
          <p className="text-sm text-indigo-700 leading-relaxed">
            Recrutadores e sistemas de ATS buscam palavras-chave específicas. 
            Liste tecnologias (ex: <strong>React, Node.js</strong>) e soft skills importantes.
          </p>
      </div>

      <div className="space-y-3">
        <Label>Adicionar Habilidade Manualmente (Pressione Enter)</Label>
        <div className="flex gap-2">
            <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: TypeScript, Figma, Liderança..."
                className="bg-background"
            />
            <Button onClick={addSkill} size="icon" type="button" className="shrink-0 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
            </Button>
        </div>
      </div>

      <div className="min-h-[100px] p-4 bg-muted/20 rounded-xl border border-dashed flex flex-wrap content-start gap-2">
         <AnimatePresence>
            {skills.map((skill) => (
                <motion.div
                    key={skill.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    layout
                >
                    <Badge variant="secondary" className="pl-3 pr-1 py-1.5 text-sm bg-white border-zinc-200 hover:bg-zinc-50 shadow-sm flex items-center gap-1">
                        {skill.name}
                        <button 
                            onClick={() => removeSkill(skill.id)}
                            type="button"
                            className="ml-1 hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                </motion.div>
            ))}
         </AnimatePresence>
         
         {skills.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm italic opacity-70">
                Sua lista de habilidades aparecerá aqui...
            </div>
         )}
      </div>

      <div className="flex justify-end">
         <p className="text-xs text-muted-foreground">
            Total: {skills.length} habilidades listadas
         </p>
      </div>
    </div>
  );
}