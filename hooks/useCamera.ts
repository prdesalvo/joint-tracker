import { useEffect, useState } from "react";

export function useCamera(videoRef: React.RefObject<HTMLVideoElement>, pose: any) {
  const [cameraStarted, setStarted] = useState(false);

  const startCamera = async () => {
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
        setStarted(true);
      }
    };
    document.body.appendChild(script);
  };

  return { startCamera, cameraStarted };
}
