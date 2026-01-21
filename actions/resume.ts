"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { initialResumeContent, ResumeContent } from "@/types/resume";

export async function createResume(title: string) {
  const session = await auth();

  // 1. Validação de Sessão
  if (!session?.user?.id) {
    console.error("[CREATE RESUME] Erro: Usuário não autenticado.");
    return { error: "Sessão expirada ou inválida. Faça login novamente." };
  }

  try {
    console.log(`[CREATE RESUME] Iniciando criação para UserID: ${session.user.id}`);

    // 2. Sanitização do Payload JSON
    // Isso garante que o objeto seja compatível com o tipo 'Json' do Postgres/Prisma
    // e remove referências a protótipos ou undefined que quebram a query.
    const contentPayload = JSON.parse(JSON.stringify(initialResumeContent));

    const resume = await prisma.resume.create({
      data: {
        title,
        userId: session.user.id,
        content: contentPayload,
      },
    });

    console.log(`[CREATE RESUME] Sucesso. ID: ${resume.id}`);
    revalidatePath("/dashboard");
    
    return { success: true, id: resume.id };

  } catch (error: any) {
    // 3. Captura Detalhada de Erro
    console.error("[CREATE RESUME] Erro Crítico:", error);

    // Erro de Chave Estrangeira (Usuário do cookie não existe no banco)
    if (error.code === 'P2003') {
        return { error: "Erro de conta: Usuário não encontrado no banco de dados. Tente sair e logar novamente." };
    }

    // Retorna a mensagem técnica para facilitar o debug no frontend
    return { error: `Erro técnico: ${error.message}` };
  }
}

export async function updateResume(id: string, content: ResumeContent) {
  const session = await auth();

  if (!session?.user?.id) return { error: "Não autorizado" };

  try {
    // Verifica propriedade (segurança)
    const existing = await prisma.resume.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!existing) return { error: "Currículo não encontrado ou acesso negado." };

    // Sanitização também no update
    const contentPayload = JSON.parse(JSON.stringify(content));

    await prisma.resume.update({
      where: { id },
      data: {
        content: contentPayload,
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/editor/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE RESUME] Erro:", error);
    return { error: "Erro ao salvar alterações. Tente novamente." };
  }
}

export async function deleteResume(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Não autorizado" };

    try {
        await prisma.resume.delete({
            where: {
                id,
                userId: session.user.id // Garante que só deleta o próprio
            }
        });
        revalidatePath("/dashboard/resumes");
        return { success: true };
    } catch (error) {
        return { error: "Erro ao deletar" };
    }
}