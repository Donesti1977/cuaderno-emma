let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speechAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

export function speak(text: string, rate = 0.95): boolean {
  if (!speechAvailable()) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = rate;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const spanish = voices.find((voice) => voice.lang.startsWith("es-ES"));
  const anySpanish = voices.find((voice) => voice.lang.startsWith("es"));
  utterance.voice = spanish ?? anySpanish ?? null;

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (speechAvailable()) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  if (!speechAvailable()) return false;
  return window.speechSynthesis.speaking && currentUtterance !== null;
}
