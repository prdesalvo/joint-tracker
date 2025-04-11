import { useEffect, useRef, useState, useCallback } from "react";

export function useCamera(
  videoRef: React.RefObject<HTMLVideoElement>,
  pose: any,
  deviceId: string | null
) {
  const [cameraStarted, setCameraStarted] = useState(false);
  const cameraRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStarted(false);
  }, [videoRef]);

  const startCamera = useCallback(async () => {
    if (!pose || !videoRef.current || !deviceId) return;

    try {
      stopCamera(); // always stop before starting a new one

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const CameraClass = (window as any).Camera;
      if (CameraClass) {
        const camera = new CameraClass(videoRef.current, {
          onFrame: async () => {
            if (pose) await pose.send({ image: videoRef.current });
          },
        });

        await camera.start();
        cameraRef.current = camera;
        setCameraStarted(true);
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      setCameraStarted(false);
    }
  }, [pose, videoRef, deviceId, stopCamera]);

  useEffect(() => {
    return () => stopCamera(); // clean up on unmount
  }, [stopCamera]);

  return { startCamera, stopCamera, cameraStarted };
}
