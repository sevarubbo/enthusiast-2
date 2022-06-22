import type { Vector } from "services/vector";

export function drawHealthBar(ctx: CanvasRenderingContext2D, position: Vector, current: number, max: number) {
  const width = Math.min(5 * max, 100);
  const height = 3;
  const hpRatio = (current / max);
  const hpWidth = hpRatio * width;

  ctx.fillStyle = "green";

  if (hpRatio < 2 / 3) {
    ctx.fillStyle = "yellow";
  }

  if (hpRatio < 1 / 3) {
    ctx.fillStyle = "red";
  }

  ctx.fillRect(
    position.x - hpWidth / 2,
    position.y,
    (current / max) * width,
    height,
  );
}
