import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

import { getAccessToken } from "@/lib/auth";

/**
 * Passthrough para las URLs presignadas de S3: el bucket no expone CORS,
 * así que @react-pdf/renderer (fetch en el navegador) no puede leerlas
 * directamente. Este proxy same-origin evita el bloqueo de CORS.
 *
 * Además, los logos se suben como JPEG sin transparencia — el fondo sólido
 * (casi siempre negro) queda "pegado" a la marca. Aquí se recolorea a
 * silueta: el alfa sale de la luminosidad del píxel (lo oscuro se vuelve
 * transparente, lo brillante queda opaco, conservando el brillo/degradado
 * original) y el RGB se reemplaza por el color primario configurado en el
 * backoffice, para que la marca de agua del PDF combine con la marca.
 */
function parseHexColor(hex: string | null): { r: number; g: number; b: number } {
  const fallback = { r: 239, g: 68, b: 68 }; // rojo por defecto (DEFAULT_ACCENT)
  if (!hex) return fallback;
  const value = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return fallback;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

async function recolorAsSilhouette(buffer: Buffer, color: { r: number; g: number; b: number }): Promise<Buffer> {
  const image = sharp(buffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += info.channels) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = color.r;
    data[i + 1] = color.g;
    data[i + 2] = color.b;
    data[i + 3] = Math.min(255, Math.round(luminance * 1.4));
  }

  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .toBuffer();
}

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const src = request.nextUrl.searchParams.get("src");
  if (!src) {
    return NextResponse.json({ error: "Missing src" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: "Invalid src" }, { status: 400 });
  }

  if (!target.hostname.endsWith(".amazonaws.com")) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
  }

  const upstream = await fetch(target.toString(), { cache: "no-store" });
  if (!upstream.ok) {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }

  const original = Buffer.from(await upstream.arrayBuffer());
  const color = parseHexColor(request.nextUrl.searchParams.get("color"));
  const recolored = await recolorAsSilhouette(original, color);

  return new NextResponse(new Uint8Array(recolored), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=300",
    },
  });
}
