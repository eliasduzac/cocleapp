import { useEffect } from "react";

export function useAudioPanic(onPanicStop: () => void) {
  useEffect(() => {
    const handlePanic = () => {
      onPanicStop();
    };

    window.addEventListener("panic-stop-audio", handlePanic);
    return () => window.removeEventListener("panic-stop-audio", handlePanic);
  }, [onPanicStop]);
}