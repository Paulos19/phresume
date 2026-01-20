"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PersonalInfo } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Se ainda não tiver, npx shadcn@latest add textarea
import { MapPin, Mail, Phone, Linkedin, Github, Globe, User } from "lucide-react";

const personalSchema = z.object({
  fullName: z.string().min(2, "Nome é obrigatório"),
  headline: z.string().min(2, "Cargo/Headline é obrigatório (ex: Desenvolvedor Front-end)"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  githubUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  portfolioUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  summary: z.string().optional(),
});

interface PersonalFormProps {
  initialData: PersonalInfo;
  onUpdate: (data: PersonalInfo) => void;
}

export function PersonalForm({ initialData, onUpdate }: PersonalFormProps) {
  const { register, watch, formState: { errors } } = useForm<PersonalInfo>({
    resolver: zodResolver(personalSchema),
    defaultValues: initialData,
  });

  // Observa mudanças no formulário e notifica o componente pai em tempo real
  useEffect(() => {
    const subscription = watch((value) => {
      // O cast é necessário pois o watch retorna DeepPartial
      onUpdate(value as PersonalInfo);
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdate]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Nome Completo */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
             <User className="w-4 h-4 text-muted-foreground" /> Nome Completo
          </Label>
          <Input {...register("fullName")} placeholder="Seu nome completo" className="bg-muted/30" />
          {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
        </div>

        {/* Headline (Cargo) */}
        <div className="space-y-2">
          <Label>Headline / Cargo</Label>
          <Input {...register("headline")} placeholder="Ex: Senior Frontend Developer" className="bg-muted/30" />
          {errors.headline && <p className="text-red-500 text-xs">{errors.headline.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
             <Mail className="w-4 h-4 text-muted-foreground" /> Email Profissional
          </Label>
          <Input {...register("email")} placeholder="seu@email.com" className="bg-muted/30" />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
             <Phone className="w-4 h-4 text-muted-foreground" /> Telefone / WhatsApp
          </Label>
          <Input {...register("phone")} placeholder="(11) 99999-9999" className="bg-muted/30" />
        </div>

        {/* Localização */}
        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2">
             <MapPin className="w-4 h-4 text-muted-foreground" /> Localização
          </Label>
          <Input {...register("location")} placeholder="São Paulo, SP - Brasil (ou Remoto)" className="bg-muted/30" />
        </div>

      </div>

      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Links Sociais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LinkedIn */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-600" /> LinkedIn
                </Label>
                <Input {...register("linkedinUrl")} placeholder="linkedin.com/in/voce" className="bg-muted/30" />
            </div>

            {/* GitHub */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Github className="w-4 h-4" /> GitHub
                </Label>
                <Input {...register("githubUrl")} placeholder="github.com/voce" className="bg-muted/30" />
            </div>

             {/* Portfolio */}
             <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" /> Portfólio / Site
                </Label>
                <Input {...register("portfolioUrl")} placeholder="seu-site.com" className="bg-muted/30" />
            </div>
        </div>
      </div>

      <div className="border-t pt-6">
         <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Resumo Profissional</h3>
         <div className="space-y-2">
            <Label>Sobre você</Label>
            <Textarea 
                {...register("summary")} 
                placeholder="Escreva um breve resumo sobre sua carreira. Se preferir, deixe em branco para nossa IA gerar depois." 
                className="min-h-[120px] bg-muted/30 resize-none leading-relaxed"
            />
            <p className="text-xs text-muted-foreground text-right">Dica: Foque em resultados e tecnologias principais.</p>
         </div>
      </div>
    </div>
  );
}