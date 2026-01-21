"use server";

import { auth } from "@/auth";

export async function generateProfileFromText(text: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    // URL do novo Webhook do n8n focado em PARSEAR dados
    // No n8n, use um nó "AI Agent" ou "LLM Chain" para converter texto em JSON
    const N8N_PARSER_URL = process.env.N8N_PARSER_WEBHOOK_URL; 

    if (!N8N_PARSER_URL) throw new Error("N8N URL not configured");

    const response = await fetch(N8N_PARSER_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": process.env.N8N_SECRET_TOKEN || ""
      },
      body: JSON.stringify({ 
        text, 
        type: "personal_info" // Flag para o n8n saber qual schema usar
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch from AI Agent");

    const data = await response.json();
    
    // O n8n deve retornar algo como: { fullName: "...", headline: "...", ... }
    return { success: true, data };

  } catch (error) {
    console.error("AI Generation error:", error);
    return { error: "Falha ao processar com IA" };
  }
}

export async function generateContentFromText(text: string, type: "personal_info" | "experience" | "education" | "skills") {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    const N8N_PARSER_URL = process.env.N8N_PARSER_WEBHOOK_URL; 
    if (!N8N_PARSER_URL) throw new Error("N8N URL not configured");

    const response = await fetch(N8N_PARSER_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": process.env.N8N_SECRET_TOKEN || ""
      },
      body: JSON.stringify({ text, type }), // Envia o tipo para o n8n saber o que fazer
    });

    if (!response.ok) throw new Error("Failed to fetch from AI Agent");

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error("AI Generation error:", error);
    return { error: "Falha ao processar com IA" };
  }
}