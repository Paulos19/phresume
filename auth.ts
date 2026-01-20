import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/lib/auth.config"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // JWT é obrigatório para Credentials
  
  // 👇 AQUI ESTÁ A MÁGICA QUE FALTA
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id; // Salva o ID do banco no token
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub; // Passa o ID do token para a sessão
      }
      return session;
    },
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const parsedCredentials = loginSchema.safeParse(credentials)

          if (!parsedCredentials.success) return null

          const { email, password } = parsedCredentials.data

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user || !user.password) return null

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) return user

          return null
        } catch (error) {
          return null
        }
      },
    }),
  ],
})