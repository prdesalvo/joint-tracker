export function getAngle(A: any, B: any, C: any) {
  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };

  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.hypot(AB.x, AB.y);
  const magCB = Math.hypot(CB.x, CB.y);

  const angle = Math.acos(dot / (magAB * magCB));
  return (angle * 180) / Math.PI;
}

export function drawAngleArc(ctx: CanvasRenderingContext2D, A: any, B: any, C: any, angle: number) {
  const radius = 40;
  const v1 = { x: A.x - B.x, y: A.y - B.y };
  const v2 = { x: C.x - B.x, y: C.y - B.y };
  const start = Math.atan2(v1.y, v1.x);
  const end = Math.atan2(v2.y, v2.x);

  ctx.beginPath();
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 2;
  ctx.arc(B.x, B.y, radius, start, end, false);
  ctx.stroke();

  ctx.fillStyle = "#FFD700";
  ctx.font = "16px Arial";
  ctx.fillText(`${(180 - angle).toFixed(1)}°`, B.x + 10, B.y - 10); // Subtracts the angle from 180 to get the flexion angle
}
