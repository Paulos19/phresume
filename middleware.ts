import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config" // Ajuste o caminho se estiver em src/lib

export default NextAuth(authConfig).auth

export const config = {
  // Regex para excluir arquivos estáticos e rotas de API internas do middleware
  // Isso garante performance máxima
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}