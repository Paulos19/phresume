import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// Configuração para Serverless (Vercel)
export const maxDuration = 60; 

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("x-api-key");
  if (authHeader !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { html, fileName } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "HTML content missing" }, { status: 400 });
    }

    let browser;
    
    if (process.env.NODE_ENV === "development") {
      // --- AMBIENTE LOCAL (DEV) ---
      // Usa o Chrome instalado na sua máquina
      const localPuppeteer = require("puppeteer-core");
      browser = await localPuppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        channel: "chrome", 
        headless: true,
        defaultViewport: { width: 1920, height: 1080 }
      });
    } else {
      // --- AMBIENTE DE PRODUÇÃO (VERCEL) ---
      
      // 1. Carrega fonte para não quebrar caracteres (Opcional mas recomendado)
      // O sparticuz já tenta carregar fontes, mas configurar explicitamente ajuda
      // chromium.setGraphicsMode = false; // Removido pois pode causar erro de TS
      
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 }, // <--- FIX 1: Valor explícito
        executablePath: await chromium.executablePath(),
        headless: true, // <--- FIX 2: Valor explícito (ou "shell" para performance)
      });
    }

    const page = await browser.newPage();

    // Define o HTML
    await page.setContent(html, {
      waitUntil: "networkidle0", 
    });

    // Gera o PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    await browser.close();

    // Upload Vercel Blob
    const finalName = fileName || `curriculo-${Date.now()}.pdf`;
    
    const blob = await put(finalName, pdfBuffer, {
      access: "public",
      contentType: "application/pdf",
    });

    return NextResponse.json({ 
      success: true, 
      pdfUrl: blob.url,
      downloadUrl: blob.downloadUrl 
    });

  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: error.message }, 
      { status: 500 }
    );
  }
}