import {
  BIRD_SIZE,
  GROUND_HEIGHT,
  GROUND_PATTERN_WIDTH,
  PIPE_ENTRY_TRAVEL,
} from "@/lib/game/constants";
import type { GameState, PipeState } from "@/types/game";

/** Renders one complete frame in a fixed order so visuals stay consistent across devices. */
export function renderGameFrame(
  context: CanvasRenderingContext2D,
  state: GameState,
): void {
  clearCanvas(context, state.width, state.height);
  drawBackground(context, state);
  drawPipes(context, state);
  drawBird(context, state);
  drawGround(context, state);
  drawHud(context, state);
}

function clearCanvas(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  context.clearRect(0, 0, width, height);
}

function drawBackground(
  context: CanvasRenderingContext2D,
  state: GameState,
): void {
  const gradient = context.createLinearGradient(0, 0, 0, state.height);
  gradient.addColorStop(0, "#050a14");
  gradient.addColorStop(0.45, "#0b1a2d");
  gradient.addColorStop(1, "#05070e");

  context.fillStyle = gradient;
  context.fillRect(0, 0, state.width, state.height);
  drawStarField(context, state);
}

/** Draws a subtle star field that drifts slowly to create depth without distracting gameplay. */
function drawStarField(
  context: CanvasRenderingContext2D,
  state: GameState,
): void {
  const starCount = 52;
  for (let index = 0; index < starCount; index += 1) {
    const speed = 0.08 + (index % 5) * 0.03;
    const drift = (state.frameCount * speed) % state.width;
    const originX = (index * 97) % state.width;
    const x = (originX - drift + state.width) % state.width;
    const yLimit = state.height - GROUND_HEIGHT - 20;
    const y = 20 + ((index * 157) % yLimit);
    const radius = 0.8 + (index % 3) * 0.4;
    const opacity = 0.2 + (index % 4) * 0.16;

    context.fillStyle = `rgba(0, 229, 255, ${opacity.toFixed(2)})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
}

function drawPipes(context: CanvasRenderingContext2D, state: GameState): void {
  for (const pipe of state.pipes) {
    drawPipe(context, pipe, state.height);
  }
}

/** Draws one pipe pair and eases new pipes in from the right to avoid visual popping. */
function drawPipe(
  context: CanvasRenderingContext2D,
  pipe: PipeState,
  canvasHeight: number,
): void {
  const gapTop = pipe.gapY - pipe.gapHeight / 2;
  const gapBottom = pipe.gapY + pipe.gapHeight / 2;
  const entryOffset = (1 - pipe.entryProgress) * PIPE_ENTRY_TRAVEL;
  const x = pipe.x + entryOffset;

  context.fillStyle = "#1a8a3c";
  context.fillRect(x, 0, pipe.width, gapTop);
  context.fillRect(
    x,
    gapBottom,
    pipe.width,
    canvasHeight - GROUND_HEIGHT - gapBottom,
  );

  context.fillStyle = "#22ab4b";
  context.fillRect(x + 7, 0, 5, gapTop);
  context.fillRect(
    x + 7,
    gapBottom,
    5,
    canvasHeight - GROUND_HEIGHT - gapBottom,
  );

  context.fillStyle = "#145f2a";
  context.fillRect(x - 3, gapTop - 22, pipe.width + 6, 22);
  context.fillRect(x - 3, gapBottom, pipe.width + 6, 22);
}

function drawBird(context: CanvasRenderingContext2D, state: GameState): void {
  const birdCenterX = state.bird.x + BIRD_SIZE / 2;
  const birdCenterY = state.bird.y + BIRD_SIZE / 2;

  context.save();
  context.translate(birdCenterX, birdCenterY);
  context.rotate((state.bird.rotation * Math.PI) / 180);

  drawBirdTrail(context, state.bird.velocityY);

  context.fillStyle = "#ffb300";
  context.beginPath();
  context.roundRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE, 10);
  context.fill();

  context.fillStyle = "#fff7e6";
  context.beginPath();
  context.arc(6, -5, 4, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#0d1a2b";
  context.beginPath();
  context.arc(7, -5, 1.5, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#ff7a00";
  context.beginPath();
  context.moveTo(BIRD_SIZE / 2 - 2, 0);
  context.lineTo(BIRD_SIZE / 2 + 9, -3);
  context.lineTo(BIRD_SIZE / 2 + 9, 3);
  context.closePath();
  context.fill();

  context.restore();
}

/** Adds a lightweight trail while the bird is flapping to make upward motion feel more responsive. */
function drawBirdTrail(
  context: CanvasRenderingContext2D,
  velocityY: number,
): void {
  if (velocityY > -2) {
    return;
  }

  context.fillStyle = "rgba(0, 229, 255, 0.55)";
  for (let index = 0; index < 3; index += 1) {
    const radius = 3 - index * 0.8;
    context.beginPath();
    context.arc(-18 - index * 8, 3 + index * 2, radius, 0, Math.PI * 2);
    context.fill();
  }
}

function drawGround(context: CanvasRenderingContext2D, state: GameState): void {
  const groundTop = state.height - GROUND_HEIGHT;
  context.fillStyle = "#0d1a2b";
  context.fillRect(0, groundTop, state.width, GROUND_HEIGHT);

  context.fillStyle = "#11314e";
  const stripeCount = Math.ceil(state.width / GROUND_PATTERN_WIDTH) + 2;
  for (let index = 0; index < stripeCount; index += 1) {
    const x = index * GROUND_PATTERN_WIDTH - state.groundOffset;
    context.fillRect(x, groundTop, 10, GROUND_HEIGHT);
  }
}

function drawHud(context: CanvasRenderingContext2D, state: GameState): void {
  context.fillStyle = "rgba(5, 10, 20, 0.55)";
  context.beginPath();
  context.roundRect(18, 18, 118, 62, 14);
  context.fill();

  context.fillStyle = "#00e5ff";
  context.font = "700 16px 'DM Sans', sans-serif";
  context.fillText("SCORE", 32, 42);

  context.fillStyle = "#e8f4fd";
  context.font = "700 30px 'Orbitron', sans-serif";
  context.fillText(String(state.score), 32, 70);
}
