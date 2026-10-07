"use client";

import { useState, useRef, useCallback } from "react";
import { calculateDuras, calculateEquivalentPauseMs } from "@/lib/greyData";
import { Play, Clock, Sparkles, Volume2, Music, Activity } from "lucide-react";

type SoundType = "3200Hz" | "200Hz" | "noise";

export default function SubjectiveDuration() {
  const [physicalTimeMs, setPhysicalTimeMs] = useState<number>(100);
  const [soundType, setSoundType] = useState<SoundType>("3200Hz");
  const [isPlayingExp1, setIsPlayingExp1] = useState(false);
  const [isPlayingExp2, setIsPlayingExp2] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const durasValue = calculateDuras(physicalTimeMs);
  const equivalentPauseMs = calculateEquivalentPauseMs(physicalTimeMs, soundType);

  const stopPreviousAudio = useCallback(async () => {
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      try {
        await audioCtxRef.current.close();
      } catch (e) {
        console.error("Error al cerrar AudioContext previo", e);
      }
    }
  }, []);

  const createSoundSource = (ctx: AudioContext, type: SoundType) => {
    if (type === "noise") {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      return noise;
    } else {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(type === "3200Hz" ? 3200 : 200, ctx.currentTime);
      return osc;
    }
  };

  const playPulseVsPauseExperiment = useCallback(async () => {
    if (isPlayingExp1) return;
    await stopPreviousAudio();

    setIsPlayingExp1(true);

    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const now = ctx.currentTime;
    const tiSec = physicalTimeMs / 1000;
    const tpSec = equivalentPauseMs / 1000;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.2, now);
    master.connect(ctx.destination);

    const src1 = createSoundSource(ctx, soundType);
    const g1 = ctx.createGain();
    src1.connect(g1);
    g1.connect(master);
    g1.gain.setValueAtTime(0.3, now);
    g1.gain.setValueAtTime(0, now + tiSec);
    src1.start(now);
    src1.stop(now + tiSec);

    const t1Start = now + tiSec + 1.0;
    const src2 = createSoundSource(ctx, soundType);
    const g2 = ctx.createGain();
    src2.connect(g2);
    g2.connect(master);
    g2.gain.setValueAtTime(0.3, t1Start);
    g2.gain.setValueAtTime(0, t1Start + 0.8);
    src2.start(t1Start);
    src2.stop(t1Start + 0.8);

    const t2Start = t1Start + 0.8 + tpSec;
    const src3 = createSoundSource(ctx, soundType);
    const g3 = ctx.createGain();
    src3.connect(g3);
    g3.connect(master);
    g3.gain.setValueAtTime(0.3, t2Start);
    g3.gain.setValueAtTime(0, t2Start + 0.8);
    src3.start(t2Start);
    src3.stop(t2Start + 0.8);

    const totalDuration = t2Start + 0.8 + 0.4;
    setTimeout(() => {
      setIsPlayingExp1(false);
      ctx.close();
    }, totalDuration * 1000);
  }, [physicalTimeMs, equivalentPauseMs, soundType, isPlayingExp1, stopPreviousAudio]);

  const playMusicalExecutionExperiment = useCallback(async () => {
    if (isPlayingExp2) return;
    await stopPreviousAudio();

    setIsPlayingExp2(true);

    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.2, now);
    master.connect(ctx.destination);

    const freqs = [261.63, 329.63, 392.0, 523.25];
    let offset = 0;

    freqs.forEach((freq) => {
      const startTime = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(master);

      osc.start(startTime);
      osc.stop(startTime + 0.38);

      offset += 0.48;
    });

    setTimeout(() => {
      setIsPlayingExp2(false);
      ctx.close();
    }, offset * 1000 + 300);
  }, [isPlayingExp2, stopPreviousAudio]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-8 shadow-2xl text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-base">
              Psicoacústica de la Duración Subjetiva (Dr. Pablo M. Freiberg)
            </h2>
            <p className="text-xs text-slate-400">
              Medición en unidades <strong>dura</strong>, relación impulso/pausa y decaimiento L<sub>E</sub>.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4" /> 1. Cuantificación (&quot;Dura&quot;) y Umbral de 100 ms
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>1 dura</strong> = Sensación correspondiente a 1 s para un tono de 1 kHz a 60 dB.
          Para impulsos menores a 100 ms, la duración subjetiva decrece mucho más lento que el tiempo físico.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-1">
              DURACIÓN FÍSICA (T<sub>i</sub>)
            </span>
            <div className="text-2xl font-mono font-bold text-slate-200">
              {physicalTimeMs} <span className="text-xs text-slate-500">ms</span>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono text-amber-400 block mb-1">
              DURACIÓN SUBJETIVA (D)
            </span>
            <div className="text-2xl font-mono font-bold text-amber-400">
              {durasValue.toFixed(3)} <span className="text-xs text-slate-400">dura</span>
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block mb-1">COMPORTAMIENTO</span>
            <div className="text-xs font-mono mt-1">
              {physicalTimeMs < 100 ? (
                <span className="text-amber-300 bg-amber-500/20 px-2 py-1 rounded border border-amber-500/30 inline-block">
                  Desviación (&lt; 100 ms)
                </span>
              ) : (
                <span className="text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/30 inline-block">
                  Proporcional Lineal
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">
              Ajustar Duración Física del Impulso (T<sub>i</sub>)
            </span>
            <span className="text-amber-400 font-bold">{physicalTimeMs} ms</span>
          </div>
          <input
            type="range"
            min="10"
            max="1200"
            step="10"
            value={physicalTimeMs}
            onChange={(e) => setPhysicalTimeMs(Number(e.target.value))}
            className="w-full accent-amber-400 bg-slate-900 h-2 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Volume2 className="w-4 h-4" /> 2. Asimetría Impulso vs. Pausa (Efecto de Frecuencia)
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Un sonido corto se percibe significativamente <strong>más largo</strong> que una pausa de igual duración.
          A 3200 Hz, un impulso de 100 ms se equipara perceptualmente con una pausa de 400 ms (Relación 1:4).
        </p>

        <div className="flex gap-2">
          {(["3200Hz", "200Hz", "noise"] as SoundType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSoundType(type)}
              className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${
                soundType === type
                  ? "bg-amber-500 text-slate-950 font-bold border-amber-400"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {type === "3200Hz" && "Tono 3.2 kHz (Factor 4)"}
              {type === "200Hz" && "Tono 200 Hz (Factor 2)"}
              {type === "noise" && "Ruido Blanco (Factor 2)"}
            </button>
          ))}
        </div>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">
              PAUSA EQUIVALENTE CALCULADA (T<sub>p</sub>)
            </span>
            <div className="text-xl font-mono text-amber-300 font-bold">
              {equivalentPauseMs} ms{" "}
              <span className="text-xs font-normal text-slate-500">
                (Relación 1:{(equivalentPauseMs / Math.max(1, physicalTimeMs)).toFixed(1)})
              </span>
            </div>
          </div>

          <button
            onClick={playPulseVsPauseExperiment}
            disabled={isPlayingExp1}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            {isPlayingExp1 ? "Reproduciendo Secuencia..." : "Escuchar Secuencia Freiberg"}
          </button>
        </div>
      </div>

      <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Music className="w-4 h-4" /> 3. Compensación en la Ejecución Musical
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Para que el oyente perciba las notas con la duración escrita en la partitura, el músico debe
          tocar físicamente <strong>menos tiempo</strong> (por ejemplo, 100 ms de sonido + 380 ms de silencio), debido a la curva de excitación auditiva (L<sub>E</sub>).
        </p>

        <button
          onClick={playMusicalExecutionExperiment}
          disabled={isPlayingExp2}
          className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-xs font-bold border border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          {isPlayingExp2 ? "Ejecutando Partitura Allegretto..." : "Reproducir Demostración de Partitura Musical"}
        </button>
      </div>

      <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-200/80">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Fundamento de Freiberg:</strong> El post-enmascaramiento provoca que el nivel de excitación auditiva (L<sub>E</sub>) permanezca activo hasta 200 ms después de finalizado el sonido físico, haciendo que los pulsos breves parezcan extenderse en el tiempo.
        </p>
      </div>
    </div>
  );
}