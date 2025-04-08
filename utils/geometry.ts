export function getAngle(A: any, B: any, C: any) {
  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };

  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.hypot(AB.x, AB.y);
  const magCB = Math.hypot(CB.x, CB.y);

  const angle = Math.acos(dot / (magAB * magCB));
  return (angle * 180) / Math.PI;
}

export function getTiltAngle(left: { x: number; y: number }, right: { x: number; y: number }): number {
  const dx = right.x - left.x;
  const dy = right.y - left.y;
  const angleRadians = Math.atan2(dy, dx);
  return angleRadians * (180 / Math.PI); // degrees
}

export function computeYawFromNose(landmarks: any[]): number | null {
  const leftEye = landmarks[468];
  const rightEye = landmarks[473];
  const noseTip = landmarks[4];

  if (!leftEye || !rightEye || !noseTip) return null;

  // Midpoint between the outer corners of the eyes
  const eyeCenter = {
    x: (leftEye.x + rightEye.x) / 2,
    z: (leftEye.z + rightEye.z) / 2,
  };

  // Horizontal (x) and depth (z) displacement of nose tip from eye center
  const deltaX = noseTip.x - eyeCenter.x;
  const deltaZ = noseTip.z - eyeCenter.z;

  const yawRad = Math.atan2(deltaZ, deltaX);
  const yawDeg = (yawRad * 180) / Math.PI;

  return yawDeg  + 90;
}

export function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  A: any,
  B: any,
  C: any,
  angle: number,
  isFlexion: boolean = false
) {
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

  const displayAngle = isFlexion ? (180 - angle) : angle;
  ctx.fillText(`${displayAngle.toFixed(1)}°`, B.x + 10, B.y - 10);
}

