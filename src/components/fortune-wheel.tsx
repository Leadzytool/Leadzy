"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface Reward {
  id: string;
  label: string;
  probability: number;
  color: string;
}

interface FortuneWheelProps {
  rewards: Reward[];
  logoUrl?: string;
  onResult: (reward: Reward) => void;
}

function pickReward(rewards: Reward[]): number {
  const total = rewards.reduce((sum, r) => sum + r.probability, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < rewards.length; i++) {
    rand -= rewards[i].probability;
    if (rand <= 0) return i;
  }
  return rewards.length - 1;
}

export function FortuneWheel({ rewards, logoUrl, onResult }: FortuneWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const logoImg = useRef<HTMLImageElement | null>(null);

  // Load logo
  useEffect(() => {
    if (logoUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = logoUrl;
      img.onload = () => {
        logoImg.current = img;
        drawWheel(0);
      };
    }
  }, [logoUrl]);

  const drawWheel = useCallback(
    (angle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = center - 8;
      const sliceAngle = (2 * Math.PI) / rewards.length;

      ctx.clearRect(0, 0, size, size);

      // Draw slices
      rewards.forEach((reward, i) => {
        const startAngle = angle + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = reward.color;
        ctx.fill();

        // Slice border
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${Math.max(10, Math.min(14, 200 / rewards.length))}px Inter, sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 2;

        // Truncate text if needed
        const maxWidth = radius - 50;
        let text = reward.label;
        if (ctx.measureText(text).width > maxWidth) {
          while (ctx.measureText(text + "…").width > maxWidth && text.length > 0) {
            text = text.slice(0, -1);
          }
          text += "…";
        }

        ctx.fillText(text, radius - 20, 5);
        ctx.restore();
      });

      // Center circle
      ctx.beginPath();
      ctx.arc(center, center, 36, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Logo in center
      if (logoImg.current) {
        const logoSize = 48;
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, 32, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(
          logoImg.current,
          center - logoSize / 2,
          center - logoSize / 2,
          logoSize,
          logoSize
        );
        ctx.restore();
      } else {
        ctx.fillStyle = "#6366f1";
        ctx.font = "bold 16px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("L", center, center);
      }

      // Pointer (top)
      ctx.beginPath();
      ctx.moveTo(center - 12, 4);
      ctx.lineTo(center + 12, 4);
      ctx.lineTo(center, 28);
      ctx.closePath();
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [rewards]
  );

  useEffect(() => {
    drawWheel(0);
  }, [drawWheel]);

  function spin() {
    if (spinning || rewards.length === 0) return;
    setSpinning(true);

    const winnerIndex = pickReward(rewards);
    const sliceAngle = (2 * Math.PI) / rewards.length;

    // Calculate target: the winner slice should land at top (pointer at 0 / top)
    // Pointer is at top = -PI/2. We need the middle of the winning slice under the pointer.
    const targetSliceMiddle = winnerIndex * sliceAngle + sliceAngle / 2;
    const extraSpins = 5 * 2 * Math.PI; // 5 full rotations
    const targetAngle =
      extraSpins + (2 * Math.PI - targetSliceMiddle) - Math.PI / 2;

    const startAngle = rotationRef.current % (2 * Math.PI);
    const totalRotation = targetAngle - startAngle + 4 * 2 * Math.PI;

    const duration = 4000;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + totalRotation * eased;

      drawWheel(currentAngle);
      rotationRef.current = currentAngle;
      setRotation(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        onResult(rewards[winnerIndex]);
      }
    }

    requestAnimationFrame(animate);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        className="max-w-[340px] w-full"
        style={{ aspectRatio: "1" }}
      />
      <button
        onClick={spin}
        disabled={spinning}
        className="rounded-full bg-primary px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
      >
        {spinning ? "En cours..." : "Tourner la roue !"}
      </button>
    </div>
  );
}
