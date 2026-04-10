import {
  BIRD_HITBOX_SCALE,
  BIRD_SIZE,
  FLAP_VELOCITY,
  GRAVITY,
  MAX_FALL_VELOCITY,
} from "@/lib/game/constants";
import type { BirdState, Rectangle } from "@/types/game";

/** Creates the bird in a stable starting position that feels fair for first input timing. */
export function createBirdState(
  canvasWidth: number,
  canvasHeight: number,
): BirdState {
  return {
    x: Math.round(canvasWidth * 0.28),
    y: Math.round(canvasHeight * 0.42),
    velocityY: 0,
    rotation: 0,
  };
}

/** Applies an upward impulse so each flap has consistent lift regardless of previous velocity. */
export function flapBird(bird: BirdState): void {
  bird.velocityY = FLAP_VELOCITY;
  bird.rotation = -25;
}

/** Updates bird velocity and position from gravity while capping extreme downward speed. */
export function updateBirdPhysics(bird: BirdState, deltaFrames: number): void {
  const gravityStep = GRAVITY * deltaFrames;
  bird.velocityY = Math.min(bird.velocityY + gravityStep, MAX_FALL_VELOCITY);
  bird.y += bird.velocityY * deltaFrames;
  bird.rotation = getBirdRotationDegrees(bird.velocityY);
}

/** Returns a readable rotation rule that tilts down while falling and up on flap. */
export function getBirdRotationDegrees(velocityY: number): number {
  const isFalling = velocityY > 0;
  if (isFalling) {
    return Math.min(velocityY * 3, 45);
  }
  return Math.max(velocityY * 2, -25);
}

/** Uses a slightly smaller collision box than the sprite to keep collisions feeling fair. */
export function getBirdHitbox(bird: BirdState): Rectangle {
  const hitboxSize = BIRD_SIZE * BIRD_HITBOX_SCALE;
  const inset = (BIRD_SIZE - hitboxSize) / 2;

  return {
    x: bird.x + inset,
    y: bird.y + inset,
    width: hitboxSize,
    height: hitboxSize,
  };
}
