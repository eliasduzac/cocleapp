import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import BandasCriticas from "@/components/experiments/BandasCriticas";

export default function BandasCriticasPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 text-slate-200">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al menú principal</span>
      </Link>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
          <Activity className="w-3.5 h-3.5" /> Laboratorio de Integración Coclear
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Bandas Críticas, Batidos y Rugosidad
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Experimentá con la superposición de dos frecuencias senoidales simultáneas y observá la transición entre batidos rítmicos, rugosidad disonante y resolución tonal[cite: 2].
        </p>
      </div>

      <BandasCriticas />
    </div>
  );
}