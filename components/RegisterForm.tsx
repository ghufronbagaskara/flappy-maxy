"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { savePlayerToSession } from "@/lib/storage";
import { registerFormSchema, type RegisterFormInput } from "@/lib/validation";

interface FieldErrors {
  name?: string;
  email?: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const stars = createStars(96);
    let animationFrameId = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#050a14";
      context.fillRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        star.x -= star.speed;
        if (star.x < -3) {
          star.x = canvas.width + 3;
        }

        context.fillStyle = `rgba(0, 229, 255, ${star.opacity.toFixed(2)})`;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const handleSubmit = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    const payload: RegisterFormInput = {
      name,
      email,
    };

    const validation = registerFormSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    savePlayerToSession(validation.data);
    router.push("/game");
  }, [email, isSubmitting, name, router]);

  const onFieldEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="landing-page">
      <canvas
        ref={backgroundCanvasRef}
        className="landing-stars"
        aria-hidden="true"
      />

      <div className="landing-card-wrap">
        <div className="landing-card neon-panel">
          <p className="landing-tagline animate-title-sub">
            MAXY Academy Technical Test
          </p>
          <h1 className="landing-title animate-title-main">Flappy Maxy</h1>
          <p className="landing-subtitle animate-title-sub">
            Daftar dulu, terbangkan burungmu, lalu terima email skor otomatis
            setelah game over.
          </p>

          <div
            className="field-stack"
            role="group"
            aria-label="Player registration"
          >
            <label className="field-label" htmlFor="player-name">
              Player Name
            </label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name) {
                  setErrors((current) => ({ ...current, name: undefined }));
                }
              }}
              onKeyDown={onFieldEnter}
              className={`arcade-input ${errors.name ? "is-error" : ""}`}
              placeholder="Enter your name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.name ? (
              <p id="name-error" className="field-error">
                {errors.name}
              </p>
            ) : null}

            <label className="field-label" htmlFor="player-email">
              Email Address
            </label>
            <input
              id="player-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) {
                  setErrors((current) => ({ ...current, email: undefined }));
                }
              }}
              onKeyDown={onFieldEnter}
              className={`arcade-input ${errors.email ? "is-error" : ""}`}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.email ? (
              <p id="email-error" className="field-error">
                {errors.email}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="arcade-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Loading Game..." : "Start Flight"}
          </button>
        </div>
      </div>
    </section>
  );
}

interface StarParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

/** Creates a deterministic-feeling particle set for the landing page backdrop animation. */
function createStars(count: number): StarParticle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 0.8 + Math.random() * 1.8,
    speed: 0.08 + Math.random() * 0.22,
    opacity: 0.2 + Math.random() * 0.7,
  }));
}
