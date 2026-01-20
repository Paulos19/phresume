"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResumeContent } from "@/types/resume";
import { revalidatePath } from "next/cache";

export async function generateResumePDF(resumeId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Sessão inválida. Faça login novamente." };
  }

  // 1. Busca os dados mais recentes do banco (Fonte da Verdade)
  const resume = await prisma.resume.findUnique({
    where: { 
      id: resumeId,
      userId: session.user.id // Garante que o usuário é dono do currículo
    },
  });

  if (!resume) {
    return { error: "Currículo não encontrado." };
  }

  const content = resume.content as unknown as ResumeContent;

  try {
    // 2. Prepara o Payload para o n8n
    // Enviamos o ID para que o n8n possa (opcionalmente) notificar quando acabar
    // ou usar como nome do arquivo.
    const payload = {
      resumeId: resume.id,
      userId: session.user.id,
      data: content,
      templateId: "modern-1" // Futuramente você pode ter múltiplos templates
    };

    console.log("[GENERATE] Enviando para n8n:", process.env.N8N_WEBHOOK_URL);

    // 3. Chamada ao Webhook do n8n
    const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.N8N_SECRET_TOKEN || "",
      },
      body: JSON.stringify(payload),
      // O n8n pode demorar uns 5-10s gerando o PDF. 
      // Em Vercel/Serverless, o timeout padrão é 10s-60s.
      cache: "no-store" 
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GENERATE] Erro n8n:", errorText);
      throw new Error("Falha no processamento externo (n8n).");
    }

    // 4. Esperamos que o n8n retorne um JSON: { "pdfUrl": "https://..." }
    const result = await response.json();

    if (!result.pdfUrl) {
      throw new Error("n8n não retornou a URL do PDF.");
    }

    // 5. Salva a URL retornada no banco
    await prisma.resume.update({
      where: { id: resumeId },
      data: { 
        pdfUrl: result.pdfUrl,
        updatedAt: new Date() 
      }
    });

    revalidatePath("/dashboard");
    return { success: true, pdfUrl: result.pdfUrl };

  } catch (error: any) {
    console.error("[GENERATE] Erro crítico:", error);
    return { error: error.message || "Erro ao gerar PDF." };
  }
}