"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Education } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Calendar, Plus, Trash2, Pencil, X, School } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
  });

  useEffect(() => {
    onUpdate(educations);
  }, [educations, onUpdate]);

  const handleAddOrUpdate = (data: EducationFormData) => {
    if (editingId) {
      setEducations(prev => prev.map(item => 
        item.id === editingId ? { ...data, id: editingId } : item
      ));
    } else {
      setEducations(prev => [
        { ...data, id: crypto.randomUUID() },
        ...prev
      ]);
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
      
      {!isEditing && (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Formação Acadêmica
                </h3>
                <Button onClick={() => setIsEditing(true)} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="w-4 h-4" /> Adicionar Formação
                </Button>
            </div>

            {educations.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                    <School className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">Nenhuma formação registrada</p>
                    <p className="text-xs text-muted-foreground mt-1">Adicione graduações, cursos técnicos ou certificações.</p>
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