export interface PersonalInfo {
  fullName: string;
  headline: string; // Ex: Senior Frontend Developer
  email: string;
  phone: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  location: string; // Ex: São Paulo, SP
  summary?: string; // O texto gerado por IA entra aqui
}

export interface Experience {
  id: string; // Para key do React e manipulação
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string; // Bullets ou texto corrido
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

// O Objeto Mestre que será salvo no banco
export interface ResumeContent {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: string[];
}

// Valor inicial para começar o editor
export const initialResumeContent: ResumeContent = {
  personalInfo: {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
  },
  experience: [],
  education: [],
  skills: [],
  languages: []
};