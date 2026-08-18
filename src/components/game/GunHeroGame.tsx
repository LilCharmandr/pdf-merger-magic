import { useGunHero } from "@/game/useGunHero";
import { BattleCanvas } from "./BattleCanvas";
import { Hud } from "./Hud";
import { MergeGrid } from "./MergeGrid";
import { ShopBar } from "./ShopBar";
import { GameOverOverlay } from "./GameOverOverlay";

export function GunHeroGame() {
  const { engine, grid, snapshot, toast, buyPart, movePart, restart } = useGunHero();

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col gap-2 bg-gradient-to-b from-sky-50 to-emerald-50 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]">
      <header className="px-1 pt-1">
        <h1 className="text-lg font-extrabold tracking-tight text-foreground">🐱 Gun Hero</h1>
      </header>

      <Hud snapshot={snapshot} />

      <div className="relative h-[34vh] min-h-[180px]">
        <BattleCanvas engine={engine} />
        {snapshot.gameOver && (
          <GameOverOverlay wave={snapshot.wave} bestWave={snapshot.bestWave} onRestart={restart} />
        )}
      </div>

      <div className="relative flex-1 overflow-y-auto">
        <MergeGrid grid={grid} onMove={movePart} />
      </div>

      <ShopBar coins={snapshot.coins} onBuy={buyPart} />

      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
