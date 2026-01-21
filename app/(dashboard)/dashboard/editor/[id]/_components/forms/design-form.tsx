// app/(dashboard)/dashboard/editor/[id]/_components/forms/design-form.tsx

"use client";

import { TemplateConfig } from "@/types/resume";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Palette, Type, Layout, Image as ImageIcon, Waves } from "lucide-react";

interface DesignFormProps {
  config: TemplateConfig;
  onUpdate: (config: TemplateConfig) => void;
}

export function DesignForm({ config, onUpdate }: DesignFormProps) {
  const handleChange = (field: keyof TemplateConfig, value: string) => {
    onUpdate({ ...config, [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Escolha do Template */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Layout className="w-4 h-4"/> Template Base</Label>
          <Select value={config.layout} onValueChange={(v) => handleChange('layout', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="modern">Moderno (Sidebar)</SelectItem>
              <SelectItem value="classic">Clássico (Executivo)</SelectItem>
              <SelectItem value="minimalist">Minimalista</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fonte */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Type className="w-4 h-4"/> Fonte</Label>
          <Select value={config.fontFamily} onValueChange={(v) => handleChange('fontFamily', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter (Sanson-serif)</SelectItem>
              <SelectItem value="Lora">Lora (Serifada)</SelectItem>
              <SelectItem value="Roboto">Roboto</SelectItem>
              <SelectItem value="Montserrat">Montserrat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posição da Foto */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Posição da Foto</Label>
          <Select value={config.photoPosition} onValueChange={(v) => handleChange('photoPosition', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
              <SelectItem value="center">Centralizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cor Principal */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Palette className="w-4 h-4"/> Cor dos Títulos</Label>
          <div className="flex gap-2">
            <Input 
              type="color" 
              value={config.primaryColor} 
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input 
              type="text" 
              value={config.primaryColor} 
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Texturas / Marca d'água */}
        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2"><Waves className="w-4 h-4"/> Textura de Fundo (Marca d'água)</Label>
          <Select value={config.texture} onValueChange={(v) => handleChange('texture', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="dots">Pontilhado</SelectItem>
              <SelectItem value="waves">Ondas Suaves</SelectItem>
              <SelectItem value="lines">Linhas Diagonais</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
}