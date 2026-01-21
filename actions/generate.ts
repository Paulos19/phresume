"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResumeContent, TemplateConfig } from "@/types/resume";
import { revalidatePath } from "next/cache";

// Configuração padrão de fallback caso o currículo ainda não tenha design definido
const DEFAULT_CONFIG: TemplateConfig = {
  layout: 'modern',
  fontFamily: 'Inter',
  photoPosition: 'left',
  primaryColor: '#4f46e5',
  texture: 'none'
};

export async function generateResumePDF(resumeId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Sessão inválida. Faça login novamente." };
  }

  try {
    // 1. Busca os dados mais recentes do banco (Fonte da Verdade)
    const resume = await prisma.resume.findUnique({
      where: { 
        id: resumeId,
        userId: session.user.id 
      },
    });

    if (!resume) {
      return { error: "Currículo não encontrado." };
    }

    // 2. Extrai e tipa o conteúdo
    const content = resume.content as unknown as ResumeContent;
    
    // Garante que o templateConfig existe no payload, usando o fallback se necessário
    const templateConfig = content.templateConfig || DEFAULT_CONFIG;

    // 3. Prepara o Payload completo para o n8n
    const payload = {
      resumeId: resume.id,
      userId: session.user.id,
      data: {
        ...content,
        templateConfig // Injetamos explicitamente para garantir que o n8n receba
      },
      // templateId pode ser usado como um identificador de versão do motor de renderização no n8n
      templateId: templateConfig.layout 
    };

    console.log(`[GENERATE] Iniciando geração para: ${resume.title}`);
    console.log(`[GENERATE] Webhook: ${process.env.N8N_WEBHOOK_URL}`);

    // 4. Chamada ao Webhook do n8n
    const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.N8N_SECRET_TOKEN || "",
      },
      body: JSON.stringify(payload),
      cache: "no-store" 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GENERATE] Erro n8n:", errorText);
      throw new Error("Falha no processamento externo (n8n).");
    }

    // 5. O n8n deve retornar um JSON com a URL do PDF hospedado (ex: Vercel Blob)
    const result = await response.json();

    if (!result.pdfUrl) {
      console.error("[GENERATE] Resposta n8n inválida:", result);
      throw new Error("O servidor de geração não retornou o link do arquivo.");
    }

    // 6. Atualiza a URL do PDF e o timestamp no banco de dados
    await prisma.resume.update({
      where: { id: resumeId },
      data: { 
        pdfUrl: result.pdfUrl,
        updatedAt: new Date() 
      }
    });

    // Revalida a cache para que o novo PDF apareça no dashboard imediatamente
    revalidatePath("/dashboard/resumes");
    
    return { success: true, pdfUrl: result.pdfUrl };

  } catch (error: any) {
    console.error("[GENERATE] Erro crítico:", error);
    return { error: error.message || "Erro interno ao processar o PDF." };
  }
}