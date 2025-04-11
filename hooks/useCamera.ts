import { useEffect, useRef, useState, useCallback } from "react";

export function useCamera(
  videoRef: React.RefObject<HTMLVideoElement>,
  pose: any,
  deviceId: string | null
) {
  const [cameraStarted, setCameraStarted] = useState(false);
  const cameraRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraUtilsReady, setCameraUtilsReady] = useState(false);
  const didInit = useRef(false); // Added didInit ref

  // ✅ Load camera_utils script on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ camera_utils loaded");
      setCameraUtilsReady(true);
    };
    script.onerror = () => console.error("❌ Failed to load camera_utils");

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const stopCamera = useCallback(async () => {
    if (cameraRef.current) {
      await cameraRef.current.stop();
      cameraRef.current = null;
    }

    const tracks = videoRef.current?.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStarted(false);
  }, []);



  const startCamera = useCallback(async () => {
    if (!pose || !videoRef.current || !deviceId || !cameraUtilsReady) {
      console.warn("🚫 Cannot start camera yet: prerequisites not met");
      return;
    }

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });

      console.log("🎥 Using camera ID:", deviceId);

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const CameraClass = (window as any).Camera;
      console.log("📦 CameraClass:", CameraClass);

      if (CameraClass) {
        const camera = new CameraClass(videoRef.current, {
          onFrame: async () => {
            // console.log("📸 Sending frame to Holistic");
            if (pose) await pose.send({ image: videoRef.current });
          },
        });

        await camera.start();
        cameraRef.current = camera;
        setCameraStarted(true);
        console.log("✅ Camera started");
      } else {
        console.error("❌ Camera class not found");
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      setCameraStarted(false);
    }
  }, [pose, videoRef, deviceId, cameraUtilsReady, stopCamera]);

  return { startCamera, stopCamera, cameraStarted };
}