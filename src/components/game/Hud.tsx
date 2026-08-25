import type { EngineSnapshot } from "@/game/types";

export function Hud({ snapshot }: { snapshot: EngineSnapshot }) {
  const hpPct = snapshot.catMaxHp > 0 ? (snapshot.catHp / snapshot.catMaxHp) * 100 : 0;

  return (
    <div className="flex flex-col gap-1.5 px-1">
      <div className="flex items-center justify-between text-sm font-semibold">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-amber-900">
            🪙 {snapshot.coins}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-sky-900">
            🌊 Wave {snapshot.wave}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-violet-900">
          🏆 Best {snapshot.bestWave}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-rose-500 transition-[width] duration-150"
          style={{ width: `${Math.max(0, Math.min(100, hpPct))}%` }}
        />
      </div>
      <div className="text-right text-xs text-muted-foreground">
        {Math.round(snapshot.catHp)} / {snapshot.catMaxHp} HP
      </div>
    </div>
  );
}
