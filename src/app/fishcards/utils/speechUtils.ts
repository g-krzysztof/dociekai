export const speakText = (text: string, lang: 'pl-PL' | 'en-US' = 'pl-PL'): void => {
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis is not supported in this browser');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.8;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = (): void => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const isSpeechSupported = (): boolean => {
  return 'speechSynthesis' in window;
};