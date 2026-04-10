"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import GameOverlay from "@/components/GameOverlay";
import ScoreDisplay from "@/components/ScoreDisplay";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/lib/game/constants";
import { createInitialGameState, GameEngine } from "@/lib/game/engine";
import { renderGameFrame } from "@/lib/game/renderer";
import type {
  PlayerRecord,
  EmailDeliveryStatus,
  GameState,
} from "@/types/game";

interface GameCanvasProps {
  player: PlayerRecord;
}

export default function GameCanvas({ player }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const isSendingEmailRef = useRef(false);
  const scoreResetTimerRef = useRef<number | null>(null);
  const lastScoreRef = useRef(0);

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(CANVAS_WIDTH, CANVAS_HEIGHT),
  );
  const [scorePulse, setScorePulse] = useState(false);
  const [emailStatus, setEmailStatus] = useState<EmailDeliveryStatus>("idle");
  const [emailMessage, setEmailMessage] = useState("");

  const sendScore = useCallback(
    async (score: number): Promise<void> => {
      if (isSendingEmailRef.current) {
        return;
      }

      isSendingEmailRef.current = true;
      setEmailStatus("sending");
      setEmailMessage("");

      try {
        const response = await fetch("/api/send-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: player.name,
            email: player.email,
            score,
          }),
        });

        if (!response.ok) {
          const failedPayload = (await response.json()) as { message?: string };
          throw new Error(failedPayload.message ?? "Unexpected email error.");
        }

        setEmailStatus("sent");
      } catch (error) {
        setEmailStatus("failed");
        if (error instanceof Error) {
          setEmailMessage(error.message);
        } else {
          setEmailMessage("Unexpected email error.");
        }
      } finally {
        isSendingEmailRef.current = false;
      }
    },
    [player.email, player.name],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const engine = new GameEngine({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      onRender: (state) => {
        renderGameFrame(context, state);
      },
      onStateChange: (state) => {
        setGameState(state);
      },
      onGameOver: (score) => {
        void sendScore(score);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      if (scoreResetTimerRef.current !== null) {
        window.clearTimeout(scoreResetTimerRef.current);
      }
    };
  }, [sendScore]);

  useEffect(() => {
    const scoreIncreased = gameState.score > lastScoreRef.current;
    if (scoreIncreased) {
      setScorePulse(true);
      if (scoreResetTimerRef.current !== null) {
        window.clearTimeout(scoreResetTimerRef.current);
      }

      scoreResetTimerRef.current = window.setTimeout(() => {
        setScorePulse(false);
      }, 220);
    }

    lastScoreRef.current = gameState.score;
  }, [gameState.score]);

  const handlePrimaryAction = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    if (gameState.phase === "idle") {
      setEmailStatus("idle");
      setEmailMessage("");
      engine.startGame();
      return;
    }

    if (gameState.phase === "dead") {
      setEmailStatus("idle");
      setEmailMessage("");
      lastScoreRef.current = 0;
      engine.resetGame();
      engine.startGame();
      return;
    }

    if (gameState.phase === "paused") {
      engine.resumeGame();
      return;
    }

    engine.flap();
  }, [gameState.phase]);

  const handlePauseToggle = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }

    if (gameState.phase === "playing") {
      engine.pauseGame();
      return;
    }

    if (gameState.phase === "paused") {
      engine.resumeGame();
    }
  }, [gameState.phase]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyP" || event.code === "Escape") {
        event.preventDefault();
        handlePauseToggle();
        return;
      }

      if (event.code !== "Space") {
        return;
      }

      event.preventDefault();
      handlePrimaryAction();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handlePauseToggle, handlePrimaryAction]);

  return (
    <section className="game-screen" aria-label="Flappy Maxy game canvas">
      <div className="game-stage" onPointerDown={handlePrimaryAction}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas game-canvas-enter"
          aria-label="Flappy bird game"
          role="img"
        />

        <ScoreDisplay score={gameState.score} pulse={scorePulse} />

        <GameOverlay
          gamePhase={gameState.phase}
          score={gameState.score}
          playerName={player.name}
          emailStatus={emailStatus}
          emailMessage={emailMessage}
          onStart={handlePrimaryAction}
          onResume={handlePauseToggle}
          onPlayAgain={handlePrimaryAction}
        />
      </div>
    </section>
  );
}
