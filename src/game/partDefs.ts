import type { PartRole, PartType } from "./types";

export const MAX_TIER = 6;
export const GRID_COLS = 4;
export const GRID_ROWS = 5;
export const GRID_SIZE = GRID_COLS * GRID_ROWS;

export interface PartDef {
  type: PartType;
  name: string;
  emoji: string;
  color: string;
  role: PartRole;
  range: number;
  baseDamage: number;
  baseFireRate: number;
  baseCost: number;
  description: string;
}

export const PART_DEFS: Record<PartType, PartDef> = {
  pistol: {
    type: "pistol",
    name: "Pistol",
    emoji: "🔫",
    color: "#64748b",
    role: "ranged",
    range: 260,
    baseDamage: 6,
    baseFireRate: 1.4,
    baseCost: 20,
    description: "Reliable long-range shots.",
  },
  shuriken: {
    type: "shuriken",
    name: "Shuriken",
    emoji: "🌀",
    color: "#334155",
    role: "ranged",
    range: 220,
    baseDamage: 4,
    baseFireRate: 2.2,
    baseCost: 18,
    description: "Fast, light throwing stars.",
  },
  knife: {
    type: "knife",
    name: "Knife",
    emoji: "🔪",
    color: "#b45309",
    role: "melee",
    range: 75,
    baseDamage: 11,
    baseFireRate: 1.6,
    baseCost: 16,
    description: "Big damage up close.",
  },
  grenade: {
    type: "grenade",
    name: "Grenade",
    emoji: "💣",
    color: "#166534",
    role: "splash",
    range: 240,
    baseDamage: 8,
    baseFireRate: 0.7,
    baseCost: 24,
    description: "Splash damage on impact.",
  },
  medkit: {
    type: "medkit",
    name: "Medkit",
    emoji: "🩹",
    color: "#dc2626",
    role: "support",
    range: 0,
    baseDamage: 5,
    baseFireRate: 0.5,
    baseCost: 22,
    description: "Heals the hero over time.",
  },
};

export const SHOP_OFFERS: PartType[] = ["pistol", "shuriken", "knife", "grenade", "medkit"];

const DAMAGE_GROWTH = 1.5;
const RATE_GROWTH = 1.05;
const RANGE_GROWTH = 1.06;

export function statsForPart(type: PartType, tier: number) {
  const def = PART_DEFS[type];
  const g = tier - 1;
  return {
    damage: def.baseDamage * DAMAGE_GROWTH ** g,
    fireRate: def.baseFireRate * RATE_GROWTH ** g,
    range: def.range * RANGE_GROWTH ** g,
  };
}

export function costForPart(type: PartType): number {
  return PART_DEFS[type].baseCost;
}
