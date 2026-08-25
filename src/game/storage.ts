const BEST_WAVE_KEY = "gun-hero:best-wave";

export function loadBestWave(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(BEST_WAVE_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function saveBestWave(wave: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BEST_WAVE_KEY, String(wave));
}
