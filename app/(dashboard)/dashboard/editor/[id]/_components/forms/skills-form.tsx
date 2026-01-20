"use client";

import { useState, useEffect } from "react";
import { Skill } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // <--- O import que faltava
import { Badge } from "@/components/ui/badge";
import { X, Code, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SkillsFormProps {
  initialData: Skill[];
  onUpdate: (data: Skill[]) => void;
}

export function SkillsForm({ initialData, onUpdate }: SkillsFormProps) {
  const [skills, setSkills] = useState<Skill[]>(initialData || []);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    onUpdate(skills);
  }, [skills, onUpdate]);

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
        <Label>Adicionar Habilidade (Pressione Enter)</Label>
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