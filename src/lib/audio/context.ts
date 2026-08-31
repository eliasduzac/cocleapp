import * as Tone from "tone";

export async function initAudioContext(): Promise<boolean> {
  if (Tone.getContext().state !== "running") {
    await Tone.start();
  }
  return Tone.getContext().state === "running";
}