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

  // Define indices of pose landmarks to exclude (face points)
  const excludeIndices = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  // Shallow copy with exclusions (preserves array length)
  const filteredLandmarks = results.poseLandmarks.map((lm: any, i: number) =>
    excludeIndices.has(i) ? { x: 0, y: 0, z: 0, visibility: 0 } : lm
  );

  try {
    window.drawConnectors(ctx, filteredLandmarks, window.POSE_CONNECTIONS, {
      color: "#FFFFFF",
      lineWidth: 1,
    });

    window.drawLandmarks(ctx, filteredLandmarks, {
      color: "#FFFFFF",
      radius: 3,
    });
  } catch (err) {
    console.error("Error drawing pose landmarks:", err);
  }

  // Draw select face landmarks from faceLandmarks (optional, more detailed)
  if (results.faceLandmarks) {
    const indicesToDraw = [65, 295, 205, 425, 145, 374, 10, 234, 454, 152, 13, 94, 331];
    const selectedLandmarks = indicesToDraw
      .map(i => results.faceLandmarks[i])
      .filter(Boolean);

    try {
      window.drawLandmarks(ctx, selectedLandmarks, {
        color: "#FFFFFF",
        radius: 3,
      });
    } catch (err) {
      console.error("Error drawing face landmarks:", err);
    }
  }

  // Draw custom facial lines
  if (results.faceLandmarks) {
    const toPx = (point: any) => ({
      x: point.x * ctx.canvas.width,
      y: point.y * ctx.canvas.height,
    });

    ctx.strokeStyle = "#FFFFFF"; // hot pink for visibility
    ctx.lineWidth = 1;

    // Line A: Chin → Nose → Forehead
    const chin = toPx(results.faceLandmarks[152]);
    const nose = toPx(results.faceLandmarks[4]);
    const forehead = toPx(results.faceLandmarks[10]);

    ctx.beginPath();
    ctx.moveTo(chin.x, chin.y);
    ctx.lineTo(nose.x, nose.y);
    ctx.lineTo(forehead.x, forehead.y);
    ctx.stroke();

    // Line B: Ear → Eye → Nose → Eye → Ear
    const leftEar = toPx(results.faceLandmarks[234]);
    const leftEye = toPx(results.faceLandmarks[33]);
    const rightEye = toPx(results.faceLandmarks[263]);
    const rightEar = toPx(results.faceLandmarks[454]);

    ctx.beginPath();
    ctx.moveTo(leftEar.x, leftEar.y);
    ctx.lineTo(leftEye.x, leftEye.y);
    ctx.lineTo(nose.x, nose.y);
    ctx.lineTo(rightEye.x, rightEye.y);
    ctx.lineTo(rightEar.x, rightEar.y);
    ctx.stroke();
  }

}
