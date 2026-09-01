import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Volume2, Sparkles } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cocleapp | EMDC audio",
  description: "Laboratorio Interactivo de Psicoacústica",
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950`}>
        {/* Banner Superior de Salud Auditiva */}
        <div className="bg-slate-900/90 border-b border-slate-800/80 py-1.5 px-4 text-center text-xs text-slate-300 flex items-center justify-center gap-2 sticky top-0 z-50 backdrop-blur-sm">
          <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-cyan-400 font-semibold">Salud auditiva:</strong> Recordá mantener un nivel de volumen seguro para proteger tu audición. Te recomendamos usar auriculares para una mayor experiencia sonora.
          </span>
          <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 hidden sm:inline" />
        </div>

        {/* Barra de Navegación Principal */}
        <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-[29px] z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo Izquierda */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                <span className="text-lg">🌀</span>
              </div>
              <div>
                <span className="font-extrabold tracking-wider text-white text-base block leading-none">
                  COCLEAPP
                </span>
                <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
                  AUDIO & PERCEPTION LAB
                </span>
              </div>
            </Link>

            {/* Links Centro */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <Link href="/#experimentos" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Experimentos
              </Link>
              <Link href="/#psicoacustica" className="hover:text-cyan-400 transition-colors">
                ¿Qué es la Psicoacústica?
              </Link>
              <Link href="/#bibliografia" className="hover:text-cyan-400 transition-colors">
                Bibliografía
              </Link>
            </nav>

            {/* Área Derecha: Botón e Identidad de Marca */}
            <div className="flex items-center gap-4">
              <Link
                href="/#experimentos"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
              >
                Probar Ilusiones
              </Link>

              {/* Marca personal en la esquina superior derecha */}
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800 text-xs font-mono">
                <span className="text-slate-500 hidden xl:inline">by</span>
                <span className="font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/60 shadow-sm">
                  EMDC audio
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal inyectado desde page.tsx */}
        <main>{children}</main>
      </body>
    </html>
  );
}