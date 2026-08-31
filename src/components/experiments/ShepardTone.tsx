"use client";

import { useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { Play, Pause, ArrowUp, ArrowDown, Volume2, Info } from "lucide-react";
import { initAudioContext } from "@/lib/audio/context";

export default function ShepardTone() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(-12); // dB

  const synthsRef = useRef<Tone.Synth[]>([]);
  const gainNodeRef = useRef<Tone.Volume | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const baseFreqRef = useRef(110); // Hz base (A2)

  // Configuración de octavas (6 capas superpuestas)
  const numOctaves = 6;

  useEffect(() => {
    // Inicializar nodos de audio
    const volumeNode = new Tone.Volume(volume).toDestination();
    gainNodeRef.current = volumeNode;

    const synths: Tone.Synth[] = [];
    for (let i = 0; i < numOctaves; i++) {
      const synth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.1, decay: 0, sustain: 1, release: 0.1 },
      }).connect(volumeNode);
      synths.push(synth);
    }
    synthsRef.current = synths;

    return () => {
      synths.forEach((s) => s.dispose());
      volumeNode.dispose();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Actualizar volumen dinámicamente
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.volume.value = volume;
    }
  }, [volume]);

  // Bucle de animación para barrido de frecuencia continuo
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const factor = direction === "up" ? 1 + 0.15 * speed * deltaTime : 1 - 0.15 * speed * deltaTime;
      baseFreqRef.current *= factor;

      // Mantener frecuencia base dentro de un rango de 1 octava (110Hz a 220Hz)
      if (baseFreqRef.current > 220) baseFreqRef.current /= 2;
      if (baseFreqRef.current < 110) baseFreqRef.current *= 2;

      // Calcular la frecuencia y volumen (envolvente gaussiana) de cada oscilador
      synthsRef.current.forEach((synth, index) => {
        const freq = baseFreqRef.current * Math.pow(2, index - 2);
        
        // Calibrar amplitud de los extremos (los tonos muy agudos y muy graves se atenúan)
        const logFreq = Math.log2(freq / 110);
        const norm = (logFreq + 2) / numOctaves; // 0 a 1
        const amplitude = Math.sin(Math.PI * Math.max(0, Math.min(1, norm)));

        synth.volume.value = Tone.gainToDb(amplitude * 0.3);
        synth.setNote(freq);
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, direction, speed]);

  const togglePlay = async () => {
    if (!isPlaying) {
      await initAudioContext();
      synthsRef.current.forEach((s) => s.triggerAttack(baseFreqRef.current));
      setIsPlaying(true);
    } else {
      synthsRef.current.forEach((s) => s.triggerRelease());
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-6 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30"
            }`}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
          <div>
            <h4 className="font-bold text-white text-lg">
              {isPlaying ? "Generando Ilusión..." : "Listo para reproducir"}
            </h4>
            <p className="text-xs text-slate-400">
              {isPlaying ? "Escuchá con atención: ¿el sonido sube o baja infinitamente?" : "Hacé clic en Play para iniciar el sintetizador"}
            </p>
          </div>
        </div>

        {/* Direction Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setDirection("up")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              direction === "up" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" /> Ascendente
          </button>
          <button
            onClick={() => setDirection("down")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              direction === "down" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" /> Descendente
          </button>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        {/* Speed Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Velocidad de Barrido</span>
            <span className="text-cyan-400 font-mono">{speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
          />
        </div>

        {/* Volume Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5" /> Volumen General
            </span>
            <span className="text-cyan-400 font-mono">{volume} dB</span>
          </div>
          <input
            type="range"
            min="-30"
            max="0"
            step="1"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
          />
        </div>
      </div>

      {/* Interactive Explanation Box */}
      <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-4 flex items-start gap-3 text-xs text-cyan-200/80">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>¿Qué está pasando?</strong> Estamos reproduciendo 6 tonos simultáneos separados por una octava cada uno. A medida que suben de tono, los tonos agudos desaparecen suavemente y nacen nuevos tonos graves en la base. Tu cerebro une las frecuencias continuas y percibe una subida infinita.
        </p>
      </div>
    </div>
  );
}