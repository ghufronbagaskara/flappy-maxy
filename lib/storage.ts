import { registerFormSchema } from "@/lib/validation";
import type { PlayerRecord } from "@/types/game";

export const PLAYER_SESSION_STORAGE_KEY = "flappy-maxy-player";

/** Persists the validated player profile for the current browser session. */
export function savePlayerToSession(player: PlayerRecord): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(PLAYER_SESSION_STORAGE_KEY, JSON.stringify(player));
}

/** Reads and validates the player profile from session storage before gameplay starts. */
export function readPlayerFromSession(): PlayerRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = sessionStorage.getItem(PLAYER_SESSION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedUnknown: unknown = JSON.parse(rawValue);
    const parsedPlayer = registerFormSchema.safeParse(parsedUnknown);
    if (!parsedPlayer.success) {
      return null;
    }

    return parsedPlayer.data;
  } catch {
    return null;
  }
}
