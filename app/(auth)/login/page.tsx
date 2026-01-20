import { Metadata } from "next";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Acesso | Resume AI Builder",
  description: "Crie currículos de alto impacto com IA.",
};

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* Lado Esquerdo - Branding & Visual */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        {/* Pattern decorativo (grid ou noise) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
        
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6 text-blue-500"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Resume AI Builder
        </div>
        
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;A automação deste construtor me economizou horas. O PDF gerado é impecável e passou em todos os sistemas de ATS.&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">Paulo Henrique - Early Adopter</footer>
          </blockquote>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Crie sua conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Conecte-se para gerar currículos inteligentes
            </p>
          </div>
          
          <LoginForm />
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            Ao clicar em continuar, você concorda com nossos{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacidade
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}