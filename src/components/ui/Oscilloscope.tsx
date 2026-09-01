"use client";

import { useEffect, useRef } from "react";
import * as Tone from "tone";

interface OscilloscopeProps {
  waveformNode: Tone.Waveform | null;
  isPlaying: boolean;
  height?: number;
  lineColor?: string;
}

export default function Oscilloscope({
  waveformNode,
  isPlaying,
  height = 140,
  lineColor = "#22d3ee",
}: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      // Grilla de fondo
      ctx.strokeStyle = "rgba(51, 65, 85, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.stroke();

      if (isPlaying && waveformNode) {
        const values = waveformNode.getValue();
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = lineColor;
        ctx.shadowBlur = 8;
        ctx.shadowColor = lineColor;

        const sliceWidth = width / values.length;
        let x = 0;

        for (let i = 0; i < values.length; i++) {
          const v = values[i] as number;
          const y = ((v + 1) / 2) * h;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Línea plana cuando no hay audio
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
        ctx.moveTo(0, h / 2);
        ctx.lineTo(width, h / 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [waveformNode, isPlaying, lineColor]);

  return (
    <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden p-3 relative shadow-inner">
      <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-sm z-10">
        <span
          className={`w-2 h-2 rounded-full ${
            isPlaying ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
          }`}
        />
        Osciloscopio — Tiempo Real
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full h-auto block rounded-lg"
      />
    </div>
  );
}