import Link from "next/link";
import { 
  Sliders, 
  Activity, 
  Headphones, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Brain, 
  GraduationCap, 
  Volume2,
  Waves,
  Music,
  Clock,
  Compass
} from "lucide-react";

export default function Home() {
  const experiments = [
    {
      id: "shepard",
      title: "El Tono de Shepard",
      description:
        "Ilusión auditiva de una escala musical que asciende o desciende infinitamente sin modificar su altura absoluta percibida.",
      icon: Sliders,
      href: "/experimento/tono-shepard",
      active: true,
    },
    {
      id: "bandas-criticas",
      title: "Bandas Críticas, Batidos y Rugosidad",
      description:
        "Analizá la interferencia de dos frecuencias senoidales simultáneas: batidos de amplitud, aspereza por rugosidad y resolución coclear.",
      icon: Activity,
      href: "/experimento/bandas-criticas",
      active: true,
    },
    {
      id: "enmascaramiento",
      title: "Enmascaramiento Auditivo",
      description:
        "Analizá en un gráfico espectral (Frecuencia vs Amplitud) cómo un enmascarador eleva el umbral de audición de tonos adyacentes.",
      icon: Volume2,
      href: "/experimento/enmascaramiento",
      active: true,
    },
    {
      id: "localizacion-espacial",
      title: "Localización Espacial DIT / DII",
      description:
        "Simulación binaural de diferencias interaurales de tiempo e intensidad para posicionamiento 3D en la corteza auditiva.",
      icon: Headphones,
      href: "#",
      active: false,
    },
  ];

  const correlatos = [
    {
      magnitud: "Frecuencia",
      unidadFisica: "Hertz (Hz)",
      percepcion: "Altura / Tono (Pitch)",
      unidadPsico: "Mel, Bark, Semitonos",
      descripcion: "Oscilación física de la onda vs. la sensación de agudeza o gravedad del sonido.",
      icon: Waves,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
    },
    {
      magnitud: "Presión / Amplitud",
      unidadFisica: "Pascal (Pa), dB SPL",
      percepcion: "Sonoridad (Loudness)",
      unidadPsico: "Phon, Sone",
      descripcion: "Energía física de la presión sonora vs. la sensación subjetiva de intensidad/volumen.",
      icon: Volume2,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
    {
      magnitud: "Espectro y Envolvente",
      unidadFisica: "Distribución armónica / ADSR",
      percepcion: "Timbre",
      unidadPsico: "Cualidad tímbrica",
      descripcion: "Estructura armónica y dinámica que distingue dos fuentes a igual tono e intensidad.",
      icon: Music,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30",
    },
    {
      magnitud: "Duración / Tiempo",
      unidadFisica: "Milisegundos (ms)",
      percepcion: "Duración Subjetiva",
      unidadPsico: "Integración Temporal",
      descripcion: "Duración física vs. el tiempo de acumulación de energía en el oído interno (~200 ms).",
      icon: Clock,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
    },
    {
      magnitud: "Diferencias Interaurales",
      unidadFisica: "DIT (Δt), DII (ΔL)",
      percepcion: "Localización Espacial",
      unidadPsico: "Azimut, Elevación, Distancia",
      descripcion: "Diferencias de tiempo e intensidad entre ambos oídos para ubicar fuentes en 3D.",
      icon: Compass,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
    },
  ];

  const references = [
    {
      authors: "Zwicker, E., & Fastl, H.",
      year: "1999",
      title: "Psychoacoustics: Facts and Models",
      publisher: "Springer-Verlag (2nd ed.)",
      note: "Referencia fundamental sobre bandas críticas, enmascaramiento y rugosidad auditiva.",
    },
    {
      authors: "Shepard, R. N.",
      year: "1964",
      title: "Circularity in Judgments of Relative Pitch",
      publisher: "The Journal of the Acoustical Society of America, 36(12), 2346-2353",
      note: "Publicación original sobre la ilusión perceptual del Tono de Shepard.",
    },
    {
      authors: "Moore, B. C. J.",
      year: "2012",
      title: "An Introduction to the Psychology of Hearing",
      publisher: "Brill / Emerald Group (6th ed.)",
      note: "Texto clásico sobre la neurofisiología periférica y central de la audición.",
    },
    {
      authors: "Hartmann, W. M.",
      year: "1998",
      title: "Signals, Sound, and Sensation",
      publisher: "Springer Science & Business Media",
      note: "Análisis matemático y físico de la percepción sonora y localización binaural.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Sección Hero */}
      <section className="py-16 sm:py-24 px-4 max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50">
          <Sparkles className="w-3.5 h-3.5" />
          Laboratorio Interactivo de Psicoacústica
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400 bg-clip-text text-transparent pb-1">
          La frontera entre la acústica física y la neurofisiología auditiva
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          La psicoacústica analiza la relación entre la señal sonora objetiva y la respuesta perceptiva que genera en el sistema nervioso. Descubrí los principios fisiológicos, las ilusiones y las paradojas que determinan la audición humana.
        </p>
      </section>

      {/* Grilla de Experimentos */}
      <section id="experimentos" className="py-12 px-4 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Experimentos Disponibles</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">v1.1.0</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map((exp) => {
            const IconComponent = exp.icon;
            return (
              <div
                key={exp.id}
                className={`group relative rounded-2xl border p-6 transition-all duration-300 flex flex-col justify-between ${
                  exp.active
                    ? "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 shadow-lg"
                    : "bg-slate-900/30 border-slate-800/60 opacity-60"
                }`}
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {exp.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  {exp.active ? (
                    <Link
                      href={exp.href}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors"
                    >
                      Iniciar experimento
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <span className="text-xs font-mono text-slate-500">
                      En desarrollo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sección ¿Qué es la Psicoacústica? */}
      <section id="psicoacustica" className="py-12 px-4 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">¿Qué es la Psicoacústica?</h2>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 text-slate-300 text-sm leading-relaxed">
          <p>
            La psicoacústica es la rama de la psicofísica que estudia las relaciones entre los estímulos acústicos (la física del sonido) y las sensaciones auditivas que estos producen en el cerebro (la percepción).
          </p>
          <p>
            A diferencia de los instrumentos de medición acústica que registran datos físicos objetivos (como la presión sonora en pascales o la frecuencia en hertz), el oído humano es un sistema no lineal. Procesamos la información a través de la codificación en la membrana basilar de la cóclea y la interpretación cortical de los patrones neurofisiológicos.
          </p>
        </div>
      </section>

      {/* SECCIÓN AGREGADA: Tabla de Correlatos Acústicos vs. Psicoacústicos */}
      <section id="correlatos" className="py-12 px-4 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Correlatos Acústicos y Psicoacústicos</h2>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              <span className="text-cyan-300 font-mono">Físico</span>
            </div>
            <span className="text-slate-600">vs</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
              <span className="text-purple-300 font-mono">Perceptual</span>
            </div>
          </div>
        </div>

        {/* Tabla para pantallas medianas/grandes */}
        <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
                <th className="py-4 px-6 font-semibold">Dimensión</th>
                <th className="py-4 px-6 font-semibold text-cyan-400">Dominio Acústico (Físico)</th>
                <th className="py-4 px-6 font-semibold text-purple-400">Dominio Psicoacústico (Perceptual)</th>
                <th className="py-4 px-6 font-semibold text-slate-400">Fenómeno / Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {correlatos.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-white">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${item.bgColor} ${item.borderColor} border`}>
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="font-semibold">{item.percepcion.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-200">{item.magnitud}</div>
                      <div className="text-xs font-mono text-cyan-400/80 mt-0.5">{item.unidadFisica}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-200">{item.percepcion}</div>
                      <div className="text-xs font-mono text-purple-400/80 mt-0.5">{item.unidadPsico}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs leading-relaxed max-w-xs">
                      {item.descripcion}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tarjetas adaptativas para celulares */}
        <div className="grid grid-cols-1 sm:hidden gap-4">
          {correlatos.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`bg-slate-900/60 border ${item.borderColor} rounded-xl p-5 space-y-4`}>
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                  <div className={`p-2 rounded-lg ${item.bgColor} border ${item.borderColor}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <h3 className="font-bold text-white text-sm">{item.percepcion}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">Acústica</span>
                    <p className="font-bold text-slate-200">{item.magnitud}</p>
                    <p className="font-mono text-slate-400 text-[11px]">{item.unidadFisica}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase block">Psicoacústica</span>
                    <p className="font-bold text-slate-200">{item.percepcion}</p>
                    <p className="font-mono text-slate-400 text-[11px]">{item.unidadPsico}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                  {item.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sección Bibliografía */}
      <section id="bibliografia" className="py-12 px-4 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Bibliografía y Referencias Académicas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {references.map((ref, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-2">
              <div className="text-xs font-mono text-cyan-400 font-semibold">{ref.authors} ({ref.year})</div>
              <div className="text-sm font-bold text-slate-100">{ref.title}</div>
              <div className="text-xs text-slate-400 italic">{ref.publisher}</div>
              <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/60 leading-relaxed">
                {ref.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sección Agradecimientos y Reconocimiento Docente */}
      <section className="py-12 px-4 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <GraduationCap className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Agradecimientos y Guía Académica</h2>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 sm:p-8 text-slate-300 text-sm leading-relaxed">
          <p>
            Agradecimiento especial a los profesores <strong className="text-cyan-400 font-semibold">Mariano Piñeiro</strong> y <strong className="text-purple-400 font-semibold">Pablo M. Freiberg</strong> por brindar la información, el material bibliográfico y el soporte teórico indispensable para hacer posible el desarrollo de este laboratorio interactivo.
          </p>
        </div>
      </section>
    </div>
  );
}