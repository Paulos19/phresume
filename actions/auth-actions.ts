'use server';

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function loginWithProvider(provider: "github" | "google") {
  try {
    await signIn(provider, { redirectTo: "/dashboard" });
  } catch (error) {
    // NextAuth lança erros para redirecionamento, precisamos relançar
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CallbackRouteError':
          return { error: 'Erro ao conectar com o provedor.' };
        default:
          return { error: 'Ocorreu um erro inesperado.' };
      }
    }
    throw error;
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}