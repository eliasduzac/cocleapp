"use client";

import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { Play, Square, Info } from "lucide-react";
import Oscilloscope from "@/components/ui/Oscilloscope";

export default function BandasCriticas() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [centerFreq, setCenterFreq] = useState(440);
  const [deltaFreq, setDeltaFreq] = useState(10);
  const [waveformNode, setWaveformNode] = useState<Tone.Waveform | null>(null);

  const osc1Ref = useRef<Tone.Oscillator | null>(null);
  const osc2Ref = useRef<Tone.Oscillator | null>(null);
  const gainRef = useRef<Tone.Gain | null>(null);

  // Protección contra frecuencias negativas o nulas
  const f1 = Math.max(1, centerFreq - deltaFreq / 2);
  const f2 = Math.max(1, centerFreq + deltaFreq / 2);
  const fBatido = Math.abs(f2 - f1);

  // Ancho de banda crítica empírico (Zwicker)
  const bandacritica = Math.round(
    25 + 75 * Math.pow(1 + 1.4 * Math.pow(centerFreq / 1000, 2), 0.69)
  );

  const getRegimenPsicoacustico = () => {
    if (deltaFreq === 0) {
      return {
        titulo: "Unísono",
        desc: "Coincidencia de frecuencia. Superposición exacta de fase.",
        color: "text-cyan-400",
        border: "border-cyan-500/30",
        bg: "bg-cyan-500/10",
      };
    }
    if (deltaFreq <= 15) {
      return {
        titulo: "Batidos Lentos (Modulación de Amplitud)",
        desc: "El sistema auditivo detecta la variación rítmica de volumen a frecuencia |f₂ - f₁|.",
        color: "text-emerald-400",
        border: "border-emerald-500/30",
        bg: "bg-emerald-500/10",
      };
    }
    if (deltaFreq < bandacritica) {
      return {
        titulo: "Rugosidad (Disonancia Psicoacústica)",
        desc: "Ambos tonos interactúan dentro del mismo filtro coclear produciendo sensación áspera.",
        color: "text-amber-400",
        border: "border-amber-500/30",
        bg: "bg-amber-500/10",
      };
    }
    return {
      titulo: "Resolución Tonal (Dos Tonos Independientes)",
      desc: "Superado el ancho de la Banda Crítica, la membrana basilar discrimina los dos estímulos.",
      color: "text-purple-400",
      border: "border-purple-500/30",
      bg: "bg-purple-500/10",
    };
  };

  const regimen = getRegimenPsicoacustico();

  const toggleAudio = async () => {
    if (isPlaying) {
      if (gainRef.current) gainRef.current.gain.rampTo(0, 0.05);
      setTimeout(() => {
        osc1Ref.current?.stop().dispose();
        osc2Ref.current?.stop().dispose();
        gainRef.current?.dispose();
        waveformNode?.dispose();
        setWaveformNode(null);
        setIsPlaying(false);
      }, 60);
    } else {
      await Tone.start();
      const masterGain = new Tone.Gain(0.25).toDestination();
      const waveform = new Tone.Waveform(1024);
      masterGain.connect(waveform);

      const osc1 = new Tone.Oscillator(f1, "sine").connect(masterGain);
      const osc2 = new Tone.Oscillator(f2, "sine").connect(masterGain);

      osc1.start();
      osc2.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      gainRef.current = masterGain;
      setWaveformNode(waveform);

      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying && osc1Ref.current && osc2Ref.current) {
      osc1Ref.current.frequency.setValueAtTime(f1, Tone.now());
      osc2Ref.current.frequency.setValueAtTime(f2, Tone.now());
    }
  }, [centerFreq, deltaFreq, f1, f2, isPlaying]);

  useEffect(() => {
    return () => {
      osc1Ref.current?.dispose();
      osc2Ref.current?.dispose();
      gainRef.current?.dispose();
      waveformNode?.dispose();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <button
            onClick={toggleAudio}
            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg ${
              isPlaying
                ? "bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-5 h-5 fill-current" />
                <span>Detener Audio</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Iniciar Generador</span>
              </>
            )}
          </button>

          <div
            className={`w-full sm:w-auto flex-1 p-4 rounded-xl border ${regimen.border} ${regimen.bg} transition-all`}
          >
            <div className="text-[10px] uppercase tracking-wider font-mono text-slate-400 mb-1">
              Régimen Psicoacústico:
            </div>
            <div className={`text-base font-bold ${regimen.color}`}>
              {regimen.titulo}
            </div>
            <p className="text-xs text-slate-300 mt-1">{regimen.desc}</p>
          </div>
        </div>

        <Oscilloscope waveformNode={waveformNode} isPlaying={isPlaying} />

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-semibold text-slate-300">
                Frecuencia Central (f<sub>c</sub>)
              </label>
              <span className="font-mono text-cyan-400 font-bold">
                {centerFreq} Hz
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="1500"
              step="5"
              value={centerFreq}
              onChange={(e) => setCenterFreq(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <label className="font-semibold text-slate-300">
                Diferencia (&Delta;f)
              </label>
              <span className="font-mono text-purple-400 font-bold">
                {deltaFreq} Hz
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(200, Math.round(bandacritica * 1.5))}
              step="1"
              value={deltaFreq}
              onChange={(e) => setDeltaFreq(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-center">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="block text-[10px] uppercase font-mono text-slate-400">
              Tono 1 (f<sub>1</sub>)
            </span>
            <span className="text-lg font-bold text-slate-200 font-mono">
              {f1.toFixed(1)} Hz
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="block text-[10px] uppercase font-mono text-slate-400">
              Tono 2 (f<sub>2</sub>)
            </span>
            <span className="text-lg font-bold text-slate-200 font-mono">
              {f2.toFixed(1)} Hz
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="block text-[10px] uppercase font-mono text-slate-400">
              Freq. Batido
            </span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {fBatido.toFixed(1)} Hz
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="block text-[10px] uppercase font-mono text-slate-400">
              Banda Crítica (&Delta;f<sub>cb</sub>)
            </span>
            <span className="text-lg font-bold text-purple-400 font-mono">
              ≈ {bandacritica} Hz
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" /> Explicación Neurofisiológica
        </h3>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Al superponer dos frecuencias senoidales cercanamente espaciadas en la membrana basilar, la tasa de modulación del patrón vibratorio viene dada por la diferencia de frecuencias:
          </p>
          <div className="text-center font-mono text-cyan-400 py-1 bg-slate-950/40 rounded-lg border border-slate-800/60">
            {"f_batido = |f₂ - f₁| = Δf"}
          </div>
          <p>
            La banda crítica representa la resolución espacial del filtro coclear en el oído interno. Cuando Δf se ubica por debajo del ancho de banda crítica pero por encima de los batidos lentos (~ 15 Hz), el sistema auditivo percibe una disonancia áspera denominada <strong>rugosidad</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}