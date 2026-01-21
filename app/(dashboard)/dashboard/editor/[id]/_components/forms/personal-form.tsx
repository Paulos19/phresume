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
import { 
  MapPin, Mail, Phone, Linkedin, Github, Globe, User, 
  Camera, Loader2, Trash2, Sparkles, Wand2 
} from "lucide-react";
import { toast } from "sonner";
import { generateProfileFromText } from "@/actions/ai"; // Importe a action criada acima

const personalSchema = z.object({
  fullName: z.string().min(2, "Nome é obrigatório"),
  headline: z.string().min(2, "Cargo/Headline é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  location: z.string().optional(),
  photoUrl: z.string().optional(),
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
  const [isGenerating, setIsGenerating] = useState(false); // Estado da IA
  const [aiPrompt, setAiPrompt] = useState(""); // Texto da IA
  const [showAiInput, setShowAiInput] = useState(false); // Toggle da área IA
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, watch, setValue, formState: { errors } } = useForm<PersonalInfo>({
    resolver: zodResolver(personalSchema) as any,
    defaultValues: initialData,
  });

  const photoUrl = watch("photoUrl");

  useEffect(() => {
    const subscription = watch((value) => {
      onUpdate(value as PersonalInfo);
    });
    return () => subscription.unsubscribe();
  }, [watch, onUpdate]);

  // --- LÓGICA DA IA ---
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
        toast.error("Descreva seu perfil primeiro.");
        return;
    }

    setIsGenerating(true);
    toast.info("A IA está lendo seu perfil...", { icon: <Sparkles className="text-indigo-400 animate-pulse"/> });

    try {
        const result = await generateProfileFromText(aiPrompt);

        if (result.success && result.data) {
            const aiData = result.data;
            
            // Popula os campos automaticamente
            if (aiData.fullName) setValue("fullName", aiData.fullName);
            if (aiData.headline) setValue("headline", aiData.headline);
            if (aiData.email) setValue("email", aiData.email);
            if (aiData.phone) setValue("phone", aiData.phone);
            if (aiData.location) setValue("location", aiData.location);
            if (aiData.linkedinUrl) setValue("linkedinUrl", aiData.linkedinUrl);
            if (aiData.githubUrl) setValue("githubUrl", aiData.githubUrl);
            if (aiData.portfolioUrl) setValue("portfolioUrl", aiData.portfolioUrl);
            if (aiData.summary) setValue("summary", aiData.summary);

            toast.success("Campos preenchidos pela IA!");
            setShowAiInput(false); // Fecha a área de IA após sucesso
        } else {
            toast.error("Não foi possível extrair dados do texto.");
        }
    } catch (error) {
        toast.error("Erro na comunicação com a IA.");
    } finally {
        setIsGenerating(false);
    }
  };

  // --- LÓGICA DE UPLOAD ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione apenas arquivos de imagem.");
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        if (!response.ok) throw new Error("Falha no upload");
        const data = await response.json();
        setValue("photoUrl", data.url); 
        toast.success("Foto atualizada!");
    } catch (error) {
        toast.error("Erro ao enviar imagem.");
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- ÁREA DE IA (NOVIDADE) --- */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 shadow-sm">
         <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Preenchimento Inteligente
            </h3>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAiInput(!showAiInput)}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 h-8"
            >
                {showAiInput ? "Fechar IA" : "Usar IA"}
            </Button>
         </div>
         
         {showAiInput ? (
             <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <Textarea 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Sou o João Silva, Engenheiro de Software Sênior em São Paulo. Meu email é joao@email.com. Tenho 10 anos de experiência com React. (Cole seu resumo do LinkedIn aqui...)"
                    className="bg-white/80 min-h-[100px] text-sm"
                />
                <div className="flex justify-end">
                    <Button 
                        onClick={handleAIGenerate} 
                        disabled={isGenerating}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Wand2 className="w-4 h-4 mr-2"/>}
                        {isGenerating ? "Analisando..." : "Preencher Formulário"}
                    </Button>
                </div>
             </div>
         ) : (
             <p className="text-xs text-indigo-700/80 cursor-pointer" onClick={() => setShowAiInput(true)}>
                 Clique em <strong>"Usar IA"</strong> para preencher seus dados automaticamente descrevendo seu perfil.
             </p>
         )}
      </div>

      {/* --- UPLOAD FOTO --- */}
      <div className="flex items-center gap-6 p-4 bg-muted/20 rounded-xl border border-dashed border-zinc-200">
         <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-white shadow-sm bg-white">
                <AvatarImage src={photoUrl} className="object-cover" />
                <AvatarFallback className="bg-indigo-50 text-indigo-600 text-2xl font-bold">
                    {initialData.fullName?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
                </AvatarFallback>
            </Avatar>
            <div 
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <Camera className="text-white w-8 h-8" />
            </div>
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
            <h3 className="font-semibold text-foreground">Sua Foto</h3>
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
                    Alterar
                </Button>
                {photoUrl && (
                    <Button 
                        type="button" variant="ghost" size="sm"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => setValue("photoUrl", "")}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
         </div>
      </div>

      {/* --- CAMPOS DO FORMULÁRIO (Preenchidos pela IA ou Manualmente) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Nome Completo</Label>
          <Input {...register("fullName")} className="bg-muted/30" placeholder="Seu nome" />
          {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Cargo / Headline</Label>
          <Input {...register("headline")} className="bg-muted/30" placeholder="Ex: Senior Frontend Developer" />
          {errors.headline && <p className="text-red-500 text-xs">{errors.headline.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input {...register("email")} className="bg-muted/30" placeholder="seu@email.com" />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input {...register("phone")} className="bg-muted/30" placeholder="(11) 99999-9999" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Localização</Label>
          <Input {...register("location")} className="bg-muted/30" placeholder="São Paulo, SP" />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Links Sociais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <Label className="flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-600"/> LinkedIn</Label>
                <Input {...register("linkedinUrl")} className="bg-muted/30" />
            </div>
            <div className="space-y-2">
                <Label className="flex items-center gap-2"><Github className="w-4 h-4"/> GitHub</Label>
                <Input {...register("githubUrl")} className="bg-muted/30" />
            </div>
             <div className="space-y-2">
                <Label className="flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-500"/> Portfólio</Label>
                <Input {...register("portfolioUrl")} className="bg-muted/30" />
            </div>
        </div>
      </div>

      <div className="border-t pt-6">
         <div className="space-y-2">
            <Label>Resumo Profissional</Label>
            <Textarea 
                {...register("summary")} 
                className="min-h-[120px] bg-muted/30 resize-none leading-relaxed"
                placeholder="Resumo profissional..."
            />
         </div>
      </div>
    </div>
  );
}