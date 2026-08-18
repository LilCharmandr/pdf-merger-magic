import { useRef, useState } from "react";
import { GRID_COLS, PART_DEFS } from "@/game/partDefs";
import type { GridCell } from "@/game/types";
import { cn } from "@/lib/utils";

interface DragState {
  from: number;
  x: number;
  y: number;
}

export function MergeGrid({
  grid,
  onMove,
}: {
  grid: GridCell[];
  onMove: (from: number, to: number) => void;
}) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const indexAtPoint = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y);
    const cellEl = el?.closest<HTMLElement>("[data-cell-index]");
    if (!cellEl) return null;
    return Number(cellEl.dataset.cellIndex);
  };

  const handlePointerDown = (index: number) => (e: React.PointerEvent) => {
    if (!grid[index]) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ from: index, x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
    setHoverIndex(indexAtPoint(e.clientX, e.clientY));
  };

  const handlePointerUp = () => {
    if (!drag) return;
    if (hoverIndex !== null && hoverIndex !== drag.from) {
      onMove(drag.from, hoverIndex);
    }
    setDrag(null);
    setHoverIndex(null);
  };

  const draggedPart = drag ? grid[drag.from] : null;

  return (
    <div className="relative">
      <div
        ref={gridRef}
        className="grid gap-1.5 rounded-2xl bg-muted/60 p-2"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {grid.map((cell, index) => {
          const def = cell ? PART_DEFS[cell.type] : null;
          const isDragSource = drag?.from === index;
          const isHoverTarget = drag !== null && hoverIndex === index && index !== drag.from;
          return (
            <div
              key={index}
              data-cell-index={index}
              onPointerDown={handlePointerDown(index)}
              className={cn(
                "relative flex aspect-square touch-none select-none items-center justify-center rounded-xl border-2 border-transparent bg-background/80 shadow-sm transition-colors",
                cell && "cursor-grab active:cursor-grabbing",
                isHoverTarget && "border-primary bg-primary/10",
                isDragSource && "opacity-30",
              )}
            >
              {def && cell && (
                <>
                  <span
                    className="text-2xl leading-none"
                    style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.25))" }}
                  >
                    {def.emoji}
                  </span>
                  <span
                    className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: def.color }}
                  >
                    {cell.tier}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {drag && draggedPart && (
        <div
          className="pointer-events-none fixed z-50 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-background/95 text-2xl shadow-lg ring-2 ring-primary"
          style={{ left: drag.x, top: drag.y }}
        >
          {PART_DEFS[draggedPart.type].emoji}
        </div>
      )}
    </div>
  );
}
