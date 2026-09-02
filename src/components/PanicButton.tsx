"use client";

import { AlertOctagon } from "lucide-react";
import { stopAllAudio } from "@/lib/audioRegistry";

export default function PanicButton() {
  return (
    <button
      onClick={stopAllAudio}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full shadow-2xl shadow-rose-950/80 border border-rose-400/40 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
      title="Detener todo el audio inmediatamente"
    >
      <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
      <span className="text-xs tracking-wider uppercase font-extrabold">Pánico</span>
    </button>
  );
}