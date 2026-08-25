import { Button } from "@/components/ui/button";

export function GameOverOverlay({
  wave,
  bestWave,
  onRestart,
}: {
  wave: number;
  bestWave: number;
  onRestart: () => void;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
      <div className="mx-4 flex flex-col items-center gap-3 rounded-2xl bg-card px-6 py-6 text-center shadow-xl">
        <span className="text-3xl">💀</span>
        <h2 className="text-lg font-bold text-foreground">Your cat has fallen</h2>
        <p className="text-sm text-muted-foreground">
          Reached wave <span className="font-semibold text-foreground">{wave}</span>
          {wave >= bestWave && wave > 0 ? " — new best!" : ` · best ${bestWave}`}
        </p>
        <Button onClick={onRestart} size="lg" className="mt-1">
          Restart
        </Button>
      </div>
    </div>
  );
}
