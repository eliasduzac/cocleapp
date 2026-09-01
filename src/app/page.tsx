import Link from "next/link";
import { Headphones, Waves, Sparkles, Sliders, BookOpen, Brain, Atom, ArrowRight, Library, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-16 text-slate-200">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Laboratorio Interactivo de Psicoacústica
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          La frontera entre la acústica física y la{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            neurofisiología auditiva
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          La psicoacústica analiza la relación entre la señal sonora objetiva y la respuesta perceptiva que genera en el sistema nervioso[cite: 2]. Descubrí los principios fisiológicos, las ilusiones y las paradojas que determinan la audición humana[cite: 2].
        </p>
      </section>

      {/* Grid de Experimentos */}
      <section id="experimentos" className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Waves className="w-5 h-5 text-cyan-400" /> Experimentos Disponibles
          </h2>
          <span className="text-xs text-slate-500 font-mono">v1.1.0</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Experimento 1: Shepard Tone */}
          <Link
            href="/experimento/shepard-tone"
            className="group relative bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                El Tono de Shepard
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ilusión auditiva de una escala musical que asciende o desciende infinitamente sin modificar su altura absoluta percibida[cite: 2].
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <span>Iniciar experimento</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Experimento 2: Bandas Críticas y Rugosidad */}
          <Link
            href="/experimento/bandas-criticas"
            className="group relative bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                Bandas Críticas, Batidos y Rugosidad
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Analizá la interferencia de dos frecuencias senoidales simultáneas: batidos de amplitud, aspereza por rugosidad y resolución coclear[cite: 2].
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-purple-400">
              <span>Iniciar experimento</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Experimento 3: Próximamente */}
          <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between opacity-70">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Localización Espacial DIT / DII
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Simulación binaural de diferencias interaurales de tiempo e intensidad para posicionamiento 3D en la corteza auditiva[cite: 2].
              </p>
            </div>
            <div className="mt-6 text-xs font-mono text-slate-500">
              En desarrollo
            </div>
          </div>
        </div>
      </section>

      {/* Sustento Científico */}
      <section id="referencias" className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8">
        <div className="space-y-2 border-b border-slate-800 pb-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-mono border border-purple-500/20">
            <Library className="w-3.5 h-3.5" /> Sustento Científico
          </div>
          <h2 className="text-2xl font-bold text-white">
            Fundamentos Teóricos y Bibliografía
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Las demostraciones interactivas están fundamentadas en la investigación en acústica física, psicoacústica experimental y neurofisiología auditiva[cite: 2].
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <Atom className="w-4 h-4" /> Acústica Física e Instrumental
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Estudio de las leyes físicas que gobiernan la generación, interferencia y modulación de ondas mecánicas[cite: 2].
            </p>
          </div>
          <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
              <Brain className="w-4 h-4" /> Psicoacústica y Cognición
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Análisis neurofisiológico de los efectos derivados del filtro coclear y la codificación tonotópica en el tronco encefálico[cite: 2].
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" /> Referencias Bibliográficas
          </h3>
          <ul className="grid sm:grid-cols-2 gap-3 text-xs">
            <li className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 text-slate-300">
              <strong className="text-white block font-medium">Roederer, J. G.</strong>
              <em>Vibraciones sonoras, tonos puros y percepción de altura[cite: 2].</em>
            </li>
            <li className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 text-slate-300">
              <strong className="text-white block font-medium">Plomp, R. (1976)</strong>
              <em>Aspects of Tone Sensation / Interferencia y Rugosidad de tonos puros[cite: 2].</em>
            </li>
            <li className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 text-slate-300">
              <strong className="text-white block font-medium">Zwicker, E. &amp; Fastl, H. (1990)</strong>
              <em>Psychoacoustics: Facts and Models.</em> Springer-Verlag[cite: 2].
            </li>
            <li className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 text-slate-300">
              <strong className="text-white block font-medium">Fletcher, N. H. &amp; Rossing, T. D.</strong>
              <em>The Physics of Musical Instruments.</em> Springer-Verlag[cite: 2].
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}