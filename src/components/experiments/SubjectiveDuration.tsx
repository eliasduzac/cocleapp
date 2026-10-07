"use client";

import { useState, useRef, useCallback } from "react";
import { calculateSubjectiveDuration } from "@/lib/greyData";
import { registerAudioContext } from "@/lib/audioRegistry";
import { Play, Clock, Sparkles } from "lucide-react";

interface SubjectiveDurationProps {
  cursorPos: { x: number; y: number; z: number };
}

export default function SubjectiveDuration({ cursorPos }: SubjectiveDurationProps) {
  const [physicalTime, setPhysicalTime] = useState(5);
  const [density, setDensity] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<"static" | "complex">("complex");
  const [sustain, setSustain] = useState(0.95);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Normalización de coordenadas 3D (-1 a 1 -> 0 a 1)
  const attack = Math.max(0, (cursorPos.x + 1) / 2);
  const brightness = Math.max(0, (cursorPos.y + 1) / 2);
  const instability = Math.max(0, (cursorPos.z + 1) / 2);

  const subjectiveTime = calculateSubjectiveDuration(
    physicalTime,
    mode === "static" ? 1 : density,
    mode === "static" ? 0 : instability,
    mode === "static" ? 0.2 : brightness
  );

  const playExperimentAudio = useCallback(() => {
    if (isPlaying) return;

    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    registerAudioContext(ctx);
    audioCtxRef.current = ctx;

    setIsPlaying(true);

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.2, now);
    master.connect(ctx.destination);

    const totalDuration = physicalTime;

    if (mode === "static") {
      // ESTÍMULO A: Tono senoidal simple y continuo (Sin armónicos ni variaciones)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.setValueAtTime(0.2, now + totalDuration - 0.1);
      gain.gain.linearRampToValueAtTime(0, now + totalDuration);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + totalDuration);
    } else {
      // ESTÍMULO B: Síntesis armónica rica modelada por las coordenadas 3D de John Grey
      const interval = 1 / density;
      const noteDuration = interval * sustain;

      let eventTime = 0;
      while (eventTime < totalDuration) {
        const startTime = now + eventTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Onda rica en armónicos (sawtooth) para permitir filtrado de timbre real
        osc.type = "sawtooth";

        // Frecuencia base + Inestabilidad tímbrica (Eje Z)
        const freqOffset = (Math.random() - 0.5) * instability * 40;
        osc.frequency.setValueAtTime(220 + freqOffset, startTime);

        // Brillo frecuencial (Eje Y): Curva exponencial de 250 Hz (oscuro/flauta) a 7500 Hz (brillante/trompeta)
        const cutoff = 250 + Math.pow(brightness, 2.2) * 7250;
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(cutoff, startTime);

        // Tiempo de ataque (Eje X): De percusivo/repentino (0.005s) a progresivo (0.12s)
        const attackTime = Math.max(0.005, (1 - attack) * 0.12);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + attackTime);
        gain.gain.setValueAtTime(0.2, startTime + Math.max(attackTime, noteDuration * 0.7));
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);

        eventTime += interval;
      }
    }

    setTimeout(() => {
      setIsPlaying(false);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    }, totalDuration * 1000 + 200);
  }, [physicalTime, density, instability, brightness, attack, mode, isPlaying, sustain]);

  const dilationPercentage = Math.round(((subjectiveTime - physicalTime) / physicalTime) * 100);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-sm">
            Psicoacústica de la Duración Subjetiva (Freiberg)
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("static")}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              mode === "static"
                ? "bg-slate-800 text-white font-bold border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Estímulo A (Continuo)
          </button>
          <button
            onClick={() => setMode("complex")}
            className={`px-3 py-1 rounded text-xs font-mono transition-all ${
              mode === "complex"
                ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Estímulo B (Complejo)
          </button>
        </div>
      </div>

      {/* Visualizador Comparativo de Tiempo Físico vs Percibido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
        <div>
          <span className="text-[11px] font-mono text-slate-400 block mb-1">
            DURACIÓN FÍSICA (Reloj)
          </span>
          <div className="text-2xl font-mono font-bold text-slate-200">
            {physicalTime.toFixed(1)} <span className="text-xs text-slate-500">seg</span>
          </div>
        </div>
        <div>
          <span className="text-[11px] font-mono text-amber-400 block mb-1">
            DURACIÓN PERCIBIDA ESTIMADA
          </span>
          <div className="text-2xl font-mono font-bold text-amber-400 flex items-center gap-2">
            {subjectiveTime.toFixed(1)} <span className="text-xs text-slate-500">seg</span>
            {dilationPercentage > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                +{dilationPercentage}% Dilatación
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sliders de Parámetros */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Duración Real del Intervalo</span>
            <span className="text-slate-400">{physicalTime} seg</span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            step="0.5"
            value={physicalTime}
            onChange={(e) => setPhysicalTime(parseFloat(e.target.value))}
            className="w-full accent-amber-400 bg-slate-900 h-2 rounded cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Densidad de Eventos (Pulsación)</span>
            <span className="text-amber-400 font-bold">{density} ev/seg</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            disabled={mode === "static"}
            value={density}
            onChange={(e) => setDensity(parseInt(e.target.value))}
            className="w-full accent-amber-400 bg-slate-900 h-2 rounded cursor-pointer disabled:opacity-30"
          />
        </div>

        {mode === "complex" && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Sostén de Sonido (Legato vs Staccato)</span>
              <span className="text-amber-400 font-bold">{Math.round(sustain * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={sustain}
              onChange={(e) => setSustain(parseFloat(e.target.value))}
              className="w-full accent-amber-400 bg-slate-900 h-2 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Botón Escuchar Experimento */}
      <button
        onClick={playExperimentAudio}
        disabled={isPlaying}
        className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-current" />
        {isPlaying
          ? "Reproduciendo Estímulo..."
          : `Reproducir Estímulo ${mode === "static" ? "A (Continuo)" : "B (Complejo)"}`}
      </button>

      {/* Nota Explicativa Freiberg */}
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-200/80">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Ley de Freiberg:</strong> Un tono continuo e inalterado genera poca carga cognitiva (tiempo vacío). En cambio, eventos sostenidos con variaciones de brillo e inestabilidad obligan al cerebro a almacenar múltiples marcas en la memoria, haciendo que el tiempo parezca **transcurrir más lentamente**.
        </p>
      </div>
    </div>
  );
}