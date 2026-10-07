"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { GREY_INSTRUMENTS, Instrument3D } from "@/lib/greyData";
import { Volume2, Sparkles, Box, RotateCcw } from "lucide-react";

interface TimbreSpace3DProps {
  cursorPos: { x: number; y: number; z: number };
  setCursorPos: (pos: { x: number; y: number; z: number }) => void;
}

export default function TimbreSpace3D({ cursorPos, setCursorPos }: TimbreSpace3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState<{ rx: number; ry: number }>({ rx: 0.4, ry: 0.6 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);
  const [hoveredInst, setHoveredInst] = useState<Instrument3D | null>(null);

  const [selectedInst, setSelectedInst] = useState<Instrument3D | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Síntesis tímbrica basada en el espacio 3D de John Grey (Freiberg)
  const playTimbreAudio = useCallback(
    (x: number, y: number, z: number, instConfig?: Instrument3D) => {
      if (isPlaying) return;
      setIsPlaying(true);

      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;
      const duration = 1.2;

      const attackSpeed = Math.max(0, (x + 1) / 2); // Eje X: Ataque / Flujo espectral
      const brightness = Math.max(0, (1 - y) / 2);  // Eje Y: Brillo / Centroide espectral
      const noiseLevel = instConfig ? instConfig.attackNoise : Math.max(0, (z + 1) / 2); // Eje Z: Transitorios de ataque

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.2, now);
      master.connect(ctx.destination);

      // 1. Ruido de transitorio de ataque (Eje Z - Soplo de flauta / lengüeta de oboe)
      if (noiseLevel > 0.05) {
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        const noiseFilter = ctx.createBiquadFilter();
        const noiseGain = ctx.createGain();

        noise.buffer = buffer;
        noiseFilter.type = "highpass";
        noiseFilter.frequency.setValueAtTime(2000, now);

        noiseGain.gain.setValueAtTime(noiseLevel * 0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(master);

        noise.start(now);
      }

      // 2. Osciladores para la fundamental y armónicos
      const fundamentalFreq = 261.63; // Do4

      if (instConfig?.harmonicDelay) {
        // Oboe: 2º armónico entra primero, 3º y 4º después, fundamental 8ms más tarde
        const harmonics = [
          { mult: 2, delay: 0.0, gain: 0.25 },
          { mult: 3, delay: 0.005, gain: 0.2 },
          { mult: 4, delay: 0.005, gain: 0.15 },
          { mult: 1, delay: 0.008, gain: 0.3 },
        ];

        harmonics.forEach((h) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(fundamentalFreq * h.mult, now + h.delay);

          gain.gain.setValueAtTime(0, now + h.delay);
          gain.gain.linearRampToValueAtTime(h.gain, now + h.delay + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

          osc.connect(gain);
          gain.connect(master);

          osc.start(now + h.delay);
          osc.stop(now + duration);
        });
      } else {
        const oscFund = ctx.createOscillator();
        const oscHarm = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        oscFund.type = "triangle";
        oscHarm.type = "sawtooth";

        oscFund.frequency.setValueAtTime(fundamentalFreq, now);
        oscHarm.frequency.setValueAtTime(fundamentalFreq, now);

        const cutoff = 250 + Math.pow(brightness, 2) * 6000;
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(cutoff, now);

        const attackTime = Math.max(0.005, (1 - attackSpeed) * 0.15);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + attackTime);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        oscFund.connect(filter);
        oscHarm.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        oscFund.start(now);
        oscHarm.start(now);
        oscFund.stop(now + duration);
        oscHarm.stop(now + duration);
      }

      setTimeout(() => {
        setIsPlaying(false);
        ctx.close();
      }, duration * 1000 + 100);
    },
    [isPlaying]
  );

  // Proyección de coordenadas 3D a Canvas 2D
  const project3D = useCallback(
    (x: number, y: number, z: number, width: number, height: number) => {
      const cosY = Math.cos(rotation.ry);
      const sinY = Math.sin(rotation.ry);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosX = Math.cos(rotation.rx);
      const sinX = Math.sin(rotation.rx);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const scale = 170 / (3.5 + z2);
      const px = width / 2 + x1 * scale;
      const py = height / 2 - y2 * scale;

      return { px, py, scale };
    },
    [rotation]
  );

  // Renderizado gráfico en Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, width, height);

    // Vértices del cubo [-1, 1]
    const vertices: [number, number, number][] = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1],
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const projectedVertices = vertices.map((v) => project3D(v[0], v[1], v[2], width, height));

    // Aristas del cubo
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    edges.forEach(([i, j]) => {
      ctx.moveTo(projectedVertices[i].px, projectedVertices[i].py);
      ctx.lineTo(projectedVertices[j].px, projectedVertices[j].py);
    });
    ctx.stroke();

    // Ejes coordenados principales
    const origin = project3D(0, 0, 0, width, height);
    const axisX = project3D(1.2, 0, 0, width, height);
    const axisY = project3D(0, 1.2, 0, width, height);
    const axisZ = project3D(0, 0, 1.2, width, height);

    ctx.strokeStyle = "#f59e0b"; // Eje X (Ataque)
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(axisX.px, axisX.py);
    ctx.stroke();

    ctx.strokeStyle = "#38bdf8"; // Eje Y (Brillo)
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(axisY.px, axisY.py);
    ctx.stroke();

    ctx.strokeStyle = "#10b981"; // Eje Z (Transitorios)
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(axisZ.px, axisZ.py);
    ctx.stroke();

    // Etiquetas de los ejes
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = "#f59e0b";
    ctx.fillText("+X (Ataque)", axisX.px + 4, axisX.py + 4);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("+Y (Brillo)", axisY.px + 4, axisY.py - 4);
    ctx.fillStyle = "#10b981";
    ctx.fillText("+Z (Transitorios)", axisZ.px + 4, axisZ.py + 4);

    // Dibujar los instrumentos dentro del cubo 3D
    GREY_INSTRUMENTS.forEach((inst) => {
      const p = project3D(inst.position[0], inst.position[1], inst.position[2], width, height);
      const isSel = selectedInst?.id === inst.id;
      const isHov = hoveredInst?.id === inst.id;

      ctx.beginPath();
      ctx.arc(p.px, p.py, isSel ? 10 : isHov ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = isSel ? "#f59e0b" : isHov ? "#fbbf24" : "#e2e8f0";
      ctx.fill();
      ctx.strokeStyle = isSel || isHov ? "#ffffff" : "#64748b";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "bold 11px monospace";
      ctx.fillStyle = isSel ? "#fbbf24" : isHov ? "#ffffff" : "#94a3b8";
      ctx.fillText(inst.code, p.px + 12, p.py + 4);
    });

    // Punto activo indicado por los sliders
    const currP = project3D(cursorPos.x, cursorPos.y, cursorPos.z, width, height);
    ctx.beginPath();
    ctx.arc(currP.px, currP.py, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#f59e0b";
    ctx.shadowColor = "#f59e0b";
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [rotation, cursorPos, selectedInst, hoveredInst, project3D]);

  // Manejadores Pointer Events para interacción unificada Mouse/Touch
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragDistance(0);

    // Capturar puntero para seguimiento fluido en pantallas táctiles
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setDragDistance((prev) => prev + Math.abs(dx) + Math.abs(dy));

      setRotation((prev) => ({
        rx: Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev.rx + dy * 0.01)),
        ry: prev.ry + dx * 0.01,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      // Detección de Hover sobre los círculos de los instrumentos
      let foundHov: Instrument3D | null = null;
      GREY_INSTRUMENTS.forEach((inst) => {
        const p = project3D(inst.position[0], inst.position[1], inst.position[2], canvas.width, canvas.height);
        const dist = Math.hypot(mouseX - p.px, mouseY - p.py);
        if (dist <= 18) {
          foundHov = inst;
        }
      });
      setHoveredInst(foundHov);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    if (e.currentTarget.releasePointerCapture) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // Detección de Selección al hacer Clic o Toque directo sobre el Canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragDistance > 6) return; // Si arrastró más de 6px, fue rotación del cubo

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    let clickedInst: Instrument3D | null = null;
    let minDistance = Infinity;

    GREY_INSTRUMENTS.forEach((inst) => {
      const p = project3D(inst.position[0], inst.position[1], inst.position[2], canvas.width, canvas.height);
      const dist = Math.hypot(clickX - p.px, clickY - p.py);
      if (dist <= 22 && dist < minDistance) {
        minDistance = dist;
        clickedInst = inst;
      }
    });

    if (clickedInst) {
      setSelectedInst(clickedInst);
      setCursorPos({
        x: clickedInst.position[0],
        y: clickedInst.position[1],
        z: clickedInst.position[2],
      });
      playTimbreAudio(
        clickedInst.position[0],
        clickedInst.position[1],
        clickedInst.position[2],
        clickedInst
      );
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-slate-100 text-sm">
            Espacio Multidimensional del Timbre (John Grey 1975/1977)
          </h3>
        </div>
        <button
          onClick={() => setRotation({ rx: 0.4, ry: 0.6 })}
          className="p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-amber-400 transition-colors"
          title="Resetear vista 3D"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Cuadro Visual 3D Interactivo adaptado para Touch/Mouse */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex justify-center items-center">
        <canvas
          ref={canvasRef}
          width={460}
          height={320}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onClick={handleCanvasClick}
          className={`w-full h-auto max-w-[460px] touch-none ${
            hoveredInst ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
          }`}
        />
        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-none">
          {hoveredInst ? `Tocá/hacé clic para seleccionar: ${hoveredInst.name}` : "Deslizá para rotar o tocá los puntos"}
        </div>
      </div>

      {/* Selector de Instrumentos de Referencia */}
      <div className="flex flex-wrap gap-2">
        {GREY_INSTRUMENTS.map((inst) => (
          <button
            key={inst.id}
            onClick={() => {
              setSelectedInst(inst);
              setCursorPos({
                x: inst.position[0],
                y: inst.position[1],
                z: inst.position[2],
              });
              playTimbreAudio(inst.position[0], inst.position[1], inst.position[2], inst);
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${
              selectedInst?.id === inst.id
                ? "bg-amber-500 text-slate-950 font-bold border-amber-400"
                : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white"
            }`}
          >
            {inst.name}
          </button>
        ))}
      </div>

      {/* Sliders de Coordenadas del Espacio 3D */}
      <div className="space-y-3 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Eje Y: Centroide Espectral / Brillo</span>
            <span className="text-amber-400 font-bold">{cursorPos.y.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={cursorPos.y}
            onChange={(e) => setCursorPos({ ...cursorPos, y: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-slate-900 h-2 rounded cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Eje X: Patrón de Ataque / Flujo Espectral</span>
            <span className="text-amber-400 font-bold">{cursorPos.x.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={cursorPos.x}
            onChange={(e) => setCursorPos({ ...cursorPos, x: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-slate-900 h-2 rounded cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Eje Z: Transitorios de Ataque (Ruido de Soplo/Caña)</span>
            <span className="text-amber-400 font-bold">{cursorPos.z.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={cursorPos.z}
            onChange={(e) => setCursorPos({ ...cursorPos, z: Number(e.target.value) })}
            className="w-full accent-amber-400 bg-slate-900 h-2 rounded cursor-pointer"
          />
        </div>
      </div>

      <button
        onClick={() => playTimbreAudio(cursorPos.x, cursorPos.y, cursorPos.z)}
        disabled={isPlaying}
        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Volume2 className="w-4 h-4" />
        {isPlaying ? "Sintetizando Timbre 3D..." : "Sintetizar Punto Actual del Espacio 3D"}
      </button>

      {/* Nota Explicativa */}
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-200/80">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Ajuste según Freiberg:</strong> La Flauta requiere un alto componente de ruido de soplo en el ataque (Eje Z &gt; 0.7), mientras que el Oboe presenta una entrada asincrónica donde el segundo armónico antecede a la fundamental.
        </p>
      </div>
    </div>
  );
}