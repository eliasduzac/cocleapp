"use client";

import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { Play, Square, Info, Sliders, Volume2, Waves, Clock, Zap } from "lucide-react";

type SignalType = "sine" | "complex" | "noise";
type NonSimultaneousMode = "post" | "pre";

export default function Enmascaramiento() {
  const [activeTab, setActiveTab] = useState<"simultaneous" | "non_simultaneous">("simultaneous");

  // ==========================================
  // ESTADOS - ENMASCARAMIENTO SIMULTÁNEO
  // ==========================================
  const [isSimPlaying, setIsSimPlaying] = useState(false);
  const [simMaskerType, setSimMaskerType] = useState<SignalType>("sine");
  const [simMaskerFreq, setSimMaskerFreq] = useState(1000);
  const [simMaskerLevel, setSimMaskerLevel] = useState(70);

  const [simProbeType, setSimProbeType] = useState<SignalType>("sine");
  const [simProbeFreq, setSimProbeFreq] = useState(1300);
  const [simProbeLevel, setSimProbeLevel] = useState(40);

  const simMaskerOscRef = useRef<Tone.Oscillator | Tone.Noise | Tone.PolySynth | null>(null);
  const simProbeOscRef = useRef<Tone.Oscillator | Tone.Noise | Tone.PolySynth | null>(null);
  const simMaskerGainRef = useRef<Tone.Volume | null>(null);
  const simProbeGainRef = useRef<Tone.Volume | null>(null);
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ==========================================
  // ESTADOS - ENMASCARAMIENTO NO SIMULTÁNEO
  // ==========================================
  const [nonSimMode, setNonSimMode] = useState<NonSimultaneousMode>("post");
  const [isNonSimPlaying, setIsNonSimPlaying] = useState(false);
  const [nonSimMaskerFreq, setNonSimMaskerFreq] = useState(1000);
  const [nonSimMaskerLevel, setNonSimMaskerLevel] = useState(80);
  const [nonSimMaskerDuration, setNonSimMaskerDuration] = useState(200); // ms (5ms a 500ms)

  const [nonSimProbeFreq, setNonSimProbeFreq] = useState(2000);
  const [nonSimProbeLevel, setNonSimProbeLevel] = useState(45);
  const [nonSimProbeDuration] = useState(5); // ms (Impulso / Tone burst corto)
  const [nonSimDelay, setNonSimDelay] = useState(15); // ms (td: intervalo entre estímulos)

  const nonSimCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const dbToGain = (db: number) => {
    if (db <= 0) return 0;
    return Math.pow(10, (db - 90) / 20);
  };

  // ------------------------------------------
  // LÓGICA DE AUDIO: SIMULTÁNEO
  // ------------------------------------------
  const createSignalNode = (type: SignalType, freq: number) => {
    if (type === "sine") return new Tone.Oscillator(freq, "sine");
    if (type === "complex") return new Tone.Oscillator(freq, "sawtooth");
    return new Tone.Noise("pink");
  };

  const toggleSimAudio = async () => {
    if (isSimPlaying) {
      if (simMaskerGainRef.current) simMaskerGainRef.current.volume.rampTo(-Infinity, 0.05);
      if (simProbeGainRef.current) simProbeGainRef.current.volume.rampTo(-Infinity, 0.05);

      setTimeout(() => {
        simMaskerOscRef.current?.dispose();
        simProbeOscRef.current?.dispose();
        simMaskerGainRef.current?.dispose();
        simProbeGainRef.current?.dispose();
        setIsSimPlaying(false);
      }, 60);
    } else {
      await Tone.start();
      const masterGain = new Tone.Gain(0.4).toDestination();

      const maskerVol = new Tone.Volume(Tone.gainToDb(dbToGain(simMaskerLevel))).connect(masterGain);
      const probeVol = new Tone.Volume(Tone.gainToDb(dbToGain(simProbeLevel))).connect(masterGain);

      const maskerNode = createSignalNode(simMaskerType, simMaskerFreq);
      const probeNode = createSignalNode(simProbeType, simProbeFreq);

      maskerNode.connect(maskerVol);
      probeNode.connect(probeVol);

      if (maskerNode instanceof Tone.Oscillator || maskerNode instanceof Tone.Noise) maskerNode.start();
      if (probeNode instanceof Tone.Oscillator || probeNode instanceof Tone.Noise) probeNode.start();

      simMaskerOscRef.current = maskerNode;
      simProbeOscRef.current = probeNode;
      simMaskerGainRef.current = maskerVol;
      simProbeGainRef.current = probeVol;

      setIsSimPlaying(true);
    }
  };

  useEffect(() => {
    if (!isSimPlaying) return;

    if (simMaskerGainRef.current) {
      simMaskerGainRef.current.volume.setValueAtTime(Tone.gainToDb(dbToGain(simMaskerLevel)), Tone.now());
    }
    if (simProbeGainRef.current) {
      simProbeGainRef.current.volume.setValueAtTime(Tone.gainToDb(dbToGain(simProbeLevel)), Tone.now());
    }

    if (simMaskerOscRef.current && simMaskerOscRef.current instanceof Tone.Oscillator) {
      simMaskerOscRef.current.frequency.setValueAtTime(simMaskerFreq, Tone.now());
    }
    if (simProbeOscRef.current && simProbeOscRef.current instanceof Tone.Oscillator) {
      simProbeOscRef.current.frequency.setValueAtTime(simProbeFreq, Tone.now());
    }
  }, [simMaskerFreq, simMaskerLevel, simProbeFreq, simProbeLevel, isSimPlaying]);

  useEffect(() => {
    if (isSimPlaying) {
      toggleSimAudio().then(() => toggleSimAudio());
    }
  }, [simMaskerType, simProbeType]);

  // ------------------------------------------
  // LÓGICA DE AUDIO: NO SIMULTÁNEO
  // ------------------------------------------
  const playNonSimSequence = async () => {
    if (isNonSimPlaying) return;
    setIsNonSimPlaying(true);

    await Tone.start();
    const now = Tone.now() + 0.05;

    const maskerVol = new Tone.Volume(Tone.gainToDb(dbToGain(nonSimMaskerLevel))).toDestination();
    const probeVol = new Tone.Volume(Tone.gainToDb(dbToGain(nonSimProbeLevel))).toDestination();

    const maskerOsc = new Tone.Oscillator(nonSimMaskerFreq, "sine").connect(maskerVol);
    const probeOsc = new Tone.Oscillator(nonSimProbeFreq, "sine").connect(probeVol);

    const mDurSec = nonSimMaskerDuration / 1000;
    const pDurSec = nonSimProbeDuration / 1000;
    const delaySec = nonSimDelay / 1000;

    let maskerStartTime = now;
    let probeStartTime = now;

    if (nonSimMode === "post") {
      maskerStartTime = now;
      probeStartTime = now + mDurSec + delaySec;
    } else {
      probeStartTime = now;
      maskerStartTime = now + pDurSec + delaySec;
    }

    maskerOsc.start(maskerStartTime).stop(maskerStartTime + mDurSec);
    probeOsc.start(probeStartTime).stop(probeStartTime + pDurSec);

    const totalTimeMs = (Math.max(maskerStartTime + mDurSec, probeStartTime + pDurSec) - now) * 1000 + 100;

    setTimeout(() => {
      maskerOsc.dispose();
      probeOsc.dispose();
      maskerVol.dispose();
      probeVol.dispose();
      setIsNonSimPlaying(false);
    }, totalTimeMs);
  };

  useEffect(() => {
    return () => {
      simMaskerOscRef.current?.dispose();
      simProbeOscRef.current?.dispose();
      simMaskerGainRef.current?.dispose();
      simProbeGainRef.current?.dispose();
    };
  }, []);

  const handleTabChange = (tab: "simultaneous" | "non_simultaneous") => {
    if (isSimPlaying) toggleSimAudio();
    setActiveTab(tab);
  };

  // ------------------------------------------
  // CANVAS: ENMASCARAMIENTO SIMULTÁNEO
  // ------------------------------------------
  useEffect(() => {
    if (activeTab !== "simultaneous") return;
    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 25, right: 30, bottom: 40, left: 65 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const minFreq = 100;
    const maxFreq = 10000;
    const minDb = -10;
    const maxDb = 100;

    const freqToX = (f: number) => {
      const logMin = Math.log10(minFreq);
      const logMax = Math.log10(maxFreq);
      const logF = Math.log10(Math.max(minFreq, Math.min(maxFreq, f)));
      return padding.left + ((logF - logMin) / (logMax - logMin)) * graphWidth;
    };

    const levelToY = (lvl: number) => {
      const clampedLvl = Math.max(minDb, Math.min(maxDb, lvl));
      return padding.top + graphHeight - ((clampedLvl - minDb) / (maxDb - minDb)) * graphHeight;
    };

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
    ctx.lineWidth = 1;

    [0, 20, 40, 60, 80, 100].forEach((db) => {
      const y = levelToY(db);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${db} dB`, padding.left - 8, y + 3);
    });

    [100, 250, 500, 1000, 2000, 4000, 8000].forEach((f) => {
      const x = freqToX(f);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      const label = f >= 1000 ? `${f / 1000}k` : `${f}`;
      ctx.fillText(label, x, height - padding.bottom + 15);
    });

    // Curva Fletcher-Munson (0 phon)
    ctx.beginPath();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;

    for (let f = minFreq; f <= maxFreq; f += 20) {
      const fKhz = f / 1000;
      const fm0Phon = 3.64 * Math.pow(fKhz, -0.8) - 6.5 * Math.exp(-0.6 * Math.pow(fKhz - 3.3, 2)) + 0.001 * Math.pow(fKhz, 4);
      const x = freqToX(f);
      const y = levelToY(fm0Phon);
      if (f === minFreq) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    if (simMaskerLevel > 0) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(34, 211, 238, 0.15)";
      ctx.strokeStyle = "rgba(34, 211, 238, 0.7)";
      ctx.lineWidth = 2;

      ctx.moveTo(freqToX(minFreq), levelToY(0));

      for (let f = minFreq; f <= maxFreq; f += 25) {
        const x = freqToX(f);
        let maskVal = 0;
        if (f <= simMaskerFreq) {
          const deltaF = (simMaskerFreq - f) / simMaskerFreq;
          maskVal = Math.max(0, simMaskerLevel - deltaF * 60);
        } else {
          const deltaF = (f - simMaskerFreq) / simMaskerFreq;
          const slope = Math.max(10, 40 - simMaskerLevel * 0.25);
          maskVal = Math.max(0, simMaskerLevel - deltaF * slope);
        }
        ctx.lineTo(x, levelToY(maskVal));
      }

      ctx.lineTo(freqToX(maxFreq), levelToY(0));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    const mX = freqToX(simMaskerFreq);
    const mY = levelToY(simMaskerLevel);
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = simMaskerType === "complex" ? 5 : 3;
    ctx.beginPath();
    ctx.moveTo(mX, levelToY(0));
    ctx.lineTo(mX, mY);
    ctx.stroke();
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.arc(mX, mY, 5, 0, Math.PI * 2);
    ctx.fill();

    const pX = freqToX(simProbeFreq);
    const pY = levelToY(simProbeLevel);
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = simProbeType === "complex" ? 4 : 2.5;
    ctx.beginPath();
    ctx.moveTo(pX, levelToY(0));
    ctx.lineTo(pX, pY);
    ctx.stroke();
    ctx.fillStyle = "#c084fc";
    ctx.beginPath();
    ctx.arc(pX, pY, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }, [activeTab, simMaskerFreq, simMaskerLevel, simMaskerType, simProbeFreq, simProbeLevel, simProbeType]);

  // ------------------------------------------
  // CANVAS: ENMASCARAMIENTO NO SIMULTÁNEO (DR. FREIBERG)
  // ------------------------------------------
  useEffect(() => {
    if (activeTab !== "non_simultaneous") return;
    const canvas = nonSimCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 25, right: 30, bottom: 40, left: 65 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const maxTime = 400; // ms
    const timeToX = (t: number) => padding.left + (t / maxTime) * graphWidth;
    const levelToY = (lvl: number) => padding.top + graphHeight - (lvl / 100) * graphHeight;

    ctx.clearRect(0, 0, width, height);

    // Grilla
    ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
    ctx.lineWidth = 1;

    [0, 20, 40, 60, 80, 100].forEach((db) => {
      const y = levelToY(db);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${db} dB`, padding.left - 8, y + 3);
    });

    [0, 50, 100, 150, 200, 250, 300, 350, 400].forEach((t) => {
      const x = timeToX(t);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${t} ms`, x, height - padding.bottom + 15);
    });

    let mStart = 50;
    let pStart = 50;

    if (nonSimMode === "post") {
      pStart = mStart + nonSimMaskerDuration + nonSimDelay;
    } else {
      mStart = pStart + nonSimProbeDuration + nonSimDelay;
    }

    // Curva Teórica de Umbral de Enmascaramiento No Simultáneo (basado en Dr. Freiberg)
    ctx.beginPath();
    ctx.strokeStyle = "rgba(236, 72, 153, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);

    for (let t = 0; t <= maxTime; t += 1) {
      let thresh = 0;

      if (nonSimMode === "post") {
        const tAfterMasker = t - (mStart + nonSimMaskerDuration);
        if (t >= mStart && t <= mStart + nonSimMaskerDuration) {
          thresh = nonSimMaskerLevel;
        } else if (tAfterMasker > 0) {
          if (tAfterMasker <= 5) {
            // Hasta 5 ms de retraso: Mismo nivel que en eventos simultáneos
            thresh = nonSimMaskerLevel;
          } else if (tAfterMasker <= 200) {
            // A partir de 5 ms hasta 200 ms: Caída NO EXPONENCIAL altamente dependiente de la duración
            const dt = tAfterMasker - 5;
            const durFactor = Math.min(1.0, Math.max(0.25, nonSimMaskerDuration / 200));
            const effectiveDecayLimit = 195 * durFactor;

            if (dt <= effectiveDecayLimit) {
              const norm = dt / effectiveDecayLimit;
              // Modelo de caída suave no exponencial (curva cuadrática/potencial)
              thresh = nonSimMaskerLevel * Math.pow(1 - norm, 1.6);
            } else {
              thresh = 0;
            }
          }
        }
      } else {
        // Pre-enmascaramiento
        const tBeforeMasker = mStart - t;
        if (t >= mStart && t <= mStart + nonSimMaskerDuration) {
          thresh = nonSimMaskerLevel;
        } else if (tBeforeMasker > 0 && tBeforeMasker <= 20) {
          // Ocurre dentro de los 20 ms.
          // El nivel del enmascarador NO influye sobre el umbral del sonido enmascarado (Umbral fijo ~35 dB)
          const norm = tBeforeMasker / 20;
          const fixedPreThreshold = 35;
          thresh = fixedPreThreshold * (1 - norm);
        }
      }

      const x = timeToX(t);
      const y = levelToY(thresh);
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Impulso Enmascarador (Cyan)
    const mX = timeToX(mStart);
    const mW = (nonSimMaskerDuration / maxTime) * graphWidth;
    const mY = levelToY(nonSimMaskerLevel);
    ctx.fillStyle = "rgba(34, 211, 238, 0.3)";
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.fillRect(mX, mY, mW, height - padding.bottom - mY);
    ctx.strokeRect(mX, mY, mW, height - padding.bottom - mY);

    // Impulso Tono de Prueba / Probe (Púrpura)
    const pX = timeToX(pStart);
    const pW = Math.max(3, (nonSimProbeDuration / maxTime) * graphWidth);
    const pY = levelToY(nonSimProbeLevel);
    ctx.fillStyle = "rgba(168, 85, 247, 0.6)";
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 2;
    ctx.fillRect(pX, pY, pW, height - padding.bottom - pY);
    ctx.strokeRect(pX, pY, pW, height - padding.bottom - pY);
  }, [activeTab, nonSimMode, nonSimMaskerLevel, nonSimMaskerDuration, nonSimProbeLevel, nonSimDelay]);

  return (
    <div className="space-y-6">
      {/* Selector de Pestañas Principal */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => handleTabChange("simultaneous")}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === "simultaneous"
              ? "border-cyan-400 text-cyan-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Waves className="w-4 h-4" />
          <span>Enmascaramiento Simultáneo</span>
        </button>

        <button
          onClick={() => handleTabChange("non_simultaneous")}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === "non_simultaneous"
              ? "border-pink-400 text-pink-400 bg-slate-900/50"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Enmascaramiento No Simultáneo</span>
        </button>
      </div>

      {/* SECCIÓN 1: ENMASCARAMIENTO SIMULTÁNEO */}
      {activeTab === "simultaneous" && (
        <div className="space-y-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6">
              <button
                onClick={toggleSimAudio}
                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg ${
                  isSimPlaying
                    ? "bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30"
                    : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
                }`}
              >
                {isSimPlaying ? (
                  <>
                    <Square className="w-5 h-5 fill-current" />
                    <span>Detener Señales</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Iniciar Audio</span>
                  </>
                )}
              </button>

              <div className="w-full sm:w-auto flex-1 p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ajustá la frecuencia e intensidad del <strong>Enmascarador</strong> y de la <strong>Señal Enmascarada</strong> para percibir cómo la curva de excitación oculta el tono secundario.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Espectro Frecuencial vs Amplitud</span>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-slate-400 border-b border-dashed inline-block" /> Fletcher-Munson (0 phon)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" /> Enmascarador
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-purple-400 inline-block" /> Señal Enmascarada
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 shadow-inner overflow-hidden">
                <canvas ref={simCanvasRef} width={900} height={320} className="w-full h-auto block rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-cyan-400 text-sm uppercase tracking-wider">Enmascarador (Masker)</h3>
                  </div>
                  <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                    {simMaskerLevel} dB SPL
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Tipo de Señal</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["sine", "complex", "noise"] as SignalType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSimMaskerType(type)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          simMaskerType === type
                            ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {type === "sine" ? "Senoidal" : type === "complex" ? "Complejo" : "Ruido"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Frecuencia Central</span>
                      <span className="font-mono text-cyan-400">{simMaskerFreq} Hz</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="5000"
                      step="10"
                      value={simMaskerFreq}
                      onChange={(e) => setSimMaskerFreq(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Nivel de Amplitud</span>
                      <span className="font-mono text-cyan-400">{simMaskerLevel} dB</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="95"
                      step="1"
                      value={simMaskerLevel}
                      onChange={(e) => setSimMaskerLevel(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-purple-500/30 rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <h3 className="font-bold text-purple-400 text-sm uppercase tracking-wider">Señal Enmascarada (Probe)</h3>
                  </div>
                  <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                    {simProbeLevel} dB SPL
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Tipo de Señal</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["sine", "complex", "noise"] as SignalType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSimProbeType(type)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          simProbeType === type
                            ? "bg-purple-500/20 border-purple-500 text-purple-300"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {type === "sine" ? "Senoidal" : type === "complex" ? "Complejo" : "Ruido"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Frecuencia Central</span>
                      <span className="font-mono text-purple-400">{simProbeFreq} Hz</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="5000"
                      step="10"
                      value={simProbeFreq}
                      onChange={(e) => setSimProbeFreq(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Nivel de Amplitud</span>
                      <span className="font-mono text-purple-400">{simProbeLevel} dB</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="95"
                      step="1"
                      value={simProbeLevel}
                      onChange={(e) => setSimProbeLevel(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" /> Fundamentos del Enmascaramiento Simultáneo
            </h3>
            <p>
              Ocurre cuando la señal enmascaradora y el tono de prueba coinciden en el tiempo. El estímulo más intenso genera un patrón de excitación en la membrana basilar que incrementa el umbral de audibilidad para frecuencias contiguas.
            </p>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: ENMASCARAMIENTO NO SIMULTÁNEO */}
      {activeTab === "non_simultaneous" && (
        <div className="space-y-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-pink-400" />
                <div>
                  <h2 className="text-base font-bold text-white">Modalidad de Enmascaramiento No Simultáneo</h2>
                  <p className="text-xs text-slate-400">
                    El sonido enmascarado siempre es un impulso (ráfaga muy corta).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setNonSimMode("post")}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    nonSimMode === "post"
                      ? "bg-pink-500/20 border-pink-500 text-pink-300 shadow-lg shadow-pink-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  Post-enmascaramiento
                </button>
                <button
                  onClick={() => setNonSimMode("pre")}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    nonSimMode === "pre"
                      ? "bg-pink-500/20 border-pink-500 text-pink-300 shadow-lg shadow-pink-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  Pre-enmascaramiento
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <button
                  onClick={playNonSimSequence}
                  disabled={isNonSimPlaying}
                  className={`px-8 py-3.5 rounded-xl font-bold flex items-center gap-3 transition-all ${
                    isNonSimPlaying
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-pink-500 hover:bg-pink-400 text-slate-950 shadow-lg shadow-pink-500/20"
                  }`}
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span>{isNonSimPlaying ? "Reproduciendo..." : "Emitir Estímulo Secuencial"}</span>
                </button>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-cyan-400 inline-block" /> Enmascarador ({nonSimMaskerDuration}ms)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-purple-400 inline-block" /> Impulso Probe ({nonSimProbeDuration}ms)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-pink-400 border-b border-dashed inline-block" /> Umbral Teórico ($t_d$)
                  </span>
                </div>
              </div>

              <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 shadow-inner overflow-hidden">
                <canvas ref={nonSimCanvasRef} width={900} height={280} className="w-full h-auto block rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-cyan-400 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
                  Enmascarador (Masker)
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Duración del Enmascarador</span>
                      <span className="font-mono text-cyan-400">{nonSimMaskerDuration} ms</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="500"
                      step="5"
                      value={nonSimMaskerDuration}
                      onChange={(e) => setNonSimMaskerDuration(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Nivel de Amplitud</span>
                      <span className="font-mono text-cyan-400">{nonSimMaskerLevel} dB SPL</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="95"
                      step="1"
                      value={nonSimMaskerLevel}
                      onChange={(e) => setNonSimMaskerLevel(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-purple-500/30 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-purple-400 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
                  Tono de Prueba (Impulso) & Retardo ($t_d$)
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Tiempo de Retardo ($t_d$)</span>
                      <span className="font-mono text-pink-400">{nonSimDelay} ms</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="150"
                      step="1"
                      value={nonSimDelay}
                      onChange={(e) => setNonSimDelay(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-400"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Nivel del Impulso Probe</span>
                      <span className="font-mono text-purple-400">{nonSimProbeLevel} dB SPL</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="1"
                      value={nonSimProbeLevel}
                      onChange={(e) => setNonSimProbeLevel(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teoría y Conclusiones del Dr. Pablo M. Freiberg */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-pink-400" /> Enmascaramiento No Simultáneo — Dr. Pablo M. Freiberg
            </h3>
            <p className="text-slate-400 text-xs">
              En el enmascaramiento no simultáneo, la referencia (tono de prueba) precede o sucede al enmascarador, y el sonido enmascarado se presenta en forma de impulso.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-pink-300">Pre-enmascaramiento</h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                  <li>La referencia precede al enmascarador. Un sonido que aún no existe enmascara a uno ya presente.</li>
                  <li>Ocurre dentro de una ventana temporal muy acotada de <strong>20 ms</strong>.</li>
                  <li><strong>El nivel del tono enmascarador NO influye sobre el umbral del sonido enmascarado</strong>.</li>
                  <li>Se conjetura que transiciones discretas y repentinas no son detectadas porque los cambios físicos suelen ser continuos, aunque sus bases biológicas son inciertas.</li>
                </ul>
              </div>

              <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <h4 className="font-bold text-pink-300">Post-enmascaramiento</h4>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                  <li>La referencia sucede al enmascarador o subsiste luego de su extinción.</li>
                  <li><strong>Hasta 5 ms de retraso</strong>, el tono de prueba exhibe el mismo nivel de enmascaramiento que en eventos simultáneos.</li>
                  <li>A partir de los 5 ms, el umbral disminuye hasta alcanzar el umbral en silencio hacia los <strong>200 ms</strong>.</li>
                  <li><strong>La curva NO es de tipo exponencial</strong>.</li>
                  <li>Depende en gran medida de la duración del enmascarador, demostrando ser un <strong>efecto altamente no lineal</strong>.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}