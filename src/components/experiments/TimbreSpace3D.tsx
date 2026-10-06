"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { GREY_INSTRUMENTS, InstrumentNode } from "@/lib/greyData";
import { Move3d, RotateCw, Volume2 } from "lucide-react";

interface TimbreSpace3DProps {
  onSelectInstrument: (inst: InstrumentNode) => void;
  selectedInst: InstrumentNode | null;
  cursorPos: { x: number; y: number; z: number };
  setCursorPos: (pos: { x: number; y: number; z: number }) => void;
}

export default function TimbreSpace3D({
  onSelectInstrument,
  selectedInst,
  cursorPos,
  setCursorPos,
}: TimbreSpace3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angleX, setAngleX] = useState(-0.4);
  const [angleY, setAngleY] = useState(0.6);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Proyección 3D a 2D
  const project = useCallback(
    (x: number, y: number, z: number, width: number, height: number) => {
      // Rotación en Y
      const x1 = x * Math.cos(angleY) + z * Math.sin(angleY);
      const z1 = -x * Math.sin(angleY) + z * Math.cos(angleY);

      // Rotación en X
      const y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
      const z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);

      const scale = 140 / (z2 + 3.5);
      const px = width / 2 + x1 * scale * 1.8;
      const py = height / 2 - y2 * scale * 1.8;

      return { px, py, scale };
    },
    [angleX, angleY]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Fondo del cubo
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, width, height);

    // Dibujar aristas del cubo 3D (-1 a 1)
    const corners = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1],
    ];

    const projectedCorners = corners.map(([cx, cy, cz]) =>
      project(cx, cy, cz, width, height)
    );

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.5;
    edges.forEach(([p1, p2]) => {
      ctx.beginPath();
      ctx.moveTo(projectedCorners[p1].px, projectedCorners[p1].py);
      ctx.lineTo(projectedCorners[p2].px, projectedCorners[p2].py);
      ctx.stroke();
    });

    // Dibujar ejes principales
    const origin = project(0, 0, 0, width, height);
    const xAxis = project(1.2, 0, 0, width, height);
    const yAxis = project(0, 1.2, 0, width, height);
    const zAxis = project(0, 0, 1.2, width, height);

    // Eje I (Brillo - Y)
    ctx.strokeStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(yAxis.px, yAxis.py);
    ctx.stroke();

    // Eje II (Ataque - X)
    ctx.strokeStyle = "#f43f5e";
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(xAxis.px, xAxis.py);
    ctx.stroke();

    // Eje III (Fluctuación - Z)
    ctx.strokeStyle = "#a855f7";
    ctx.beginPath();
    ctx.moveTo(origin.px, origin.py);
    ctx.lineTo(zAxis.px, zAxis.py);
    ctx.stroke();

    // Dibujar Nodos de Instrumentos de Grey (1977)
    GREY_INSTRUMENTS.forEach((inst) => {
      const { px, py } = project(inst.x, inst.y, inst.z, width, height);
      const isSelected = selectedInst?.id === inst.id;

      // Sombra proyectada
      const ground = project(inst.x, -1, inst.z, width, height);
      ctx.strokeStyle = "rgba(100, 116, 139, 0.2)";
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(ground.px, ground.py);
      ctx.stroke();

      // Nodo gráfico
      ctx.fillStyle = isSelected ? "#06b6d4" : "#e2e8f0";
      ctx.beginPath();
      ctx.arc(px, py, isSelected ? 8 : 5, 0, Math.PI * 2);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Etiqueta del Instrumento
      ctx.font = isSelected ? "bold 11px monospace" : "10px monospace";
      ctx.fillStyle = isSelected ? "#38bdf8" : "#94a3b8";
      ctx.fillText(inst.id, px + 9, py + 3);
    });

    // Cursor Interpolador Tridimensional
    const curProj = project(cursorPos.x, cursorPos.y, cursorPos.z, width, height);
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(curProj.px, curProj.py, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fbbf24";
    ctx.stroke();
  }, [angleX, angleY, selectedInst, cursorPos, project]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    setAngleY((prev) => prev + dx * 0.01);
    setAngleX((prev) => Math.max(-1.2, Math.min(1.2, prev + dy * 0.01)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let closest: InstrumentNode | null = null;
    let minDist = 20;

    GREY_INSTRUMENTS.forEach((inst) => {
      const { px, py } = project(inst.x, inst.y, inst.z, canvas.width, canvas.height);
      const dist = Math.hypot(px - mx, py - my);
      if (dist < minDist) {
        minDist = dist;
        closest = inst;
      }
    });

    if (closest) {
      onSelectInstrument(closest);
      setCursorPos({ x: (closest as InstrumentNode).x, y: (closest as InstrumentNode).y, z: (closest as InstrumentNode).z });
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Move3d className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-slate-100 text-sm">
            Espacio Timbríco 3D de John Grey (1977)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="text-rose-400">■ X: Ataque</span>
          <span className="text-cyan-400">■ Y: Brillo</span>
          <span className="text-purple-400">■ Z: Inestabilidad</span>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={650}
          height={400}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          className="w-full h-80 bg-slate-950 rounded-lg cursor-grab active:cursor-grabbing border border-slate-900"
        />
        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
          Arrastrá para rotar | Clic en un nodo para seleccionar
        </div>
      </div>

      {/* Controles de Interpolación de Posición manual */}
      <div className="space-y-3 pt-2 border-t border-slate-900">
        <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>Interpolador de Timbre Síntesis MDS</span>
          <span className="text-amber-400 font-bold">
            Posición: ({cursorPos.x.toFixed(2)}, {cursorPos.y.toFixed(2)}, {cursorPos.z.toFixed(2)})
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-mono text-rose-400 block mb-1">Eje X (Transitorio)</label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={cursorPos.x}
              onChange={(e) => setCursorPos({ ...cursorPos, x: parseFloat(e.target.value) })}
              className="w-full accent-rose-500 bg-slate-900 h-1.5 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-cyan-400 block mb-1">Eje Y (Brillo)</label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={cursorPos.y}
              onChange={(e) => setCursorPos({ ...cursorPos, y: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-purple-400 block mb-1">Eje Z (Inestabilidad)</label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={cursorPos.z}
              onChange={(e) => setCursorPos({ ...cursorPos, z: parseFloat(e.target.value) })}
              className="w-full accent-purple-400 bg-slate-900 h-1.5 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}