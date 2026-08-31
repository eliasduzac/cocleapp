import Link from "next/link";
import {
  Sparkles,
  Zap,
  Ear,
  Sliders,
  Volume2,
  ArrowRight,
  Eye,
  Radio,
  Compass,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const experimentos = [
    {
      id: "shepard-tone",
      titulo: "El Tono de Shepard",
      subtitulo: "La ilusión visual de la 'Escalera de Escher', pero en sonido.",
      categoria: "Ilusión Auditiva",
      dificultad: "Fácil",
      tagColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      descripcion:
        "Escuchá una secuencia sonora que parece subir de tono infinitamente sin volverse nunca demasiado aguda.",
      icono: Sliders,
      disponible: true,
    },
    {
      id: "mcgurk-effect",
      titulo: "Efecto McGurk",
      subtitulo: "Cuando tus ojos engañan a lo que tus oídos escuchan.",
      categoria: "Percepción Multimodal",
      dificultad: "Fácil",
      tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      descripcion:
        "Mirá cómo el movimiento de los labios de una persona cambia radicalmente la sílaba que tu cerebro cree escuchar.",
      icono: Eye,
      disponible: true,
    },
    {
      id: "binaural-location",
      titulo: "Localización Binaural (ITD/ILD)",
      subtitulo: "¿Cómo sabe tu cerebro de dónde viene un sonido?",
      categoria: "Espacialidad",
      dificultad: "Intermedio",
      tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      descripcion:
        "Variá diferencias de microsegundos entre tu oído izquierdo y derecho para mover un sonido en 3D en tu cabeza.",
      icono: Compass,
      disponible: true,
    },
    {
      id: "audio-masking",
      titulo: "Enmascaramiento Auditivo",
      subtitulo: "El secreto detrás del formato MP3.",
      categoria: "Psicoacústica Física",
      dificultad: "Intermedio",
      tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      descripcion:
        "Descubrí cómo un sonido fuerte 'vuelve invisible' a otro cercano en frecuencia y por qué el cerebro no lo nota.",
      icono: Radio,
      disponible: true,
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden">
        {/* Dynamic Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-cyan-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Laboratorio Interactivo de Sonido & Mente</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Tu cerebro no escucha la física. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Escucha una interpretación.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Explorá el fascinante mundo de la <strong>Acústica</strong> y la{" "}
            <strong>Psicoacústica</strong>. Descubrí ilusiones sonoras, probá
            fenómenos perceptivos en tiempo real y entendé el audio del día a día.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a
              href="#experimentos"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:scale-[1.02] flex items-center gap-2"
            >
              <span>Empezar a Experimentar</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#que-es"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium px-6 py-3.5 rounded-xl transition-all flex items-center gap-2"
            >
              <Ear className="w-4 h-4 text-cyan-400" />
              <span>¿Qué es la Psicoacústica?</span>
            </a>
          </div>
        </div>
      </section>

      {/* EXPERIMENTS GRID SECTION */}
      <section id="experimentos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
              Módulos Interactivos
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Experimentos & Ilusiones Auditivas
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Seleccioná un experimento para interactuar con los generadores de tono y controles en tiempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experimentos.map((exp) => {
            const IconoComponente = exp.icono;
            return (
              <div
                key={exp.id}
                className="group relative bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium ${exp.tagColor}`}
                    >
                      {exp.categoria}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {exp.dificultad}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all">
                      <IconoComponente className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {exp.titulo}
                      </h3>
                      <p className="text-xs text-cyan-200/70 font-medium mt-0.5">
                        {exp.subtitulo}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    {exp.descripcion}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    Listo para probar
                  </span>
                  <Link
                    href={`/experimento/${exp.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group/btn"
                  >
                    <span>Lanzar Experimento</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* EDUCATIONAL SECTION: ACÚSTICA VS PSICOACÚSTICA */}
      <section id="que-es" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400">
              <Zap className="w-3.5 h-3.5" /> Conceptos Básicos
            </div>

            <h2 className="text-3xl font-bold text-white">
              ¿Cuál es la diferencia entre Acústica y Psicoacústica?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl space-y-2">
                <h3 className="font-bold text-cyan-400 flex items-center gap-2 text-base">
                  <Volume2 className="w-4 h-4" /> Acústica (La Física)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Estudia la onda física en el aire: sus frecuencias (Hz), presión sonora (dB), velocidad y cómo rebota en las paredes. Existe aunque nadie la escuche.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl space-y-2">
                <h3 className="font-bold text-purple-400 flex items-center gap-2 text-base">
                  <Ear className="w-4 h-4" /> Psicoacústica (La Percepción)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Estudia cómo tu oído transforma esas ondas en impulsos eléctricos y cómo tu cerebro las interpreta. Aquí nacen el volumen percibido, el timbre y las ilusiones auditivas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}