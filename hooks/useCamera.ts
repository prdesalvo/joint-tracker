import { useEffect, useRef, useState } from "react";



export function useCamera(
  videoRef: React.RefObject<HTMLVideoElement>,
  pose: any,
  deviceId: string | null
) {
  const [cameraStarted, setStarted] = useState(false);
  const cameraRef = useRef<any>(null);

  const startCamera = async () => {
    if (!pose || !videoRef.current || !deviceId) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
    });

    videoRef.current.srcObject = stream;
    await videoRef.current.play();

    const CameraClass = (window as any).Camera;
    if (CameraClass) {
      const camera = new CameraClass(videoRef.current, {
        onFrame: async () => {
          if (pose) await pose.send({ image: videoRef.current });
        },
      });

      await camera.start(); // ensure it's done starting
      cameraRef.current = camera;
      setStarted(true); // 
    }
  };

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    const tracks = videoRef.current?.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;

    setStarted(false); // 
  };

  return { startCamera, stopCamera, cameraStarted };

}