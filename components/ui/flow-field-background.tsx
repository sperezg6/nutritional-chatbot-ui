'use client';

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const SUNRISE_COLORS = [
  "#4DBDC9",
  "#6BC5A0",
  "#B8D45C",
  "#F59F20",
  "#EE5631",
];

interface FlowFieldBackgroundProps {
  className?: string;
  variant?: "light" | "dark";
  trailOpacity?: number;
  particleCount?: number;
  speed?: number;
}

export default function FlowFieldBackground({
  className,
  variant = "light",
  trailOpacity = 0.12,
  particleCount = 250,
  speed = 0.6,
}: FlowFieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let particles: { x: number; y: number; vx: number; vy: number; age: number; life: number; color: string }[] = [];
    let animationFrameId: number;
    let isVisible = true;
    let frameCount = 0;

    const bgColor = variant === "light"
      ? `rgba(250, 250, 247, ${trailOpacity})`
      : `rgba(0, 0, 0, ${trailOpacity})`;

    const createParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      age: 0,
      life: Math.random() * 250 + 120,
      color: SUNRISE_COLORS[Math.floor(Math.random() * SUNRISE_COLORS.length)],
    });

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      frameCount++;
      if (frameCount % 2 !== 0) return;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const angle = (Math.cos(p.x * 0.004) + Math.sin(p.y * 0.004)) * Math.PI;
        p.vx += Math.cos(angle) * 0.15 * speed;
        p.vy += Math.sin(angle) * 0.15 * speed;

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;

        p.age++;
        if (p.age > p.life) {
          p.x = Math.random() * width;
          p.y = Math.random() * height;
          p.vx = 0;
          p.vy = 0;
          p.age = 0;
          p.life = Math.random() * 250 + 120;
          p.color = SUNRISE_COLORS[Math.floor(Math.random() * SUNRISE_COLORS.length)];
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const alpha = 1 - Math.abs((p.age / p.life) - 0.5) * 2;
        ctx.globalAlpha = Math.max(0, alpha * 0.7);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 2, 2);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(container);

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      init();
    };

    init();
    animate();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, trailOpacity, particleCount, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 w-full h-full overflow-hidden pointer-events-none",
        className
      )}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
