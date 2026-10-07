import TimbreDurationExperiment from "@/components/experiments/TimbreDurationExperiment";

export const metadata = {
  title: "Timbre y Duración Subjetiva | Experimentos Psicoacústicos",
  description: "Explora el espacio timbríco 3D de John Grey (1977) y la ilusión de duración subjetiva de Freiberg.",
};

export default function TimbreDurationPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Laboratorio de Timbre y Tiempo
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Interactuá con el mapa tridimensional de instrumentos de John Grey (1977) para modelar timbres sintéticos y comprobar cómo la complejidad espectral altera la percepción del tiempo.
        </p>
      </div>

      <TimbreDurationExperiment />
    </main>
  );
}