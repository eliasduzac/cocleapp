"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Play, Square, ArrowLeft, Volume2, Info, Activity, BarChart2 } from "lucide-react";
import { registerAudioContext } from "@/lib/audioRegistry";

export default function BandasCriticasPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [f1, setF1] = useState(435); // Frecuencia Tono 1 en Hz (100 - 7000 Hz)
  const [f2, setF2] = useState(445); // Frecuencia Tono 2 en Hz (100 - 7000 Hz)
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const specCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Valores calculados dinámicamente
  const df = Math.abs(f2 - f1);
  const fc = (f1 + f2) / 2;

  // Refs para evitar closure trap durante animaciones
  const f1Ref = useRef(f1);
  const f2Ref = useRef(f2);

  useEffect(() => {
    f1Ref.current = f1;
    f2Ref.current = f2;
  }, [f1, f2]);

  // Clasificación psicoacústica basada en la fórmula de Zwicker
  const getRegimeInfo = () => {
    const criticalBandwidth = 25 + 75 * Math.pow(1 + 1.4 * Math.pow(fc / 1000, 2), 0.69);
    
    if (df < 15) {
      return {
        title: "Batidos Lentos (Modulación de Amplitud)",
        desc: `El sistema auditivo no distingue dos tonos separados, sino un único tono percibido de ~${Math.round(fc)} Hz que varía rítmicamente en volumen a una frecuencia de |f₂ - f₁| = ${Math.round(df)} Hz.`,
        color: "border-cyan-500/50 text-cyan-400 bg-cyan-950/40",
      };
    } else if (df < criticalBandwidth) {
      return {
        title: "Rugosidad / Disonancia (Aparece dentro de la Banda Crítica)",
        desc: `Los dos tonos compiten dentro de los mismos receptores cocleares (ancho de banda crítica actual: ~${Math.round(criticalBandwidth)} Hz). El oído percibe una textura áspera a ${Math.round(df)} Hz.`,
        color: "border-amber-500/50 text-amber-400 bg-amber-950/40",
      };
    } else {
      return {
        title: "Resolución Tonal (Frecuencias Fuera de la Banda Crítica)",
        desc: `La separación de ${Math.round(df)} Hz supera el ancho de la banda crítica (~${Math.round(criticalBandwidth)} Hz). La cóclea logra estimular filtros basilares independientes y escuchás dos tonos puros claramente diferenciados (${Math.round(f1)} Hz y ${Math.round(f2)} Hz).`,
        color: "border-emerald-500/50 text-emerald-400 bg-emerald-950/40",
      };
    }
  };

  const regime = getRegimeInfo();

  // Función para dibujar el espectro discreto con escala ampliada a 7000 Hz
  const drawSpectrum = useCallback(() => {
    if (!specCanvasRef.current) return;
    const canvas = specCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const maxFreq = 7000;
    const margin = { top: 35, right: 30, bottom: 40, left: 55 };
    const plotWidth = canvas.width - margin.left - margin.right;
    const plotHeight = canvas.height - margin.top - margin.bottom;

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Eje Y (Amplitud)
    ctx.strokeStyle = "rgba(51, 65, 85, 0.3)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";

    const ySteps = [0, 0.25, 0.5, 0.75, 1.0];
    ySteps.forEach((val) => {
      const y = margin.top + plotHeight * (1 - val);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + plotWidth, y);
      ctx.stroke();
      ctx.fillText(`${Math.round(val * 100)}%`, margin.left - 8, y + 3);
    });

    // Eje X (Frecuencia en Hz)
    ctx.textAlign = "center";
    const xStepHz = 1000;
    for (let fHz = 0; fHz <= maxFreq; fHz += xStepHz) {
      const x = margin.left + (fHz / maxFreq) * plotWidth;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + plotHeight);
      ctx.stroke();
      const label = fHz >= 1000 ? `${fHz / 1000}k` : `${fHz}`;
      ctx.fillText(label, x, margin.top + plotHeight + 18);
    }

    // Títulos de ejes
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "11px sans-serif";
    ctx.fillText("Frecuencia (Hz)", margin.left + plotWidth / 2, canvas.height - 8);

    ctx.save();
    ctx.translate(15, margin.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Amplitud", 0, 0);
    ctx.restore();

    // Componentes espectrales
    const components = [
      { freq: f1Ref.current, label: `f₁: ${Math.round(f1Ref.current)} Hz`, color: "#22d3ee" },
      { freq: f2Ref.current, label: `f₂: ${Math.round(f2Ref.current)} Hz`, color: "#c084fc" },
    ];

    components.forEach(({ freq, label, color }) => {
      if (freq >= 0 && freq <= maxFreq) {
        const x = margin.left + (freq / maxFreq) * plotWidth;
        const ampRatio = 0.5;
        const yTop = margin.top + plotHeight * (1 - ampRatio);
        const yBottom = margin.top + plotHeight;

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, yBottom);
        ctx.lineTo(x, yTop);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, yTop, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(label, x, yTop - 8);
      }
    });
  }, []);

  useEffect(() => {
    drawSpectrum();
  }, [f1, f2, drawSpectrum]);

  // Función de apagado completo local
  const stopAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (osc1Ref.current) {
      try {
        osc1Ref.current.stop();
        osc1Ref.current.disconnect();
      } catch {}
      osc1Ref.current = null;
    }

    if (osc2Ref.current) {
      try {
        osc2Ref.current.stop();
        osc2Ref.current.disconnect();
      } catch {}
      osc2Ref.current = null;
    }

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

  // Listener para el evento del botón de pánico global
  useEffect(() => {
    const handlePanic = () => {
      stopAudio();
    };

    window.addEventListener("panic-stop-audio", handlePanic);
    return () => window.removeEventListener("panic-stop-audio", handlePanic);
  }, [stopAudio]);

  const startAudio = () => {
    if (isPlaying) return;

    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    
    // 1. Registro global en el audioRegistry
    registerAudioContext(ctx);

    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGainRef.current = masterGain;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc1.type = "sine";
    osc2.type = "sine";

    osc1.frequency.setValueAtTime(f1, ctx.currentTime);
    osc2.frequency.setValueAtTime(f2, ctx.currentTime);

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    gain1.gain.setValueAtTime(0.5, ctx.currentTime);
    gain2.gain.setValueAtTime(0.5, ctx.currentTime);

    osc1.connect(gain1);
    osc2.connect(gain2);

    gain1.connect(masterGain);
    gain2.connect(masterGain);

    masterGain.connect(analyser);
    analyser.connect(ctx.destination);

    osc1.start();
    osc2.start();

    osc1Ref.current = osc1;
    osc2Ref.current = osc2;

    setIsPlaying(true);
    drawVisualizations();
  };

  useEffect(() => {
    if (
      audioCtxRef.current &&
      audioCtxRef.current.state === "running" &&
      osc1Ref.current &&
      osc2Ref.current
    ) {
      osc1Ref.current.frequency.setValueAtTime(f1, audioCtxRef.current.currentTime);
      osc2Ref.current.frequency.setValueAtTime(f2, audioCtxRef.current.currentTime);
    }
  }, [f1, f2]);

  useEffect(() => {
    if (
      audioCtxRef.current &&
      audioCtxRef.current.state === "running" &&
      masterGainRef.current
    ) {
      masterGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

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

      drawSpectrum();
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  return (
    <div className="min-h-[calc(100vh-95px)] bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <Link
          href="/#experimentos"
          className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al menú principal
        </Link>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono mb-3">
            Laboratorio de Integración Coclear
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Bandas Críticas, Batidos y Rugosidad
          </h1>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            Experimentá con la superposición de dos frecuencias senoidales independientes (100 Hz a 7000 Hz) y observá la variación del ancho de la banda crítica a lo largo del espectro audible.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 flex justify-center md:justify-start">
              {!isPlaying ? (
                <button
                  onClick={startAudio}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25"
                >
                  <Play className="w-5 h-5 fill-current" /> Iniciar Generador
                </button>
              ) : (
                <button
                  onClick={stopAudio}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/25"
                >
                  <Square className="w-5 h-5 fill-current" /> Detener Generador
                </button>
              )}
            </div>

            <div className={`md:col-span-8 p-4 rounded-xl border ${regime.color} transition-all`}>
              <span className="text-[10px] font-mono uppercase tracking-widest block opacity-75 mb-1">
                Régimen Psicoacústico
              </span>
              <h4 className="font-bold text-sm mb-1">{regime.title}</h4>
              <p className="text-xs opacity-90 leading-relaxed">{regime.desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Activity className="w-4 h-4" /> OSCILOSCOPIO (Dominio del Tiempo)
                </span>
                <span className="text-[10px] text-slate-500">Amplitud vs. Tiempo</span>
              </div>
              <canvas
                ref={oscCanvasRef}
                width={500}
                height={200}
                className="w-full h-48 bg-slate-950 rounded-lg border border-slate-900"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <BarChart2 className="w-4 h-4" /> ESPECTRO (Dominio de Frecuencia)
                </span>
                <span className="text-[10px] text-slate-500">Eje X: Hz | Eje Y: % Amp</span>
              </div>
              <canvas
                ref={specCanvasRef}
                width={500}
                height={200}
                className="w-full h-48 bg-slate-950 rounded-lg border border-slate-900"
              />
            </div>

          </div>

          <div className="space-y-6 pt-4 border-t border-slate-800">
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Frecuencia Tono 1 (f₁)</span>
                <span className="text-cyan-400 font-bold text-sm">{f1} Hz</span>
              </div>
              <input
                type="range"
                min="100"
                max="7000"
                step="1"
                value={f1}
                onChange={(e) => setF1(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Frecuencia Tono 2 (f₂)</span>
                <span className="text-purple-400 font-bold text-sm">{f2} Hz</span>
              </div>
              <input
                type="range"
                min="100"
                max="7000"
                step="1"
                value={f2}
                onChange={(e) => setF2(Number(e.target.value))}
                className="w-full accent-purple-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-center text-xs font-mono">
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-500 block text-[10px]">FRECUENCIA CENTRAL (f<sub>c</sub>)</span>
                <span className="text-slate-200 font-bold text-sm">{Math.round(fc)} Hz</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
                <span className="text-slate-500 block text-[10px]">DIFERENCIA (Δf)</span>
                <span className="text-slate-200 font-bold text-sm">{Math.round(df)} Hz</span>
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

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Info className="w-4 h-4" /> ¿Qué está sucediendo internamente?
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            La membrana basilar dentro del oído interno actúa como un analizador de espectro biológico continuo. Cuando dos tonos están muy cercanos (Δf pequeño), estimulan la misma región coclear, provocando interferencia destructiva y constructiva que percibimos como <strong>batidos</strong>.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            A medida que la frecuencia central (f<sub>c</sub>) sube hacia los varios kilohertz, el ancho absoluto de la <strong>banda crítica</strong> aumenta significativamente (pasando de ~100 Hz en bajas frecuencias a más de 1000 Hz en frecuencias altas). Por eso, a mayor f<sub>c</sub>, los tonos requieren una mayor diferencia en Hertz para separarse completamente en la cóclea.
          </p>
        </div>

      </div>
    </div>
  );
}