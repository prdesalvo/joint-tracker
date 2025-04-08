import { useEffect } from "react";

export function useResizeCanvas(videoRef: React.RefObject<HTMLVideoElement>, canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (videoRef.current && canvasRef.current) {
        const { width, height } = videoRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    });

    if (videoRef.current) {
      resizeObserver.observe(videoRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [videoRef, canvasRef]);
}
