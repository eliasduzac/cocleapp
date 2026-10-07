"use client";

import TimbreDurationExperiment from "@/components/experiments/TimbreDurationExperiment";

export default function TimbreDuracionPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Laboratorio de Psicoacústica: Timbre y Duración Subjetiva
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-3xl">
            Experimentos interactivos fundamentados en las investigaciones del Dr. Pablo M. Freiberg.
            Explora la cuantificación de la duración subjetiva en <strong>duras</strong>, el efecto del post-enmascaramiento (L<sub>E</sub>) y el espacio tímbrico multidimensional de John Grey.
          </p>
        </div>

        <TimbreDurationExperiment />
      </div>
    </main>
  );
}