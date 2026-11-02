const MUTE_KEY = 'dociekai:game-rakieta-liczb:muted';

let ctx: AudioContext | null = null;
let cachedMuted: boolean | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      ctx = Ctor ? new Ctor() : null;
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function isMuted(): boolean {
  if (cachedMuted !== null) return cachedMuted;
  if (typeof window === 'undefined') return false;
  try {
    cachedMuted = window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    cachedMuted = false;
  }
  return cachedMuted;
}

export function setMuted(value: boolean): void {
  cachedMuted = value;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    /* przełącznik dźwięku jest opcjonalny — działa też bez zapisu */
  }
}

export function toggleMuted(): boolean {
  const next = !isMuted();
  setMuted(next);
  return next;
}

interface Note {
  freq: number;
  startOffset: number;
  duration: number;
  type?: OscillatorType;
  peakGain?: number;
}

function playNotes(notes: Note[]): void {
  if (isMuted()) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  for (const note of notes) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = note.type ?? 'sine';
    osc.frequency.value = note.freq;
    const start = now + note.startOffset;
    const end = start + note.duration;
    const peak = note.peakGain ?? 0.18;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peak, start + Math.min(0.02, note.duration / 4));
    gain.gain.linearRampToValueAtTime(0, end);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}

export function playCorrect(): void {
  playNotes([
    { freq: 660, startOffset: 0, duration: 0.09, type: 'sine' },
    { freq: 880, startOffset: 0.07, duration: 0.14, type: 'sine' },
  ]);
}

export function playWrong(): void {
  playNotes([{ freq: 160, startOffset: 0, duration: 0.22, type: 'sawtooth', peakGain: 0.12 }]);
}

export function playMilestone(): void {
  playNotes([
    { freq: 523, startOffset: 0, duration: 0.1, type: 'triangle' },
    { freq: 659, startOffset: 0.09, duration: 0.1, type: 'triangle' },
    { freq: 784, startOffset: 0.18, duration: 0.18, type: 'triangle' },
  ]);
}

export function playGameOver(): void {
  playNotes([
    { freq: 392, startOffset: 0, duration: 0.16, type: 'square', peakGain: 0.1 },
    { freq: 330, startOffset: 0.15, duration: 0.16, type: 'square', peakGain: 0.1 },
    { freq: 262, startOffset: 0.3, duration: 0.28, type: 'square', peakGain: 0.1 },
  ]);
}
