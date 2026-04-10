"use client";

interface ScoreDisplayProps {
  score: number;
  pulse: boolean;
}

export default function ScoreDisplay({ score, pulse }: ScoreDisplayProps) {
  return (
    <div
      className="score-display"
      aria-live="polite"
      aria-label={`Current score ${score}`}
    >
      <span className="score-label">Score</span>
      <span className={`score-value ${pulse ? "score-pop" : ""}`}>{score}</span>
    </div>
  );
}
