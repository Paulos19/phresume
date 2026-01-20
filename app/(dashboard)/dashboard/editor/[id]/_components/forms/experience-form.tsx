"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Experience } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Briefcase, Calendar, Plus, Trash2, Pencil, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Schema de validação para UM item de experiência
const experienceItemSchema = z.object({
  company: z.string().min(2, "Nome da empresa é obrigatório"),
  position: z.string().min(2, "Cargo é obrigatório"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().min(10, "Descreva suas responsabilidades (mínimo 10 caracteres)"),
}).refine((data) => data.current || !!data.endDate, {
  message: "Selecione a data de término ou marque 'Trabalho aqui atualmente'",
  path: ["endDate"],
});

type ExperienceFormData = z.infer<typeof experienceItemSchema>;

interface ExperienceFormProps {
  initialData: Experience[];
  onUpdate: (data: Experience[]) => void;
}

export function ExperienceForm({ initialData, onUpdate }: ExperienceFormProps) {
  const [experiences, setExperiences] = useState<Experience[]>(initialData || []);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Hook Form
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceItemSchema),
    defaultValues: {
      current: false,
      company: "",
      position: "",
      description: "",
      startDate: "",
      endDate: ""
    }
  });

  const isCurrent = watch("current");

  // Atualiza o pai sempre que a lista local mudar
  useEffect(() => {
    onUpdate(experiences);
  }, [experiences, onUpdate]);

  const handleAddOrUpdate = (data: ExperienceFormData) => {
    if (editingId) {
      // Atualizar existente
      setExperiences(prev => prev.map(item => 
        item.id === editingId ? { ...data, id: editingId } : item
      ));
    } else {
      // Criar novo (Gera ID temporário)
      setExperiences(prev => [
        { ...data, id: crypto.randomUUID() },
        ...prev // Adiciona no topo
      ]);
    }
    cancelEditing();
  };

  const startEditing = (experience: Experience) => {
    setEditingId(experience.id);
    setIsEditing(true);
    // Popula o form
    setValue("company", experience.company);
    setValue("position", experience.position);
    setValue("startDate", experience.startDate);
    setValue("endDate", experience.endDate || "");
    setValue("current", experience.current);
    setValue("description", experience.description);
  };

  const deleteExperience = (id: string) => {
    setExperiences(prev => prev.filter(item => item.id !== id));
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingId(null);
    reset();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER & LISTA DE EXPERIÊNCIAS */}
      {!isEditing && (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Histórico Profissional
                </h3>
                <Button onClick={() => setIsEditing(true)} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="w-4 h-4" /> Adicionar Experiência
                </Button>
            </div>

            {experiences.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                    <Briefcase className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">Nenhuma experiência registrada</p>
                    <p className="text-xs text-muted-foreground mt-1">Adicione seus empregos passados e atuais.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {experiences.map((exp) => (
                            <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="group relative border rounded-lg p-4 bg-card hover:border-indigo-200 transition-all shadow-sm"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-lg">{exp.position}</h4>
                                        <p className="text-indigo-600 font-medium">{exp.company}</p>
                                        <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                                            <Calendar className="w-3 h-3" />
                                            <span>
                                                {new Date(exp.startDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} 
                                                {' - '} 
                                                {exp.current ? <span className="text-emerald-600 font-bold">Atualmente</span> : 
                                                 exp.endDate ? new Date(exp.endDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" onClick={() => startEditing(exp)}>
                                            <Pencil className="w-4 h-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteExperience(exp.id)}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                                    {exp.description}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
      )}

      {/* FORMULÁRIO DE EDIÇÃO/CRIAÇÃO */}
      {isEditing && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border rounded-xl p-6 bg-muted/10 border-indigo-100 shadow-sm"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                   {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                   {editingId ? "Editar Experiência" : "Nova Experiência"}
                </h3>
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <form onSubmit={handleSubmit(handleAddOrUpdate)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Cargo */}
                    <div className="space-y-2">
                        <Label>Cargo / Função <span className="text-red-500">*</span></Label>
                        <Input {...register("position")} placeholder="Ex: Desenvolvedor Full Stack" className="bg-background" />
                        {errors.position && <p className="text-red-500 text-xs">{errors.position.message}</p>}
                    </div>

                    {/* Empresa */}
                    <div className="space-y-2">
                        <Label>Empresa <span className="text-red-500">*</span></Label>
                        <Input {...register("company")} placeholder="Ex: Google Inc." className="bg-background" />
                        {errors.company && <p className="text-red-500 text-xs">{errors.company.message}</p>}
                    </div>

                    {/* Data Início */}
                    <div className="space-y-2">
                        <Label>Data de Início <span className="text-red-500">*</span></Label>
                        <Input type="date" {...register("startDate")} className="bg-background block w-full" />
                        {errors.startDate && <p className="text-red-500 text-xs">{errors.startDate.message}</p>}
                    </div>

                    {/* Data Término */}
                    <div className="space-y-2">
                        <Label className={cn("transition-colors", isCurrent && "text-muted-foreground")}>Data de Término</Label>
                        <Input 
                            type="date" 
                            {...register("endDate")} 
                            disabled={isCurrent} 
                            className="bg-background block w-full disabled:opacity-50" 
                        />
                        {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate.message}</p>}
                        
                        <div className="flex items-center space-x-2 mt-2">
                            <Checkbox 
                                id="current" 
                                checked={isCurrent} 
                                onCheckedChange={(checked) => {
                                    setValue("current", checked === true);
                                    if (checked) setValue("endDate", undefined); // Limpa data se for atual
                                }}
                            />
                            <label htmlFor="current" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                Trabalho aqui atualmente
                            </label>
                        </div>
                    </div>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label>Principais Atividades <span className="text-red-500">*</span></Label>
                        <button type="button" className="text-xs text-indigo-600 flex items-center gap-1 hover:underline">
                           <Sparkles className="w-3 h-3" /> Melhorar com IA (Em breve)
                        </button>
                    </div>
                    <Textarea 
                        {...register("description")} 
                        placeholder="• Desenvolvi interfaces usando React...&#10;• Liderei equipe de 5 pessoas..." 
                        className="min-h-[150px] bg-background resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">Mínimo 10 caracteres.</p>
                    {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
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