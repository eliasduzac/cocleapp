export interface Instrument3D {
  id: string;
  name: string;
  code: string;
  position: [number, number, number]; // [X: Ataque/Flujo, Y: Brillo, Z: Transitorios]
  attackNoise: number; // Nivel de transitorio ruidoso al inicio (Eje Z)
  harmonicDelay: boolean; // Para instrumentos como el Oboe (armónicos entran antes)
}

export const GREY_INSTRUMENTS: Instrument3D[] = [
  {
    id: "flute",
    name: "Flauta (FL)",
    code: "FL",
    position: [0.6, 0.2, 0.8], // Poco brillo, ataque progresivo, ALTO transitorio de soplo
    attackNoise: 0.7,
    harmonicDelay: false,
  },
  {
    id: "oboe",
    name: "Oboe (O1)",
    code: "O1",
    position: [-0.2, -0.4, 0.3], // Brillo medio-alto, entrada asincrónica de armónicos
    attackNoise: 0.2,
    harmonicDelay: true, // 2do armónico entra 5ms antes, fundamental 8ms después
  },
  {
    id: "trumpet",
    name: "Trompeta (TP)",
    code: "TP",
    position: [-0.7, -0.8, -0.2], // Muy brillante, ataque percusivo/sincrónico
    attackNoise: 0.1,
    harmonicDelay: false,
  },
  {
    id: "french_horn",
    name: "Corno Francés (FH)",
    code: "FH",
    position: [0.1, 0.7, -0.5], // Opaco, ataque suave
    attackNoise: 0.05,
    harmonicDelay: false,
  },
];

/**
 * Calcula la duración subjetiva en "duras" (D)
 * 1 dura = sensación de 1s para un tono de 1kHz a 60dB.
 * Para Ti >= 100ms: proporcionalidad lineal.
 * Para Ti < 100ms: la duración subjetiva cae menos rápidamente.
 */
export function calculateDuras(physicalTimeMs: number): number {
  const tiSec = physicalTimeMs / 1000;
  if (physicalTimeMs >= 100) {
    return tiSec;
  }
  // Curva logarítmica ajustada a la gráfica de Freiberg (Slide 9)
  return Math.pow(tiSec, 0.6) * Math.pow(0.1, 0.4);
}

// Alias export para componentes que requieren calculateSubjectiveDuration
export const calculateSubjectiveDuration = calculateDuras;

/**
 * Calcula la duración de pausa físicamente equivalente (Tp)
 * para generar la misma sensación temporal que un impulso (Ti).
 * A 3200 Hz: Ti = 100ms se percibe igual a Tp = 400ms (Factor 4).
 * A 200 Hz / Ruido Blanco: Ti = 100ms se percibe igual a Tp = 200ms (Factor 2).
 * A más de 1s: Ti y Tp coinciden (Factor 1).
 */
export function calculateEquivalentPauseMs(
  tiMs: number,
  soundType: "3200Hz" | "200Hz" | "noise"
): number {
  if (tiMs >= 1000) return tiMs;
  
  const maxFactor = soundType === "3200Hz" ? 4.0 : 2.0;
  const ratio = 1 + (maxFactor - 1) * Math.pow((10