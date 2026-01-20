import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acesso | Resume AI Builder",
  description: "Construa sua carreira com inteligência.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* LADO ESQUERDO: Branding (Estático) */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r border-zinc-800">
        <div className="absolute inset-0 bg-zinc-900" />
        {/* Textura de Noise/Grain para dar profundidade */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
        
        {/* Gradiente sutil vindo de baixo */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/80 to-zinc-900/10" />

        <div className="relative z-20 flex items-center text-lg font-medium tracking-tight">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6 text-indigo-500"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Resume AI Builder
        </div>
        
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg font-light leading-relaxed text-zinc-200">
              &ldquo;Não é apenas sobre preencher dados, é sobre contar a sua história profissional da forma que os algoritmos e recrutadores querem ler.&rdquo;
            </p>
            <footer className="text-sm font-medium text-indigo-400">Paulo Henrique - Criador</footer>
          </blockquote>
        </div>
      </div>

      {/* LADO DIREITO: Onde o Login/Register será renderizado */}
      <div className="lg:p-8 flex items-center justify-center h-full bg-background">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
           {children}
        </div>
      </div>
    </div>
  );
}