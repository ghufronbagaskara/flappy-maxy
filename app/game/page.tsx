"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import GameCanvas from "@/components/GameCanvas";
import { readPlayerFromSession } from "@/lib/storage";
import type { PlayerRecord } from "@/types/game";

export default function GamePage() {
  const router = useRouter();
  const [player] = useState<PlayerRecord | null>(() => readPlayerFromSession());

  useEffect(() => {
    if (!player) {
      router.replace("/");
    }
  }, [player, router]);

  if (!player) {
    return (
      <main className="app-shell">
        <section className="loading-panel neon-panel">
          Preparing game...
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <GameCanvas player={player} />
    </main>
  );
}
