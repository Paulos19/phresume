"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Education } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Importando Textarea
import { GraduationCap, Calendar, Plus, Trash2, Pencil, X, School, Sparkles, Wand2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { generateContentFromText } from "@/actions/ai"; // Importando a action

const educationSchema = z.object({
  institution: z.string().min(2, "Instituição é obrigatória"),
  degree: z.string().min(2, "Curso/Grau é obrigatório"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().optional(),
});

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationFormProps {
  initialData: Education[];
  onUpdate: (data: Education[]) => void;
}

export function EducationForm({ initialData, onUpdate }: EducationFormProps) {
  const [educations, setEducations] = useState<Education[]>(initialData || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados da IA
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
  });

  useEffect(() => {
    onUpdate(educations);
  }, [educations, onUpdate]);

  // --- LÓGICA DA IA ---
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
        toast.error("Descreva sua formação primeiro.");
        return;
    }

    setIsGenerating(true);
    toast.info("A IA está analisando sua formação...", { icon: <Sparkles className="text-indigo-400 animate-pulse"/> });

    try {
        // Envia para o n8n com o tipo "education"
        const result = await generateContentFromText(aiPrompt, "education");

        if (result.success && result.data) {
            const aiData = result.data; // Espera-se { institution, degree, startDate, endDate }
            
            // Abre o modo de edição para revisar
            setIsEditing(true);
            setEditingId(null); // Novo item

            // Preenche o formulário
            if (aiData.institution) setValue("institution", aiData.institution);
            if (aiData.degree) setValue("degree", aiData.degree);
            if (aiData.startDate) setValue("startDate", aiData.startDate);
            if (aiData.endDate) setValue("endDate", aiData.endDate);

            toast.success("Dados preenchidos! Revise e salve.");
            setShowAiInput(false);
            setAiPrompt("");
        } else {
            toast.error("Não foi possível entender o texto.");
        }
    } catch (error) {
        toast.error("Erro na comunicação com a IA.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleAddOrUpdate = (data: EducationFormData) => {
    if (editingId) {
      setEducations(prev => prev.map(item => 
        item.id === editingId ? { ...data, id: editingId } : item
      ));
      toast.success("Formação atualizada!");
    } else {
      setEducations(prev => [
        { ...data, id: crypto.randomUUID() },
        ...prev
      ]);
      toast.success("Formação adicionada!");
    }
    cancelEditing();
  };

  const startEditing = (edu: Education) => {
    setEditingId(edu.id);
    setIsEditing(true);
    setValue("institution", edu.institution);
    setValue("degree", edu.degree);
    setValue("startDate", edu.startDate);
    setValue("endDate", edu.endDate || "");
    setShowAiInput(false);
  };

  const deleteEducation = (id: string) => {
    setEducations(prev => prev.filter(item => item.id !== id));
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingId(null);
    reset();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- CARD DE IA --- */}
      {!isEditing && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 shadow-sm mb-6">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Adicionar com IA
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
             
             {showAiInput && (
                 <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                    <Textarea 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ex: Fiz Bacharelado em Design na PUC-RJ de 2018 a 2022."
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
                            {isGenerating ? "Processando..." : "Criar Formação"}
                        </Button>
                    </div>
                 </div>
             )}
          </div>
      )}

      {!isEditing && (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Formação Acadêmica
                </h3>
                <Button onClick={() => setIsEditing(true)} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="w-4 h-4" /> Manual
                </Button>
            </div>

            {educations.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                    <School className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">Nenhuma formação registrada</p>
                    <p className="text-xs text-muted-foreground mt-1">Use a IA acima ou adicione manualmente.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {educations.map((edu) => (
                            <motion.div
                                key={edu.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="group relative border rounded-lg p-4 bg-card hover:border-indigo-200 transition-all shadow-sm flex justify-between items-center"
                            >
                                <div>
                                    <h4 className="font-bold text-lg">{edu.degree}</h4>
                                    <p className="text-indigo-600 font-medium">{edu.institution}</p>
                                    <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {new Date(edu.startDate).getFullYear()} 
                                            {' - '} 
                                            {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Presente'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => startEditing(edu)}>
                                        <Pencil className="w-4 h-4 text-blue-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteEducation(edu.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
      )}

      {isEditing && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border rounded-xl p-6 bg-muted/10 border-indigo-100 shadow-sm"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                   {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                   {editingId ? "Editar Formação" : "Nova Formação"}
                </h3>
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <form onSubmit={handleSubmit(handleAddOrUpdate)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="space-y-2">
                        <Label>Curso / Grau <span className="text-red-500">*</span></Label>
                        <Input {...register("degree")} placeholder="Ex: Bacharelado em Ciência da Computação" className="bg-background" />
                        {errors.degree && <p className="text-red-500 text-xs">{errors.degree.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Instituição <span className="text-red-500">*</span></Label>
                        <Input {...register("institution")} placeholder="Ex: USP - Universidade de São Paulo" className="bg-background" />
                        {errors.institution && <p className="text-red-500 text-xs">{errors.institution.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Data de Início <span className="text-red-500">*</span></Label>
                        <Input type="date" {...register("startDate")} className="bg-background block w-full" />
                        {errors.startDate && <p className="text-red-500 text-xs">{errors.startDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Data de Término (ou Previsão)</Label>
                        <Input type="date" {...register("endDate")} className="bg-background block w-full" />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={cancelEditing}>Cancelar</Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                        {editingId ? "Salvar Alterações" : "Adicionar à Lista"}
                    </Button>
                </div>
            </form>
        </motion.div>
      )}
    </div>
  );
}