"use client";

import { useState } from "react";
import { GREY_INSTRUMENTS, InstrumentNode } from "@/lib/greyData";
import TimbreSpace3D from "./TimbreSpace3D";
import SubjectiveDuration from "./SubjectiveDuration";
import { Music, Layers } from "lucide-react";

export default function TimbreDurationExperiment() {
  const [selectedInst, setSelectedInst] = useState<InstrumentNode | null>(
    GREY_INSTRUMENTS[0]
  );
  const [cursorPos, setCursorPos] = useState({
    x: GREY_INSTRUMENTS[0].x,
    y: GREY_INSTRUMENTS[0].y,
    z: GREY_INSTRUMENTS[0].z,
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-cyan-400" />
            Navegador Espacio-Temporal: Timbre y Duración Subjetiva
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Basado en el modelo MDS tridimensional de John Grey (1977) y las leyes psicoacústicas de Freiberg.
          </p>
        </div>

        {selectedInst && (
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] font-mono text-slate-500 block">INSTRUMENTO ACTIVO</span>
              <span className="text-xs font-mono font-bold text-cyan-300">
                {selectedInst.id} - {selectedInst.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Experimento 3D + Duración */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TimbreSpace3D
          onSelectInstrument={(inst) => setSelectedInst(inst)}
          selectedInst={selectedInst}
          cursorPos={cursorPos}
          setCursorPos={setCursorPos}
        />

        <SubjectiveDuration cursorPos={cursorPos} />
      </div>
    </div>
  );
}