export type GamePhase = "idle" | "playing" | "paused" | "dead";

export interface PlayerRecord {
  name: string;
  email: string;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BirdState {
  x: number;
  y: number;
  velocityY: number;
  rotation: number;
}

export interface PipeState {
  id: string;
  x: number;
  width: number;
  gapY: number;
  gapHeight: number;
  passed: boolean;
  entryProgress: number;
}

export interface GameState {
  width: number;
  height: number;
  bird: BirdState;
  pipes: PipeState[];
  score: number;
  phase: GamePhase;
  frameCount: number;
  lastFrameTime: number;
  lastPipeSpawnTime: number;
  groundOffset: number;
}

export type EmailDeliveryStatus = "idle" | "sending" | "sent" | "failed";
