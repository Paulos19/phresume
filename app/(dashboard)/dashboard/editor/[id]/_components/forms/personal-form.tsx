"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PersonalInfo } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Mail, Phone, Linkedin, Github, Globe, User, Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Schema atualizado com photoUrl
const personalSchema = z.object({
  fullName: z.string().min(2, "Nome é obrigatório"),
  headline: z.string().min(2, "Cargo/Headline é obrigatório (ex: Desenvolvedor Front-end)"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  location: z.string().optional(),
  photoUrl: z.string().optional(), // Novo campo
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, watch, setValue, formState: { errors } } = useForm<PersonalInfo>({
    resolver: zodResolver(personalSchema),
    defaultValues: initialData,
  });

  const photoUrl = watch("photoUrl");

  // Observa mudanças e notifica o pai
  useEffect(() => {
    const subscription = watch((value) => {
      onUpdate(value as PersonalInfo);
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdate]);

  // Lógica de Upload para Vercel Blob
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica de tipo
    if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione apenas arquivos de imagem.");
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw new Error("Falha no upload");

        const data = await response.json();
        
        // Atualiza o estado do formulário com a URL pública
        setValue("photoUrl", data.url); 
        toast.success("Foto atualizada com sucesso!");
    } catch (error) {
        console.error(error);
        toast.error("Erro ao enviar imagem. Tente novamente.");
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- SEÇÃO DE UPLOAD DA FOTO --- */}
      <div className="flex items-center gap-6 p-4 bg-muted/20 rounded-xl border border-dashed border-indigo-200">
         <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-white shadow-sm bg-white">
                <AvatarImage src={photoUrl} className="object-cover" />
                <AvatarFallback className="bg-indigo-50 text-indigo-600 text-2xl font-bold">
                    {initialData.fullName?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
                </AvatarFallback>
            </Avatar>
            
            {/* Overlay de Edição (Câmera) */}
            <div 
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <Camera className="text-white w-8 h-8" />
            </div>
            
            {/* Input Escondido */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageUpload}
                disabled={isUploading}
            />
         </div>

         <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-foreground">Sua Foto de Perfil</h3>
            <p className="text-sm text-muted-foreground">
                Adicione uma foto profissional para personalizar seu currículo.
            </p>
            <div className="flex gap-2">
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white"
                >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                    {isUploading ? "Enviando..." : "Alterar Foto"}
                </Button>
                
                {photoUrl && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setValue("photoUrl", "")}
                        disabled={isUploading}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
         </div>
      </div>

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