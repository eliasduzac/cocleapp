import Link from "next/link";
import { ArrowLeft, Sliders, Ear } from "lucide-react";
import ShepardTone from "@/components/experiments/ShepardTone";

export default function ShepardTonePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Navigation Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al explorador de experimentos</span>
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
          <Sliders className="w-3.5 h-3.5" /> Ilusión Auditiva #01
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          El Tono de Shepard
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          Conocido popularmente como el equivalente auditivo a la "Escalera de Escher".
        </p>
      </div>

      {/* Interactive Experiment Component */}
      <ShepardTone />

      {/* Educational Deep Dive */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Ear className="w-5 h-5 text-cyan-400" />
          La ciencia detrás de la Ilusión
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Descubierto por el psicólogo Roger Shepard en 1964, este efecto aprovecha la forma en que el sistema auditivo procesa la <strong>altura del tono</strong> (frecuencia fundamental) vs. el <strong>color/brillo del timbre</strong> (distribución de armónicos). Al atenuar los extremos del espectro mientras los armónicos centrales suben, el cerebro se concentra en el movimiento ascendente continuo y pierde la noción del tono absoluto.
        </p>
      </div>
    </div>
  );
}