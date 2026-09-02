const activeContexts = new Set<AudioContext>();

/** Registra un AudioContext activo para poder apagarlo desde el botón de pánico */
export function registerAudioContext(ctx: AudioContext) {
  activeContexts.add(ctx);
}

/** Cierra todos los AudioContexts registrados y emite el evento global */
export function stopAllAudio() {
  activeContexts.forEach((ctx) => {
    if (ctx.state !== "closed") {
      try {
        ctx.close();
      } catch {}
    }
  });
  activeContexts.clear();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("panic-stop-audio"));
  }
}