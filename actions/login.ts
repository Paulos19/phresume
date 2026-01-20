"use server";

import * as z from "zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// Schema alinhado com o front-end
const LoginSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z.string().min(1, { message: "Senha é obrigatória." }),
});

export async function login(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Campos inválidos." };
  }

  const { email, password } = validatedFields.data;

  try {
    // Tenta logar e redirecionar
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard", // Rota protegida pós-login
    });
  } catch (error) {
    // Auth.js joga erros como exceções, precisamos filtrar
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciais inválidas. Verifique seu email e senha." };
        default:
          return { error: "Erro desconhecido. Tente novamente." };
      }
    }
    throw error; // Relança para o Next.js tratar redirecionamentos de sucesso
  }
}