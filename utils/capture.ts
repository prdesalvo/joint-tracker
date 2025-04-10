export function capturePoseSnapshot(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): string | null {
  const snapshotCanvas = document.createElement("canvas");
  const { width, height } = video.getBoundingClientRect();
  snapshotCanvas.width = width;
  snapshotCanvas.height = height;

  const ctx = snapshotCanvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, width, height);
  ctx.drawImage(canvas, 0, 0, width, height);

  return snapshotCanvas.toDataURL("image/png");
}
