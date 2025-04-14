// utils/landmarks.ts
export function toPx(point: any, width: number, height: number) {
  return {
    x: point.x * width,
    y: point.y * height,
    visible: point.visibility === undefined || point.visibility > 0.7,
  };
}


// utils/landmarks.ts
export function getNormalizedPoints(indices: number[], landmarks: any[], width: number, height: number) {
  return indices.map(i => toPx(landmarks[i], width, height));
}
