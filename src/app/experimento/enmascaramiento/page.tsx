import Enmascaramiento from "@/components/experiments/Enmascaramiento";

export default function EnmascaramientoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <a
          href="/"
          className="text-xs font-mono text-cyan-400 hover:underline inline-flex items-center gap-1"
        >
          &larr; Volver al menú principal
        </a>

        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 mb-3">
            Laboratorio de Análisis Espectral
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Enmascaramiento Auditivo Simultáneo
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2 leading-relaxed">
            Explorá cómo la presencia de un enmascarador (ruido o tono) modifica los umbrales de audibilidad en el dominio de la frecuencia y su representación en el espectro.
          </p>
        </div>

        <Enmascaramiento />
      </div>
    </main>
  );
}