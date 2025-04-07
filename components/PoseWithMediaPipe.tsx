import React, { useRef, useEffect, useState, useMemo } from "react";

const AngleBar = React.memo(
  ({ angle, maxAngle, minAngle, label }: {
    angle: number | null;
    maxAngle: number;
    minAngle: number;
    label: string;
  }) => {
    const percentage = useMemo(() => {
      return angle !== null ? Math.min((angle / 360) * 100, 100) : 0;
    }, [angle]);

    const maxPercentage = useMemo(() => {
      return Math.min((maxAngle / 360) * 100, 100);
    }, [maxAngle]);

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="relative h-2 bg-gray-200 rounded">
          <div
            className="absolute top-0 h-2 w-1 bg-red-500"
            style={{ left: `${maxPercentage}%` }}
          />
          {angle !== null && (
            <div
              className="absolute top-0 h-2 w-1 bg-blue-500"
              style={{ left: `${percentage}%` }}
            />
          )}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {angle !== null
            ? `${Math.round(angle)}° (Extension: ${Math.round(
                minAngle
              )}°, Flexion: ${Math.round(maxAngle)}°)`
            : `Waiting for landmarks... (Extension: ${Math.round(
                minAngle
              )}°, Flexion: ${Math.round(maxAngle)}°)`}
        </div>
      </div>
    );
  }
);

