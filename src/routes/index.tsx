import { createFileRoute } from "@tanstack/react-router";
import { GunHeroGame } from "@/components/game/GunHeroGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gun Hero — Merge & Survive" },
      {
        name: "description",
        content:
          "Merge weapon parts, gear up your cat, and survive endless waves. A tiny installable merge-battler.",
      },
      { property: "og:title", content: "Gun Hero — Merge & Survive" },
      {
        property: "og:description",
        content: "Merge weapon parts and survive endless waves in this installable merge-battler.",
      },
    ],
  }),
  component: GunHeroGame,
});
