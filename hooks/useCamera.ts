
import { useEffect, useRef, useState } from "react";

export function useCamera(
  videoRef: React.RefObject<HTMLVideoElement>,
  pose: any,
  deviceId: string | null
) {
  const [cameraStarted, setCameraStarted] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      const tracks = videoRef.current?.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, []);

  const startCamera = async () => {
    if (!pose || !videoRef.current || !deviceId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const CameraClass = (window as any).Camera;
      if (CameraClass) {
        if (cameraRef.current) {
          cameraRef.current.stop();
        }
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
  };

  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    const tracks = videoRef.current?.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;

    setCameraStarted(false);
  }, []);

  return { startCamera, stopCamera, cameraStarted };
}
