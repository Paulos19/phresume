import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  // ... (verificações de token e sessão iguais) ...
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // --- CORREÇÃO AQUI: Aumentando para 10MB ---
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    if (file.size > MAX_SIZE) {
        return NextResponse.json({ 
            error: `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). O limite é 10MB.` 
        }, { status: 400 });
    }
    // -------------------------------------------

    const filename = `avatars/${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`;
    
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Falha no upload" }, { status: 500 });
  }
}