import {
  createBirdState,
  flapBird,
  getBirdHitbox,
  updateBirdPhysics,
} from "@/lib/game/bird";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FRAME_TIME_MS,
  GROUND_HEIGHT,
  GROUND_PATTERN_WIDTH,
} from "@/lib/game/constants";
import { spawnPipe, updatePipes } from "@/lib/game/pipes";
import type { GameState, Rectangle } from "@/types/game";

interface UpdateResult {
  didDie: boolean;
}

export interface GameEngineOptions {
  width?: number;
  height?: number;
  onRender: (state: GameState) => void;
  onStateChange?: (state: GameState) => void;
  onGameOver?: (score: number) => void;
}

/** Creates an immutable-looking starting state so game transitions remain predictable. */
export function createInitialGameState(
  width: number,
  height: number,
): GameState {
  return {
    width,
    height,
    bird: createBirdState(width, height),
    pipes: [],
    score: 0,
    phase: "idle",
    frameCount: 0,
    lastFrameTime: 0,
    lastPipeSpawnTime: 0,
    groundOffset: 0,
  };
}

export class GameEngine {
  private state: GameState;
  private animationFrameId: number | null = null;
  private readonly options: GameEngineOptions;

  constructor(options: GameEngineOptions) {
    const width = options.width ?? CANVAS_WIDTH;
    const height = options.height ?? CANVAS_HEIGHT;

    this.options = options;
    this.state = createInitialGameState(width, height);
    this.emitState();
  }

  /** Starts gameplay from idle and seeds the first pipe timer. */
  public startGame(): void {
    if (this.state.phase !== "idle") {
      return;
    }

    const nowMs = performance.now();
    this.state.phase = "playing";
    this.state.lastFrameTime = nowMs;
    this.state.lastPipeSpawnTime = nowMs;
    spawnPipe(this.state, nowMs);
    this.scheduleNextFrame();
    this.emitState();
  }

  /** Resets all runtime values so a new round starts from a clean state. */
  public resetGame(): void {
    this.stopLoop();
    this.state = createInitialGameState(this.state.width, this.state.height);
    this.emitState();
  }

  /** Applies a flap input only while the game is actively running. */
  public flap(): void {
    if (this.state.phase !== "playing") {
      return;
    }

    flapBird(this.state.bird);
    this.emitState();
  }

  /** Pauses the active loop and keeps current world state for an exact resume. */
  public pauseGame(): void {
    if (this.state.phase !== "playing") {
      return;
    }

    this.state.phase = "paused";
    this.stopLoop();
    this.emitState();
  }

  /** Resumes from pause without applying a giant delta-time jump on the first frame. */
  public resumeGame(): void {
    if (this.state.phase !== "paused") {
      return;
    }

    this.state.phase = "playing";
    this.state.lastFrameTime = performance.now();
    this.scheduleNextFrame();
    this.emitState();
  }

  public getSnapshot(): GameState {
    return cloneGameState(this.state);
  }

  public destroy(): void {
    this.stopLoop();
  }

  private readonly tick = (timestamp: number): void => {
    const result = this.updateState(timestamp);
    this.emitState();

    if (result.didDie) {
      this.stopLoop();
      this.options.onGameOver?.(this.state.score);
      return;
    }

    if (this.state.phase === "playing") {
      this.scheduleNextFrame();
    }
  };

  /** Updates physics and collisions in a strict order to keep each frame deterministic. */
  private updateState(timestamp: number): UpdateResult {
    if (this.state.phase !== "playing") {
      return { didDie: false };
    }

    const deltaMs = Math.max(0, timestamp - this.state.lastFrameTime);
    const deltaFrames = deltaMs / FRAME_TIME_MS;
    this.state.lastFrameTime = timestamp;

    updateBirdPhysics(this.state.bird, deltaFrames);
    this.state.score += updatePipes(
      this.state,
      deltaFrames,
      timestamp,
      this.state.bird.x,
    );
    this.state.groundOffset =
      (this.state.groundOffset + deltaFrames * 3) % GROUND_PATTERN_WIDTH;
    this.state.frameCount += 1;

    const collisionDetected = hasCollision(this.state);
    if (collisionDetected) {
      this.state.phase = "dead";
      return { didDie: true };
    }

    return { didDie: false };
  }

  private emitState(): void {
    const snapshot = cloneGameState(this.state);
    this.options.onStateChange?.(snapshot);
    this.options.onRender(snapshot);
  }

  private scheduleNextFrame(): void {
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  private stopLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

/** Checks world bounds and pipe rectangles against the bird hitbox to decide if the run ends. */
function hasCollision(state: GameState): boolean {
  const birdHitbox = getBirdHitbox(state.bird);
  const hitTopBoundary = birdHitbox.y <= 0;
  const hitGround =
    birdHitbox.y + birdHitbox.height >= state.height - GROUND_HEIGHT;

  if (hitTopBoundary || hitGround) {
    return true;
  }

  for (const pipe of state.pipes) {
    const pipeRects = getPipeRectangles(
      pipe.x,
      pipe.width,
      pipe.gapY,
      pipe.gapHeight,
      state.height,
    );
    for (const pipeRect of pipeRects) {
      if (rectanglesIntersect(birdHitbox, pipeRect)) {
        return true;
      }
    }
  }

  return false;
}

/** Builds top and bottom solid rectangles for each pipe so AABB checks stay simple and fast. */
function getPipeRectangles(
  pipeX: number,
  pipeWidth: number,
  gapY: number,
  gapHeight: number,
  canvasHeight: number,
): Rectangle[] {
  const gapTop = gapY - gapHeight / 2;
  const gapBottom = gapY + gapHeight / 2;

  return [
    { x: pipeX, y: 0, width: pipeWidth, height: gapTop },
    {
      x: pipeX,
      y: gapBottom,
      width: pipeWidth,
      height: canvasHeight - GROUND_HEIGHT - gapBottom,
    },
  ];
}

/** Performs a standard AABB overlap test for two rectangles. */
function rectanglesIntersect(first: Rectangle, second: Rectangle): boolean {
  const separatedHorizontally =
    first.x + first.width < second.x || second.x + second.width < first.x;
  const separatedVertically =
    first.y + first.height < second.y || second.y + second.height < first.y;

  return !(separatedHorizontally || separatedVertically);
}

/** Returns a detached state snapshot to prevent accidental external mutation. */
function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    bird: { ...state.bird },
    pipes: state.pipes.map((pipe) => ({ ...pipe })),
  };
}
