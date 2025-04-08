import { useEffect, useRef, useState } from "react";

export function usePose(onResults: (results: any) => void) {
  const [pose, setPose] = useState<any>(null);
  const [ready, setReady] = useState(false);

  // ✅ Create a ref to store the latest `onResults`
  const onResultsRef = useRef(onResults);

  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  useEffect(() => {
    const loadScripts = async () => {
      const drawingScript = document.createElement("script");
      drawingScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";
      document.body.appendChild(drawingScript);

      await new Promise<void>((resolve) => {
        const poseScript = document.createElement("script");
        poseScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js";
        poseScript.onload = () => resolve();
        document.body.appendChild(poseScript);
      });

      const PoseClass = (window as any).Pose;
      if (PoseClass) {
        const poseInstance = new PoseClass({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        poseInstance.setOptions({
          modelComplexity: 2,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.8,
          minTrackingConfidence: 0.8,
        });

        // ✅ Use the latest value from the ref
        poseInstance.onResults((results: any) => {
          onResultsRef.current?.(results);
        });

        setPose(poseInstance);
        setReady(true);
      }
    };

    loadScripts();
  }, []); // ✅ only runs once now

  return { pose, ready };
}
