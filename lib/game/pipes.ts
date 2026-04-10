import {
  GROUND_HEIGHT,
  PIPE_ENTRY_SPEED,
  PIPE_GAP,
  PIPE_INTERVAL_MS,
  PIPE_SAFE_EDGE_PADDING,
  PIPE_SPEED,
  PIPE_WIDTH,
} from "@/lib/game/constants";
import type { GameState, PipeState } from "@/types/game";

/** Spawns a pipe with a randomized but safe gap position that always stays playable. */
export function spawnPipe(
  state: GameState,
  nowMs: number,
  randomSource: () => number = Math.random,
): void {
  const safeRange = getPipeGapRange(state.height);
  const gapY = safeRange.min + randomSource() * (safeRange.max - safeRange.min);

  const nextPipe: PipeState = {
    id: `${nowMs}-${Math.floor(gapY)}`,
    x: state.width + PIPE_WIDTH,
    width: PIPE_WIDTH,
    gapY,
    gapHeight: PIPE_GAP,
    passed: false,
    entryProgress: 0,
  };

  state.pipes.push(nextPipe);
  state.lastPipeSpawnTime = nowMs;
}

/** Advances all pipes, removes off-screen pipes, updates score flags, and spawns new pipes by interval. */
export function updatePipes(
  state: GameState,
  deltaFrames: number,
  nowMs: number,
  birdX: number,
  randomSource: () => number = Math.random,
): number {
  let scoreIncrement = 0;

  for (const pipe of state.pipes) {
    pipe.x -= PIPE_SPEED * deltaFrames;
    pipe.entryProgress = Math.min(
      1,
      pipe.entryProgress + PIPE_ENTRY_SPEED * deltaFrames,
    );

    const birdPassedPipe = birdX > pipe.x + pipe.width;
    if (!pipe.passed && birdPassedPipe) {
      pipe.passed = true;
      scoreIncrement += 1;
    }
  }

  state.pipes = state.pipes.filter((pipe) => pipe.x + pipe.width > 0);

  const elapsedSinceLastSpawn = nowMs - state.lastPipeSpawnTime;
  if (elapsedSinceLastSpawn >= PIPE_INTERVAL_MS) {
    spawnPipe(state, nowMs, randomSource);
  }

  return scoreIncrement;
}

/** Calculates a safe top/bottom range for the gap center to avoid impossible pipe layouts. */
function getPipeGapRange(canvasHeight: number): { min: number; max: number } {
  const halfGap = PIPE_GAP / 2;
  const min = PIPE_SAFE_EDGE_PADDING + halfGap;
  const max = canvasHeight - GROUND_HEIGHT - PIPE_SAFE_EDGE_PADDING - halfGap;

  return { min, max };
}