export default function PoseWithMediaPipe() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pose, setPose] = useState<any>(null);
  const [camera, setCamera] = useState<any>(null);
  const [poseReady, setPoseReady] = useState(false);
  const [leftAngle, setLeftAngle] = useState<number | null>(0);
  const [rightAngle, setRightAngle] = useState<number | null>(0);
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

  const maxLeftFlexion = useRef(0);
  const maxRightFlexion = useRef(0);
  const minLeftFlexion = useRef(180);
  const minRightFlexion = useRef(180);

  const [, forceRender] = useState(0);

  const resetMaxAngles = () => {
    maxLeftFlexion.current = 0;
    maxRightFlexion.current = 0;
    minLeftFlexion.current = 180;
    minRightFlexion.current = 180;
    forceRender(n => n + 1);
  };

  useEffect(() => {
    const loadScripts = async () => {
      const drawingScript = document.createElement("script");
      drawingScript.src =
        "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";
      document.body.appendChild(drawingScript);

      await new Promise((resolve) => {
        const poseScript = document.createElement("script");
        poseScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js";
        poseScript.onload = resolve;
        document.body.appendChild(poseScript);
      });

      if ((window as any).Pose) {
        const pose = new (window as any).Pose({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults(onResults);
        setPose(pose);
        setPoseReady(true);
      }
    };

    loadScripts();
  }, [onResults]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (canvasRef.current && videoRef.current) {
        const { width, height } = videoRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    });

    if (videoRef.current) {
      resizeObserver.observe(videoRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const startCamera = async () => {
    if (!poseReady) return;

    const cameraScript = document.createElement("script");
    cameraScript.src =
      "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";

    cameraScript.onload = async () => {
      if ((window as any).Camera) {
        const camera = new (window as any).Camera(videoRef.current, {
          onFrame: async () => {
            if (pose) await pose.send({ image: videoRef.current });
          },
        });

        try {
          await camera.start();
          setCamera(camera);
        } catch (error) {
          console.error("Camera setup error:", error);
        }
      }
    };

    document.body.appendChild(cameraScript);
  };

  const getAngle = (A: any, B: any, C: any) => {
    const AB = { x: A.x - B.x, y: A.y - B.y };
    const CB = { x: C.x - B.x, y: C.y - B.y };

    const dot = AB.x * CB.x + AB.y * CB.y;
    const magAB = Math.hypot(AB.x, AB.y);
    const magCB = Math.hypot(CB.x, CB.y);

    const angle = Math.acos(dot / (magAB * magCB));
    return (angle * 180) / Math.PI;
  };

  const drawAngleArc = (ctx: CanvasRenderingContext2D, A: any, B: any, C: any, angle: number) => {
    const radius = 40;
    const v1 = { x: A.x - B.x, y: A.y - B.y };
    const v2 = { x: C.x - B.x, y: C.y - B.y };
    const start = Math.atan2(v1.y, v1.x);
    const end = Math.atan2(v2.y, v2.x);

    ctx.beginPath();
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    ctx.arc(B.x, B.y, radius, start, end, false);
    ctx.stroke();

    ctx.fillStyle = "#FFD700";
    ctx.font = "16px Arial";
    ctx.fillText(`${(180 - angle).toFixed(1)}°`, B.x + 10, B.y - 10);
  };

  const onResults = (results: any) => {
    const canvas = canvasRef.current!;
    const video = videoRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { width, height } = video.getBoundingClientRect();

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(results.image, 0, 0, width, height);

    if (results.poseLandmarks) {
      if (window.drawConnectors && window.drawLandmarks && window.POSE_CONNECTIONS) {
        window.drawConnectors(
          ctx,
          results.poseLandmarks,
          window.POSE_CONNECTIONS,
          {
            color: "#FFFFFF",
            lineWidth: 1,
          },
        );
        window.drawLandmarks(ctx, results.poseLandmarks, {
          color: "#FFFFFF",
          lineWidth: 1,
          radius: 3, // Add this line to set the dot size (smaller value for smaller dots)
        });
      }

    if (results.poseLandmarks) {
      const lm = results.poseLandmarks;
      const toPx = ({ x, y, visibility }: any) => ({
        x: x * width,
        y: y * height,
        visible: visibility > 0.7,
      });

      const leftPoints = [lm[11], lm[13], lm[15]].map(toPx);
      const rightPoints = [lm[12], lm[14], lm[16]].map(toPx);

      const leftAllVisible = leftPoints.every((p) => p.visible);
      const rightAllVisible = rightPoints.every((p) => p.visible);

      setLeftVisible(leftAllVisible);
      setRightVisible(rightAllVisible);

      if (leftAllVisible) {
        const rawAngle = getAngle(...leftPoints);
        const flexion = 180 - rawAngle;

        drawAngleArc(ctx, ...leftPoints, rawAngle);

        if (flexion > maxLeftFlexion.current) maxLeftFlexion.current = flexion;
        if (flexion < minLeftFlexion.current) minLeftFlexion.current = flexion;

        setLeftAngle(flexion);
      } else {
        setLeftAngle(null);
      }

      if (rightAllVisible) {
        const rawAngle = getAngle(...rightPoints);
        const flexion = 180 - rawAngle;

        drawAngleArc(ctx, ...rightPoints, rawAngle);

        if (flexion > maxRightFlexion.current) maxRightFlexion.current = flexion;
        if (flexion < minRightFlexion.current) minRightFlexion.current = flexion;

        setRightAngle(flexion);
      } else {
        setRightAngle(null);
      }
    }
  };
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-4 flex gap-4">
        <button
          onClick={startCamera}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Start Camera
        </button>
        <button
          onClick={resetMaxAngles}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Reset Max Angles
        </button>
      </div>

      <AngleBar
        label="Left Elbow"
        angle={leftAngle}
        maxAngle={maxLeftFlexion.current}
        minAngle={minLeftFlexion.current}
      />
      <AngleBar
        label="Right Elbow"
        angle={rightAngle}
        maxAngle={maxRightFlexion.current}
        minAngle={minRightFlexion.current}
      />

      {!leftVisible && (
        <div className="text-red-600 text-sm mb-2">
          Left arm not fully visible. Make sure your shoulder, elbow, and wrist are in view.
        </div>
      )}
      {!rightVisible && (
        <div className="text-red-600 text-sm mb-2">
          Right arm not fully visible. Make sure your shoulder, elbow, and wrist are in view.
        </div>
      )}

      <div className="relative w-full h-auto">
        <video ref={videoRef} playsInline className="w-full h-auto" />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>
    </div>
  );
}