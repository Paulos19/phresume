"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Schema de validação (forte tipagem)
const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter no mínimo 2 caracteres." }),
  email: z.string().email({ message: "Email inválido." }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres." }),
});

export async function registerUser(values: z.infer<typeof RegisterSchema>) {
  // 1. Validação dos campos
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos. Verifique os dados." };
  }

  const { email, password, name } = validatedFields.data;

  try {
    // 2. Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Este email já está em uso." };
    }

    // 3. Hash da senha (Custo 10 é o padrão da indústria)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Criar usuário
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { success: "Conta criada com sucesso! Faça login." };

  } catch (error) {
    // Tratamento de erro do Prisma (ex: falha de conexão)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return { error: "Este email já está registrado." }
        }
    }
    return { error: "Erro interno no servidor." };
  }
}