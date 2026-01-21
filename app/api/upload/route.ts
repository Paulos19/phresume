import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();

  // Segurança básica: Apenas usuários logados podem fazer upload
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validação de Tamanho (Max 4MB) e Tipo
    if (file.size > 4 * 1024 * 1024) {
        return NextResponse.json({ error: "File size too large (max 4MB)" }, { status: 400 });
    }

    // Upload para Vercel Blob
    // 'avatars/' prefixo organiza o bucket
    const filename = `avatars/${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`;
    
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}