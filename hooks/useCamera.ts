import { useEffect, useRef, useState } from "react";

export function useCamera(videoRef: React.RefObject<HTMLVideoElement>, pose: any) {
  const [cameraStarted, setStarted] = useState(false);
  const cameraRef = useRef<any>(null); // Store the camera instance

  const startCamera = async () => {
    if (cameraStarted || !videoRef.current) return;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";

    script.onload = () => {
      const CameraClass = (window as any).Camera;
      if (CameraClass && videoRef.current) {
        const camera = new CameraClass(videoRef.current, {
          onFrame: async () => {
            if (pose) await pose.send({ image: videoRef.current });
          },
        });

        camera.start();
        cameraRef.current = camera; // Save the instance
        setStarted(true);
      }
    };

    document.body.appendChild(script);
  };

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop(); // Stop the camera feed
      cameraRef.current = null;
    }
    setStarted(false);
  };

  return { startCamera, stopCamera, cameraStarted };
}
