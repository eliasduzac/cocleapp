"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Square, Volume2, Sliders, Flame } from "lucide-react";
import { registerAudioContext } from "@/lib/audioRegistry";

export default function ShepardTone() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.5);
  const [direction, setDirection] = useState<"up" | "down">("up");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const specCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const voiceNodesRef = useRef<
    { osc: OscillatorNode; gain: GainNode }[]
  >([]);

  // 10 octavas para extender los agudos hasta el límite imperceptible de la audición humana
  const NUM_VOICES = 10;
  const F_BASE = 20; // Hz
  const F_CENTER = 500; // Hz (Centro psicoacústico)
  const SIGMA = 1.35; // Campana Gaussiana más ancha y progresiva

  const phaseRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const stopAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    voiceNodesRef.current.forEach(({ osc, gain }) => {
      try {
        osc.stop();
        osc.disconnect();
        gain.disconnect();
      } catch {}
    });
    voiceNodesRef.current = [];

    masterGainRef.current = null;
    analyserRef.current = null;

    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
      audioCtxRef.current = null;
    }

    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const handlePanic = () => stopAudio();
    window.addEventListener("panic-stop-audio", handlePanic);
    return () => window.removeEventListener("panic-stop-audio", handlePanic);
  }, [stopAudio]);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  const startAudio = () => {
    if (isPlaying) return;

    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    registerAudioContext(ctx);
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0.2;
    analyserRef.current = analyser;

    masterGain.connect(analyser);
    analyser.connect(ctx.destination);
    masterGainRef.current = masterGain;

    const voices: { osc: OscillatorNode; gain: GainNode }[] = [];

    for (let i = 0; i < NUM_VOICES; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(F_BASE * Math.pow(2, i), ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();

      voices.push({ osc, gain });
    }

    voiceNodesRef.current = voices;
    phaseRef.current = 0;
    lastTimeRef.current = performance.now();
    setIsPlaying(true);
    animateShepard();
  };

  // Envolvente Gaussiana ultra-suave extendida
  const getGaussianGain = (freq: number): number => {
    const octavesFromCenter = Math.log2(freq / F_CENTER);
    return Math.exp(-Math.pow(octavesFromCenter, 2) / (2 * Math.pow(SIGMA, 2)));
  };

  const animateShepard = () => {
    const update = (now: number) => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== "running") return;

      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const dirFactor = direction === "up" ? 1 : -1;
      phaseRef.current += dt * 0.08 * speed * dirFactor;

      const ctxTime = audioCtxRef.current.currentTime;

      voiceNodesRef.current.forEach(({ osc, gain }, i) => {
        let pos = (phaseRef.current + i) % NUM_VOICES;
        if (pos < 0) pos += NUM_VOICES;

        const currentFreq = F_BASE * Math.pow(2, pos);
        osc.frequency.setValueAtTime(currentFreq, ctxTime);

        const amp = getGaussianGain(currentFreq);
        gain.gain.setValueAtTime(amp * 0.12, ctxTime);
      });

      // Espectrograma HD Waterfall
      if (analyserRef.current && specCanvasRef.current) {
        const canvas = specCanvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);

          ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height - 1, 0, 1, canvas.width, canvas.height - 1);
          ctx.fillStyle = "#020617";
          ctx.fillRect(0, 0, canvas.width, 1);

          const sampleRate = audioCtxRef.current.sampleRate || 44100;
          const minSpecLog = Math.log2(20);
          const maxSpecLog = Math.log2(16000);

          for (let x = 0; x < canvas.width; x++) {
            const normX = x / canvas.width;
            const targetFreq = Math.pow(2, minSpecLog + normX * (maxSpecLog - minSpecLog));
            const bin = Math.floor((targetFreq / (sampleRate / 2)) * bufferLength);
            const val = dataArray[Math.min(bin, bufferLength - 1)] || 0;

            if (val > 4) {
              const intensity = val / 255;
              const r = Math.floor(intensity > 0.5 ? 244 : intensity * 190);
              const g = Math.floor(intensity * 210);
              const b = Math.floor(intensity < 0.3 ? intensity * 255 : 240);

              ctx.fillStyle = `rgb(${r},${g},${b})`;
              ctx.fillRect(x, 0, 1, 1);
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(update);
    };

    animFrameRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (audioCtxRef.current && masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-8">
      {/* Botón Principal */}
      <div className="flex items-center justify-between">
        {!isPlaying ? (
          <button
            onClick={startAudio}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" /> Iniciar Tono de Shepard
          </button>
        ) : (
          <button
            onClick={stopAudio}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/25 cursor-pointer"
          >
            <Square className="w-5 h-5 fill-current" /> Detener Tono de Shepard
          </button>
        )}

        <div className="text-right font-mono text-xs text-slate-400">
          <span>Estado: </span>
          <span className={isPlaying ? "text-emerald-400 font-bold" : "text-rose-400"}>
            {isPlaying ? "REPRODUCIENDO" : "DETENIDO"}
          </span>
        </div>
      </div>

      {/* Espectrograma HD */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Flame className="w-4 h-4 text-rose-500" /> ESPECTROGRAMA HD (10 Octavas - Atenuación imperceptible)
          </span>
          <span className="text-[10px] text-slate-500">← 20 Hz | 16 kHz →</span>
        </div>
        <canvas
          ref={specCanvasRef}
          width={1200}
          height={320}
          className="w-full h-56 bg-slate-950 rounded-lg border border-slate-900"
        />
      </div>

      {/* Panel de Ajustes */}
      <div className="space-y-6 pt-4 border-t border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Velocidad de Desplazamiento
              </span>
              <span className="text-cyan-400 font-bold">{speed}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Dirección de la Ilusión</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection("up")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  direction === "up"
                    ? "bg-cyan-500 text-slate-950 border-cyan-400"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                Ascendente ↑
              </button>
              <button
                onClick={() => setDirection("down")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  direction === "down"
                    ? "bg-cyan-500 text-slate-950 border-cyan-400"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                Descendente ↓
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-4">
          <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}