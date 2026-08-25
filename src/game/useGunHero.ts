import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GunHeroEngine } from "./engine";
import { GRID_SIZE, MAX_TIER, costForPart } from "./partDefs";
import { loadBestWave, saveBestWave } from "./storage";
import type { EngineSnapshot, GridCell, PartType } from "./types";

function emptyGrid(): GridCell[] {
  return Array.from({ length: GRID_SIZE }, () => null);
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function useGunHero() {
  const engineRef = useRef<GunHeroEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GunHeroEngine(loadBestWave());
  }
  const engine = engineRef.current;

  const [grid, setGrid] = useState<GridCell[]>(emptyGrid);
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(engine.getSnapshot());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  }, []);

  useEffect(() => {
    engine.setCallbacks({
      onGameOver: () => {
        saveBestWave(engine.getSnapshot().bestWave);
        showToast("Defeated! Tap Restart to try again.");
      },
      onWaveClear: (wave) => {
        saveBestWave(Math.max(loadBestWave(), wave));
        showToast(`Wave ${wave} cleared!`);
      },
    });
  }, [engine, showToast]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let hudAccum = 0;
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      engine.update(dt);
      hudAccum += dt;
      if (hudAccum >= 0.15) {
        hudAccum = 0;
        setSnapshot(engine.getSnapshot());
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [engine]);

  useEffect(() => {
    engine.setLoadout(grid.filter((c): c is NonNullable<GridCell> => c !== null));
  }, [engine, grid]);

  const buyPart = useCallback(
    (type: PartType) => {
      const cost = costForPart(type);
      if (snapshot.coins < cost) {
        showToast("Not enough coins.");
        return;
      }
      const emptyIndex = grid.findIndex((c) => c === null);
      if (emptyIndex === -1) {
        showToast("Grid is full — merge some parts.");
        return;
      }
      engine.coins -= cost;
      setSnapshot(engine.getSnapshot());
      setGrid((prev) => {
        const next = [...prev];
        next[emptyIndex] = { id: newId(), type, tier: 1 };
        return next;
      });
    },
    [engine, grid, snapshot.coins, showToast],
  );

  const movePart = useCallback((from: number, to: number) => {
    if (from === to) return;
    setGrid((prev) => {
      const a = prev[from];
      const b = prev[to];
      if (!a) return prev;
      const next = [...prev];
      if (!b) {
        next[to] = a;
        next[from] = null;
      } else if (b.type === a.type && b.tier === a.tier && a.tier < MAX_TIER) {
        next[to] = { id: newId(), type: a.type, tier: a.tier + 1 };
        next[from] = null;
      } else {
        next[to] = a;
        next[from] = b;
      }
      return next;
    });
  }, []);

  const restart = useCallback(() => {
    engine.restart();
    setGrid(emptyGrid());
    setSnapshot(engine.getSnapshot());
  }, [engine]);

  return useMemo(
    () => ({ engine, grid, snapshot, toast, buyPart, movePart, restart }),
    [engine, grid, snapshot, toast, buyPart, movePart, restart],
  );
}
