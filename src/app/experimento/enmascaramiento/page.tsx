"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Square, Volume2, Activity, BarChart2, Radio, Waves, Sparkles } from "lucide-react";
import { registerAudioContext } from "@/lib/audioRegistry";

type SoundType = "pure" | "complex" | "noise";

export default function Enmascaramiento() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Parámetros Enmascarador
  const [maskerType, setMaskerType] = useState<SoundType>("pure");
  const [maskerFreq, setMaskerFreq] = useState(1000);
  const [maskerGain, setMaskerGain] = useState(0.6);

  // Parámetros Señal / Prueba
  const [probeType, setProbeType] = useState<SoundType>("pure");
  const [probeFreq, setProbeFreq] = useState(1200);
  const [probeGain, setProbeGain] = useState(0.15);

  const [volume, setVolume] = useState(0.5);

  // Referencias de Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Nodos activos del Enmascarador
  const maskerNodesRef = useRef<{
    sources: (AudioScheduledSourceNode)[];
    gainNode: GainNode;
    filterNode?: BiquadFilterNode;
  } | null>(null);

  // Nodos activos de la Señal Prueba
  const probeNodesRef = useRef<{
    sources: (AudioScheduledSourceNode)[];
    gainNode: GainNode;
    filterNode?: BiquadFilterNode;
  } | null>(null);

  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const specCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Generador de buffer de ruido blanco
  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  // Construcción dinámica de fuentes de audio (Puro, Complejo, Ruido)
  const createSoundSource = (
    ctx: AudioContext,
    type: SoundType,
    freq: number,
    gainValue: number,
    targetNode: AudioNode
  ) => {
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gainValue, ctx.currentTime);
    const sources: AudioScheduledSourceNode[] = [];
    let filterNode: BiquadFilterNode | undefined = undefined;

    if (type === "pure") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(gainNode);
      osc.start();
      sources.push(osc);
    } else if (type === "complex") {
      // Tono complejo: Fundamental + 2 Armónicos (f, 2f, 3f)
      [1, 2, 3].forEach((harmonic, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq * harmonic, ctx.currentTime);
        
        const hGain = ctx.createGain();
        hGain.gain.setValueAtTime(1 / (idx + 1), ctx.currentTime);
        
        osc.connect(hGain);
        hGain.connect(gainNode);
        osc.start();
        sources.push(osc);
      });
    } else if (type === "noise") {
      // Ruido filtrado en banda angosta centrado en la frecuencia
      const noiseBuffer = createNoiseBuffer(ctx);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      filterNode = ctx.createBiquadFilter();
      filterNode.type = "bandpass";
      filterNode.frequency.setValueAtTime(freq, ctx.currentTime);
      filterNode.Q.setValueAtTime(4.0, ctx.currentTime); // Ancho de banda ajustado

      noiseSource.connect(filterNode);
      filterNode.connect(gainNode);
      noiseSource.start();
      sources.push(noiseSource);
    }

    gainNode.connect(targetNode);
    return { sources, gainNode, filterNode };
  };

  // Apagado global e individual de nodos
  const stopAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (maskerNodesRef.current) {
      maskerNodesRef.current.sources.forEach((s) => {
        try { s.stop(); s.disconnect(); } catch {}
      });
      maskerNodesRef.current = null;
    }

    if (probeNodesRef.current) {
      probeNodesRef.current.sources.forEach((s) => {
        try { s.stop(); s.disconnect(); } catch {}
      });
      probeNodesRef.current = null;
    }

    masterGainRef.current = null;
    analyserRef.current = null;

    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== "closed") {
        try { audioCtxRef.current.close(); } catch {}
      }
      audioCtxRef.current = null;
    }

    setIsPlaying(false);
  }, []);

  // Event listener para el botón de pánico global del Layout
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
    masterGainRef.current = masterGain;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    // Crear enmascarador y prueba
    maskerNodesRef.current = createSoundSource(ctx, maskerType, maskerFreq, maskerGain, masterGain);
    probeNodesRef.current = createSoundSource(ctx, probeType, probeFreq, probeGain, masterGain);

    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    setIsPlaying(true);
    drawVisualizations();
  };

  // Reiniciar o actualizar fuentes cuando cambia el tipo de sonido
  useEffect(() => {
    if (isPlaying && audioCtxRef.current && masterGainRef.current) {
      // Recrear enmascarador
      if (maskerNodesRef.current) {
        maskerNodesRef.current.sources.forEach((s) => { try { s.stop(); } catch {} });
      }
      maskerNodesRef.current = createSoundSource(audioCtxRef.current, maskerType, maskerFreq, maskerGain, masterGainRef.current);
    }
  }, [maskerType]);

  useEffect(() => {
    if (isPlaying && audioCtxRef.current && masterGainRef.current) {
      // Recrear tono prueba
      if (probeNodesRef.current) {
        probeNodesRef.current.sources.forEach((s) => { try { s.stop(); } catch {} });
      }
      probeNodesRef.current = createSoundSource(audioCtxRef.current, probeType, probeFreq, probeGain, masterGainRef.current);
    }
  }, [probeType]);

  // Actualizar frecuencias y ganancias en tiempo real
  useEffect(() => {
    if (audioCtxRef.current && audioCtxRef.current.state === "running") {
      const now = audioCtxRef.current.currentTime;
      
      // Actualizar Enmascarador
      if (maskerNodesRef.current) {
        maskerNodesRef.current.gainNode.gain.setValueAtTime(maskerGain, now);
        if (maskerNodesRef.current.filterNode) {
          maskerNodesRef.current.filterNode.frequency.setValueAtTime(maskerFreq, now);
        } else {
          maskerNodesRef.current.sources.forEach((s, i) => {
            if (s instanceof OscillatorNode) s.frequency.setValueAtTime(maskerFreq * (i + 1), now);
          });
        }
      }

      // Actualizar Prueba
      if (probeNodesRef.current) {
        probeNodesRef.current.gainNode.gain.setValueAtTime(probeGain, now);
        if (probeNodesRef.current.filterNode) {
          probeNodesRef.current.filterNode.frequency.setValueAtTime(probeFreq, now);
        } else {
          probeNodesRef.current.sources.forEach((s, i) => {
            if (s instanceof OscillatorNode) s.frequency.setValueAtTime(probeFreq * (i + 1), now);
          });
        }
      }
    }
  }, [maskerFreq, maskerGain, probeFreq, probeGain]);

  useEffect(() => {
    if (audioCtxRef.current && audioCtxRef.current.state === "running" && masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  const drawVisualizations = () => {
    const draw = () => {
      const analyser = analyserRef.current;
      if (analyser && oscCanvasRef.current) {
        const canvas = oscCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteTimeDomainData(dataArray);

          ctx.fillStyle = "#020617";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);
          ctx.lineTo(canvas.width, canvas.height / 2);
          ctx.stroke();

          ctx.lineWidth = 2;
          ctx.strokeStyle = "#22d3ee";
          ctx.beginPath();

          const sliceWidth = canvas.width / bufferLength;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.stroke();
        }
      }

      // Espectro RTA por FFT
      if (analyser && specCanvasRef.current) {
        const canvas = specCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          ctx.fillStyle = "#020617";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 2.5;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;

            ctx.fillStyle = `rgb(192, 132, 252)`;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-8">
      
      {/* Botón de Control Principal */}
      <div className="flex items-center justify-between">
        {!isPlaying ? (
          <button
            onClick={startAudio}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" /> Iniciar Generador
          </button>
        ) : (
          <button
            onClick={stopAudio}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/25 cursor-pointer"
          >
            <Square className="w-5 h-5 fill-current" /> Detener Generador
          </button>
        )}

        <div className="text-right font-mono text-xs text-slate-400">
          <span>Estado: </span>
          <span className={isPlaying ? "text-emerald-400 font-bold" : "text-rose-400"}>
            {isPlaying ? "EN REPRODUCCIÓN" : "DETENIDO"}
          </span>
        </div>
      </div>

      {/* Visualizadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Activity className="w-4 h-4" /> OSCILOSCOPIO (Forma de Onda)
            </span>
          </div>
          <canvas ref={oscCanvasRef} width={500} height={200} className="w-full h-48 bg-slate-950 rounded-lg border border-slate-900" />
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-purple-400">
              <BarChart2 className="w-4 h-4" /> ESPECTROGRAMA FFT (RTA)
            </span>
          </div>
          <canvas ref={specCanvasRef} width={500} height={200} className="w-full h-48 bg-slate-950 rounded-lg border border-slate-900" />
        </div>
      </div>

      {/* Panel de Controles */}
      <div className="space-y-6 pt-4 border-t border-slate-800">
        
        {/* SECCIÓN ENMASCARADOR */}
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 font-bold text-sm flex items-center gap-2">
              <Radio className="w-4 h-4" /> ENMASCARADOR
            </span>
            {/* Selectores de Tipo de Sonido */}
            <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setMaskerType("pure")}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                  maskerType === "pure" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Tono Puro
              </button>
              <button
                onClick={() => setMaskerType("complex")}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                  maskerType === "complex" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Complejo
              </button>
              <button
                onClick={() => setMaskerType("noise")}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                  maskerType === "noise" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Ruido
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Frecuencia / Centro</span>
                <span className="text-cyan-400 font-bold">{maskerFreq} Hz</span>
              </div>
              <input
                type="range"
                min="200"
                max="4000"
                step="10"
                value={maskerFreq}
                onChange={(e) => setMaskerFreq(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Nivel de Amplitud</span>
                <span className="text-cyan-400 font-bold">{Math.round(maskerGain * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={maskerGain}
                onChange={(e) => setMaskerGain(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN SEÑAL / TONO PRUEBA */}
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-purple-400 font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> SEÑAL DE PRUEBA (ENMASCARADO)
            </span>
            {/* Selectores de Tipo de Sonido */}
            <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setProbeType("pure")}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                  probeType === "pure" ? "bg-purple-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Tono Puro
              </button>
              <button
                onClick={() => setProbeType("complex")}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                  probeType === "complex" ? "bg-purple-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Complejo
              </button>
              <button
                onClick={() => setProbeType("noise")}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all ${
                  probeType === "noise" ? "bg-purple-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Ruido
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Frecuencia / Centro</span>
                <span className="text-purple-400 font-bold">{probeFreq} Hz</span>
              </div>
              <input
                type="range"
                min="200"
                max="4000"
                step="10"
                value={probeFreq}
                onChange={(e) => setProbeFreq(Number(e.target.value))}
                className="w-full accent-purple-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Nivel de Amplitud</span>
                <span className="text-purple-400 font-bold">{Math.round(probeGain * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={probeGain}
                onChange={(e) => setProbeGain(Number(e.target.value))}
                className="w-full accent-purple-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* VOLUMEN MASTER */}
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