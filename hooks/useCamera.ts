// hooks/useCamera.ts
import { useCallback, useRef, useState } from "react";

export function useCamera(
  videoRef: React.RefObject<HTMLVideoElement>,
  holistic: any,
  deviceId: string | null
) {
  const [cameraStarted, setCameraStarted] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) videoRef.current.srcObject = null;

    setCameraStarted(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!holistic || !videoRef.current) return;

    stopCamera();

    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      const videoConstraints: MediaTrackConstraints = isMobile
        ? { facingMode: "user" } // ✅ More reliable on mobile
        : deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: "user" };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const processFrame = async () => {
        if (videoRef.current && holistic) {
          await holistic.send({ image: videoRef.current });
        }
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };

      processFrame();
      setCameraStarted(true);
    } catch (err) {
      console.error("❌ Error starting camera:", err);
      setCameraStarted(false);
    }
  }, [deviceId, holistic, stopCamera]);


  return { startCamera, stopCamera, cameraStarted };
}
