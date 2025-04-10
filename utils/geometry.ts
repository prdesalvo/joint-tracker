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

export function computeYawFromNose(landmarks: any[]): number | null {
  if (!landmarks) return null;

  // First, try using eye + nose landmarks
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const noseTip = landmarks[4];

  if (leftEye && rightEye && noseTip) {
    const eyeCenter = {
      x: (leftEye.x + rightEye.x) / 2,
      z: (leftEye.z + rightEye.z) / 2,
    };

    const deltaX = noseTip.x - eyeCenter.x;
    const deltaZ = noseTip.z - eyeCenter.z;

    const yawRad = Math.atan2(deltaZ, deltaX);
    const yawDeg = (yawRad * 180) / Math.PI;
    return Math.max(-90, Math.min(90, yawDeg + 90));
  }

  // Fallback: use cheek or jaw landmarks for side profiles
  const leftCheek = landmarks[205];
  const rightCheek = landmarks[425];

  if (leftCheek && rightCheek) {
    const deltaX = rightCheek.x - leftCheek.x;
    const deltaZ = rightCheek.z - leftCheek.z;

    const yawRad = Math.atan2(deltaZ, deltaX);
    const yawDeg = (yawRad * 180) / Math.PI;

    return Math.max(-90, Math.min(90, yawDeg));
  }

  // Fallback failed
  return null;
}


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
  centerX: number,
  centerY: number,
  angleDeg: number,
  radius: number = 50,
  label: string = `${Math.round(angleDeg)}°`
) {
  const startAngle = (-angleDeg * Math.PI) / 180;
  const endAngle = 0;

  ctx.save();
  ctx.beginPath();
  applyDefaultArcStyle(ctx, "#FFD700");
  ctx.arc(centerX, centerY, radius, startAngle, endAngle, angleDeg < 0);
  ctx.stroke();
  drawAngleLabel(ctx, centerX, centerY - radius - 10, label, "#FFD700");
  ctx.restore();
}
