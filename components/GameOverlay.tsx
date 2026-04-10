"use client";

import type { EmailDeliveryStatus, GamePhase } from "@/types/game";

interface GameOverlayProps {
  gamePhase: GamePhase;
  score: number;
  playerName: string;
  emailStatus: EmailDeliveryStatus;
  emailMessage: string;
  onStart: () => void;
  onResume: () => void;
  onPlayAgain: () => void;
}

export default function GameOverlay({
  gamePhase,
  score,
  playerName,
  emailStatus,
  emailMessage,
  onStart,
  onResume,
  onPlayAgain,
}: GameOverlayProps) {
  if (gamePhase === "playing") {
    return null;
  }

  const isIdle = gamePhase === "idle";
  const isPaused = gamePhase === "paused";

  return (
    <div
      className={`game-overlay ${isIdle ? "overlay-idle" : "overlay-game-over"}`}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="overlay-panel neon-panel">
        {isIdle ? (
          <>
            <h2 className="overlay-title">Ready, {playerName}?</h2>
            <p className="overlay-copy">
              Tekan Space atau Tap untuk flap. Hindari pipa dan kejar skor
              setinggi mungkin.
            </p>
            <button type="button" className="arcade-button" onClick={onStart}>
              Start Game
            </button>
          </>
        ) : isPaused ? (
          <>
            <h2 className="overlay-title">Paused</h2>
            <p className="overlay-copy">
              Tarik napas dulu. Tekan P atau Escape untuk lanjut.
            </p>
            <button type="button" className="arcade-button" onClick={onResume}>
              Resume
            </button>
          </>
        ) : (
          <>
            <h2 className="overlay-title">Game Over</h2>
            <p className="overlay-score">Final Score: {score}</p>
            <EmailStatus
              emailStatus={emailStatus}
              emailMessage={emailMessage}
            />
            <button
              type="button"
              className="arcade-button"
              onClick={onPlayAgain}
            >
              Play Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

interface EmailStatusProps {
  emailStatus: EmailDeliveryStatus;
  emailMessage: string;
}

function EmailStatus({ emailStatus, emailMessage }: EmailStatusProps) {
  if (emailStatus === "idle") {
    return <p className="overlay-email-status">Preparing score email...</p>;
  }

  if (emailStatus === "sending") {
    return <p className="overlay-email-status">Sending score email...</p>;
  }

  if (emailStatus === "failed") {
    return (
      <p className="overlay-email-status is-error">
        Couldn&apos;t send email - check your connection. {emailMessage}
      </p>
    );
  }

  return (
    <div className="overlay-email-success">
      <svg viewBox="0 0 52 52" className="checkmark" aria-hidden="true">
        <circle
          className="checkmark-circle"
          cx="26"
          cy="26"
          r="25"
          fill="none"
        />
        <path className="checkmark-path" fill="none" d="M14 27l8 8 16-16" />
      </svg>
      <p className="overlay-email-status">Email sent! Check your inbox.</p>
    </div>
  );
}
