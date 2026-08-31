import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Motion for the marketing surfaces only — the landing page and the
 * foundations pages. Component stories never use any of this: a specimen
 * has to sit still on flat ground so you can judge it.
 *
 * Everything here checks `prefers-reduced-motion` and, when it is set,
 * renders the final state immediately rather than a slower animation.
 */

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Star = {
  x: number;
  y: number;
  r: number;
  /** 0 = far and faint, 1 = near and bright. Drives brightness and drift. */
  depth: number;
  phase: number;
};

/**
 * Ambient hero backdrop: a parallax starfield with one slow orbital arc and
 * a luminous point travelling it. Canvas rather than DOM because a few
 * hundred twinkling nodes is exactly the workload canvas is for.
 */
export const Starfield = ({ density = 110 }: { density?: number }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = 0;

    const stars: Star[] = Array.from({ length: density }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.1 + 0.25,
      depth: Math.random(),
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const s of stars) {
        // Nearer stars drift faster: parallax without moving a camera.
        const drift = reduced ? 0 : t * 0.0000055 * (0.35 + s.depth);
        const x = ((s.x + drift) % 1) * width;
        const y = s.y * height;
        const twinkle = reduced ? 1 : 0.78 + 0.22 * Math.sin(t * 0.0011 + s.phase);
        ctx.globalAlpha = (0.16 + s.depth * 0.52) * twinkle;
        ctx.fillStyle = "#cfe4ff";
        ctx.beginPath();
        ctx.arc(x, y, s.r * (0.6 + s.depth * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }

      // The orbit: one thin ellipse, and a lit body running along it. The
      // single moving highlight is the page's one piece of choreography.
      const cx = width * 0.78;
      const cy = height * 1.02;
      const rx = Math.max(width * 0.42, 220);
      const ry = Math.max(height * 0.62, 150);

      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = "#0090ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, -0.32, Math.PI, Math.PI * 2);
      ctx.stroke();

      const angle = reduced ? Math.PI * 1.35 : Math.PI + ((t * 0.00007) % Math.PI);
      const bx = cx + rx * Math.cos(angle) * Math.cos(-0.32) - ry * Math.sin(angle) * Math.sin(-0.32);
      const by = cy + rx * Math.cos(angle) * Math.sin(-0.32) + ry * Math.sin(angle) * Math.cos(-0.32);

      const glow = ctx.createRadialGradient(bx, by, 0, bx, by, 26);
      glow.addColorStop(0, "rgba(112, 184, 255, 0.55)");
      glow.addColorStop(1, "rgba(112, 184, 255, 0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bx, by, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#9cc8ff";
      ctx.beginPath();
      ctx.arc(bx, by, 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    draw(0);

    const observer = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [density]);

  return <canvas ref={ref} className="docs-starfield" aria-hidden="true" />;
};

/**
 * Reveals its children once they scroll into view, then stops observing.
 * Under reduced motion it renders shown on first paint and never animates.
 */
export const Reveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`docs-reveal${shown ? " is-shown" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};
