// hooks/useHolistic.ts
import { useEffect, useState } from "react";

export function useHolistic(onResults: (results: any) => void) {
  const [holistic, setHolistic] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadHolistic = async () => {
      const drawingScript = document.createElement("script");
      drawingScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";
      document.body.appendChild(drawingScript);

      await new Promise<void>((resolve) => {
        const holisticScript = document.createElement("script");
        holisticScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js";
        holisticScript.onload = () => resolve();
        document.body.appendChild(holisticScript);
      });

      const HolisticClass = (window as any).Holistic;
      if (HolisticClass) {
        const holisticInstance = new HolisticClass({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
        });

        holisticInstance.setOptions({
          modelComplexity: 2,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          refineFaceLandmarks: true,
          minDetectionConfidence: 0.8,
          minTrackingConfidence: 0.8,
        });

        holisticInstance.onResults(onResults);
        setHolistic(holisticInstance);
        setReady(true);
      }
    };

    loadHolistic();
  }, [onResults]);

  return { holistic, ready };
}
