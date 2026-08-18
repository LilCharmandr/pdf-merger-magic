import { PART_DEFS, SHOP_OFFERS, costForPart } from "@/game/partDefs";
import type { PartType } from "@/game/types";
import { cn } from "@/lib/utils";

export function ShopBar({ coins, onBuy }: { coins: number; onBuy: (type: PartType) => void }) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {SHOP_OFFERS.map((type) => {
        const def = PART_DEFS[type];
        const cost = costForPart(type);
        const affordable = coins >= cost;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onBuy(type)}
            disabled={!affordable}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card py-2 text-xs font-semibold shadow-sm transition-opacity",
              !affordable && "opacity-40",
            )}
          >
            <span className="text-xl leading-none">{def.emoji}</span>
            <span className="flex items-center gap-0.5 text-amber-700">🪙{cost}</span>
          </button>
        );
      })}
    </div>
  );
}
