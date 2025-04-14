// geometry.ts
export function getAngle(A: any, B: any, C: any) {
  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };

  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.hypot(AB.x, AB.y);
  const magCB = Math.hypot(CB.x, CB.y);

  const angle = Math.acos(dot / (magAB * magCB));
  return (angle * 180) / Math.PI;
}

// Used for flexion angles to get hyperextension
export function getFlexionAngle(A: any, B: any, C: any): number {
  // Vectors from B to A and B to C
  const BA = { x: A.x - B.x, y: A.y - B.y };
  const BC = { x: C.x - B.x, y: C.y - B.y };

  // Compute the angles of each vector
  const angleBA = Math.atan2(BA.y, BA.x);
  const angleBC = Math.atan2(BC.y, BC.x);

  // Get the signed angle between the vectors
  let angleDeg = (angleBC - angleBA) * (180 / Math.PI);

  // Normalize to 0–360°
  angleDeg = (angleDeg + 360) % 360;

  const deviationFromStraight = angleDeg - 180;
  // e.g. -45° = flexed, +15° = hyperextended

  return deviationFromStraight; // Flexion < 180, hyperextension > 180
}

export function getTiltAngle(left: { x: number; y: number }, right: { x: number; y: number }): number {
  const dx = right.x - left.x;
  const dy = right.y - left.y;
  const angleRadians = Math.atan2(dy, dx);
  return angleRadians * (180 / Math.PI); // degrees
}

export function computeYawFromNose(points: { x: number; y: number }[]): number | null {
  const [noseTip, leftCheek, rightCheek] = points;

 // Compute the Euclidean distance from the nose tip to each cheek.
  const leftDistance = Math.hypot(noseTip.x - leftCheek.x, noseTip.y - leftCheek.y);
  const rightDistance = Math.hypot(noseTip.x - rightCheek.x, noseTip.y - rightCheek.y);

  // Use the distance between the cheeks as the reference "face width".
  const faceWidth = Math.hypot(leftCheek.x - rightCheek.x, leftCheek.y - rightCheek.y);
  if (faceWidth === 0) return null;

  // Calculate a normalized yaw ratio based on the difference in distances.
  // When the head rotates, one cheek gets closer and the other farther:
  // - If leftDistance is larger than rightDistance, then the head is turned to the right (from the subject's perspective).
  // - If rightDistance is larger, then the head is turned to the left.
  const yawRatio = (leftDistance - rightDistance) / faceWidth;

  // Clamp the ratio to ensure it’s within the range [-1, 1].
  const clampedRatio = Math.max(-1, Math.min(1, yawRatio));

  // Multiply by a maximum yaw angle (in degrees) to scale the result.
  // Adjust maxYawAngle as needed—for example, 45 for a range of approximately -45° to +45°.
  const maxYawAngle = 90;
  const yawAngle = clampedRatio * maxYawAngle;

  return yawAngle;
}


export function getNeckPitchAngle(top: { x: number; y: number }, bottom: { x: number; y: number }): number {
  const dx = bottom.x - top.x;
  const dy = bottom.y - top.y;
  const radians = Math.atan2(dy, dx);
  return (radians * 180) / Math.PI;
}

// drawings 
function applyDefaultArcStyle(ctx: CanvasRenderingContext2D, color = "#FFCC00") {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = "black";
  ctx.shadowBlur = 4;
}

function drawAngleLabel(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, color = "#FFCC00") {
  ctx.fillStyle = color;
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.shadowColor = "black";
  ctx.shadowBlur = 4;
  ctx.fillText(label, x, y);
}

export function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  A: any,
  B: any,
  C: any,
  angle: number,
) {
  const radius = 40;
  const v1 = { x: A.x - B.x, y: A.y - B.y };
  const v2 = { x: C.x - B.x, y: C.y - B.y };
  const start = Math.atan2(v1.y, v1.x);
  const end = Math.atan2(v2.y, v2.x);

  ctx.beginPath();
  applyDefaultArcStyle(ctx);
  ctx.arc(B.x, B.y, radius, start, end, false);
  ctx.stroke();

  drawAngleLabel(ctx, B.x + 10, B.y - 10, `${angle.toFixed(1)}°`);
}

export function drawTiltAngleArc(
  ctx: CanvasRenderingContext2D,
  left: { x: number; y: number },
  right: { x: number; y: number },
  angle: number
) {
  const radius = 40;
  const centerX = (left.x + right.x) / 2;
  const centerY = (left.y + right.y) / 2;

  const dx = right.x - left.x;
  const dy = right.y - left.y;
  const theta = Math.atan2(dy, dx);

  // Horizontal reference line
  ctx.beginPath();
  applyDefaultArcStyle(ctx);
  ctx.moveTo(centerX - radius, centerY);
  ctx.lineTo(centerX + radius, centerY);
  ctx.stroke();

  // Arc
  ctx.beginPath();
  applyDefaultArcStyle(ctx);
  ctx.arc(centerX, centerY, radius, 0, theta, theta < 0);
  ctx.stroke();

  drawAngleLabel(ctx, centerX + 10, centerY - 10, `${angle.toFixed(1)}°`);
}

export function drawYawArc(
  ctx: CanvasRenderingContext2D,
  origin: { x: number; y: number },
  angleDeg: number,
  radius: number = 50,
  label?: string
) {
  const startAngle = (-angleDeg * Math.PI) / 180;
  const endAngle = 0;

  ctx.save();
  ctx.beginPath();
  applyDefaultArcStyle(ctx, "#FFD700");
  ctx.arc(origin.x, origin.y, radius, startAngle, endAngle, angleDeg < 0);
  ctx.stroke();

  drawAngleLabel(
    ctx,
    origin.x,
    origin.y - radius - 10,
    label ?? `${Math.round(angleDeg)}°`,
    "#FFD700"
  );
  ctx.restore();
}

export function drawNeckPitchArc(
  ctx: CanvasRenderingContext2D,
  top: { x: number; y: number },
  bottom: { x: number; y: number },
  angleDeg: number,
  radius: number = 40,
  label?: string
) {
  const dx = bottom.x - top.x;
  const dy = bottom.y - top.y;
  const theta = Math.atan2(dy, dx); // angle from horizontal

  ctx.save();

  // Reference line: vertical downward
  ctx.beginPath();
  applyDefaultArcStyle(ctx);
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(top.x, top.y + radius);
  ctx.stroke();

  // Nose vector line
  ctx.beginPath();
  applyDefaultArcStyle(ctx);
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(bottom.x, bottom.y);
  ctx.stroke();

  // Arc between vertical and nose vector
  ctx.beginPath();
  applyDefaultArcStyle(ctx);
  ctx.arc(top.x, top.y, radius, Math.PI / 2, theta, theta < Math.PI / 2);
  ctx.stroke();

  drawAngleLabel(
    ctx,
    top.x + 10,
    top.y - 10,
    label ?? `${angleDeg.toFixed(1)}°`
  );

  ctx.restore();
}
