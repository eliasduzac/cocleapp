export interface InstrumentNode {
  id: string;
  name: string;
  family: string;
  // Coordenadas normalizadas (-1 a 1) basadas en el gráfico 3D de Grey (1977)
  x: number; // Ataque / Inarmronicidad transitoria (Eje II)
  y: number; // Centroide Espectral / Brillo (Eje I)
  z: number; // Fluctuación Espectral / Inestabilidad (Eje III)
}

export const GREY_INSTRUMENTS: InstrumentNode[] = [
  { id: "FH", name: "French Horn (Corno)", family: "Metales", x: 0.2, y: 0.9, z: -0.6 },
  { id: "TP", name: "Trumpet (Trompeta)", family: "Metales", x: 0.7, y: 0.3, z: -0.1 },
  { id: "TM", name: "Trombone (Trombón)", family: "Metales", x: 0.5, y: -0.7, z: 0.8 },
  { id: "BN", name: "Bassoon (Fagot)", family: "Maderas", x: -0.4, y: 0.5, z: 0.2 },
  { id: "EH", name: "English Horn (Corno Inglés)", family: "Maderas", x: -0.6, y: -0.2, z: -0.3 },
  { id: "O1", name: "Oboe 1", family: "Maderas", x: -0.2, y: -0.3, z: 0.4 },
  { id: "O2", name: "Oboe 2", family: "Maderas", x: -0.1, y: -0.6, z: 0.5 },
  { id: "C1", name: "Clarinet 1", family: "Maderas", x: -0.5, y: 0.1, z: -0.7 },
  { id: "C2", name: "Clarinet 2", family: "Maderas", x: -0.3, y: 0.7, z: -0.5 },
  { id: "FL", name: "Flute (Flauta)", family: "Maderas", x: 0.8, y: 0.2, z: -0.8 },
  { id: "S1", name: "String 1 (Cuerda Sul Tasto)", family: "Cuerdas", x: -0.8, y: 0.1, z: -0.4 },
  { id: "S2", name: "String 2 (Cuerda Ordinario)", family: "Cuerdas", x: -0.7, y: 0.5, z: -0.2 },
  { id: "S3", name: "String 3 (Cuerda Ponticello)", family: "Cuerdas", x: -0.6, y: 0.8, z: 0.1 },
  { id: "X1", name: "Saxophone 1", family: "Maderas", x: -0.2, y: 0.4, z: -0.2 },
  { id: "X2", name: "Saxophone 2", family: "Maderas", x: -0.3, y: 0.6, z: -0.1 },
  { id: "X3", name: "Saxophone 3", family: "Maderas", x: -0.4, y: 0.0, z: -0.3 },
];

/**
 * Lógica de Duración Subjetiva según la teoría psicoacústica de Freiberg.
 * Calcula el tiempo percibido estimado según la carga de procesamiento perceptual.
 */
export function calculateSubjectiveDuration(
  physicalSeconds: number,
  density: number,      // Eventos por segundo (1 a 10)
  instability: number,  // Fluctuación espectral (0 a 1)
  brightness: number    // Centroide / Agudos (0 a 1)
): number {
  // Coeficientes psicoacústicos de dilatación temporal
  const densityFactor = (density - 1) * 0.08;
  const instabilityFactor = instability * 0.35;
  const brightnessFactor = brightness * 0.15;

  const dilationMultiplier = 1 + densityFactor + instabilityFactor + brightnessFactor;
  return Number((physicalSeconds * dilationMultiplier).toFixed(2));
}