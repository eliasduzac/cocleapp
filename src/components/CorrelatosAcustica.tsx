"use client";

import React from "react";
import { Waves, Volume2, Music, Clock, Compass, Activity } from "lucide-react";

interface CorrelatoItem {
  magnitudFisica: string;
  unidadFisica: string;
  sensacionPsico: string;
  unidadPsico: string;
  descripcion: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}

const correlatosData: CorrelatoItem[] = [
  {
    magnitudFisica: "Frecuencia",
    unidadFisica: "Hertz (Hz)",
    sensacionPsico: "Altura / Tono (Pitch)",
    unidadPsico: "Mel, Bark, Semitonos",
    descripcion: "Tasa de oscilación de la onda física frente a la percepción de gravedad o agudeza del sonido.",
    icon: Waves,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
  {
    magnitudFisica: "Presión / Amplitud",
    unidadFisica: "Pascal (Pa), dB SPL",
    sensacionPsico: "Sonoridad (Loudness)",
    unidadPsico: "Phon, Sone",
    descripcion: "Nivel energético de la presión sonora frente a la percepción subjetiva de volumen.",
    icon: Volume2,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    magnitudFisica: "Espectro y Envolvente",
    unidadFisica: "Distribución armónica / ADSR",
    sensacionPsico: "Timbre",
    unidadPsico: "Cualidad tímbrica",
    descripcion: "Contenido de frecuencias y evolución temporal que diferencia dos fuentes a igual tono y sonoridad.",
    icon: Music,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
  },
  {
    magnitudFisica: "Duración / Tiempo",
    unidadFisica: "Milisegundos (ms)",
    sensacionPsico: "Duración Subjetiva",
    unidadPsico: "Integración Temporal",
    descripcion: "Extensión temporal física frente al proceso de acumulación de energía auditiva en la cóclea (~200 ms).",
    icon: Clock,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    magnitudFisica: "Diferencias Interaurales",
    unidadFisica: "ITD (Δt), ILD (ΔL)",
    sensacionPsico: "Localización Espacial",
    unidadPsico: "Azimut, Elevación, Distancia",
    descripcion: "Diferencias de tiempo e intensidad entre oídos que posibilitan la percepción espacial 3D.",
    icon: Compass,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
];

export default function CorrelatosAcustica() {
  return (
    <section className="w-full max-w-6xl mx-auto py-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Correlatos Acústicos y Psicoacústicos</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Correspondencia entre magnitudes físicas objetivas y sensaciones auditivas subjetivas.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span>Física (Objetiva)</span>
          </div>
          <span className="text-slate-600">vs</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
            <span>Percepción (Subjetiva)</span>
          </div>
        </div>
      </div>

      <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
              <th className="py-4 px-6 font-semibold">Dimensión</th>
              <th className="py-4 px-6 font-semibold text-cyan-300">Dominio Acústico (Físico)</th>
              <th className="py-4 px-6 font-semibold text-purple-300">Dominio Psicoacústico (Perceptual)</th>
              <th className="py-4 px-6 font-semibold text-slate-400">Descripción / Fenómeno</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
            {correlatosData.map((item, idx) => {
              const Icon = item.icon;
              return (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 font-medium text-white">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${item.bgColor} ${item.borderColor} border`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <span className="font-semibold">{item.sensacionPsico.split(" ")[0]}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-200">{item.magnitudFisica}</div>
                    <div className="text-xs font-mono text-cyan-400/80 mt-0.5">{item.unidadFisica}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-200">{item.sensacionPsico}</div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
        {correlatosData.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`bg-slate-900/80 border ${item.borderColor} rounded-xl p-5 space-y-4 shadow-lg`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${item.bgColor} border ${item.borderColor}`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <h3 className="font-bold text-white text-sm">{item.sensacionPsico}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block">Acústica (Física)</span>
                  <p className="font-bold text-slate-200">{item.magnitudFisica}</p>
                  <p className="font-mono text-slate-400 text-[11px]">{item.unidadFisica}</p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-purple-400 font-bold block">Psicoacústica</span>
                  <p className="font-bold text-slate-200">{item.sensacionPsico}</p>
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
  );
}