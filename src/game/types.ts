export type PartType = "pistol" | "shuriken" | "knife" | "grenade" | "medkit";

export type PartRole = "ranged" | "melee" | "splash" | "support";

export interface PartInstance {
  id: string;
  type: PartType;
  tier: number;
}

export type GridCell = PartInstance | null;

export interface EngineSnapshot {
  coins: number;
  wave: number;
  bestWave: number;
  catHp: number;
  catMaxHp: number;
  waveKilled: number;
  waveTotal: number;
  gameOver: boolean;
  paused: boolean;
}
