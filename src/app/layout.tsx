import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Headphones, Sparkles, Volume2 } from "lucide-react";
import { CochleaLogo } from "@/components/CochleaLogo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COCLEAPP | Exploratorio de Acústica & Psicoacústica",
  description: "Experimentos interactivos e ilusiones auditivas para entender cómo escuchamos el mundo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-cyan-500 selection:text-slate-950`}
      >
        {/* Top Announcement Bar (Mensaje de seguridad auditiva y auriculares) */}
        <div className="bg-gradient-to-r from-cyan-900/40 via-purple-900/40 to-cyan-900/40 border-b border-slate-800/80 text-xs py-2 px-4 text-center text-cyan-200/90 flex items-center justify-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>
            <strong>Salud auditiva:</strong> Recordá mantener un nivel de volumen seguro para proteger tu audición. Te recomendamos usar <strong>auriculares</strong>. 🔊
          </span>
        </div>

        {/* Header / Navbar */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/60 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg shadow-cyan-500/10 group-hover:border-cyan-500/40 group-hover:scale-105 transition-all">
                <CochleaLogo className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                  COCLEAPP
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono -mt-1">
                  Audio & Perception Lab
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <Link href="/#experimentos" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Experimentos
              </Link>
              <Link href="/#que-es" className="hover:text-cyan-400 transition-colors">
                ¿Qué es la Psicoacústica?
              </Link>
              <Link href="/#referencias" className="hover:text-cyan-400 transition-colors">
                Bibliografía
              </Link>
            </nav>

            {/* Right Action Button */}
            <div className="flex items-center gap-3">
              <a
                href="/#experimentos"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-md shadow-cyan-500/20 hover:shadow-cyan-400/30 flex items-center gap-2"
              >
                <span>Probar Ilusiones</span>
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-10 px-4 text-slate-400 text-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                <CochleaLogo className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400">
                <strong>COCLEAPP</strong> — Plataforma divulgativa de ciencia sonora y percepción auditiva.
              </p>
            </div>
            <div className="text-xs text-slate-500 text-center md:text-right">
              <p>Laboratorio interactivo de Acústica y Psicoacústica.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}