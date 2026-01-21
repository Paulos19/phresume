import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60; 
export const dynamic = "force-dynamic";

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
      const localPuppeteer = require("puppeteer-core");
      browser = await localPuppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        channel: "chrome", 
        headless: true,
        defaultViewport: { width: 1920, height: 1080 }
      });
    } else {
      const executablePath = await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar"
      );

      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: executablePath,
        headless: true,
      });
    }

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0", 
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    await browser.close();

    // --- CORREÇÃO AQUI ---
    const finalName = fileName || `curriculo-${Date.now()}.pdf`;
    
    const blob = await put(finalName, pdfBuffer, {
      access: "public",
      contentType: "application/pdf",
      // Adiciona sufixo aleatório para evitar erro de "Blob already exists"
      addRandomSuffix: true, 
    });
    // ---------------------

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