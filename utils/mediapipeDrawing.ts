// utils/mediapipeDrawing.ts

export function drawPoseAnnotations(ctx: CanvasRenderingContext2D, results: any) {
  if (
    typeof window === "undefined" ||
    !ctx ||
    !results.poseLandmarks ||
    !window.drawConnectors ||
    !window.drawLandmarks ||
    !window.POSE_CONNECTIONS
  ) {
    return;
  }

  window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, {
    color: "#FFFFFF",
    lineWidth: 1,
  });

  window.drawLandmarks(ctx, results.poseLandmarks, {
    color: "#FFFFFF",
    lineWidth: 1,
    radius: 3,
  });
}
