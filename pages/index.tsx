
// pages/index.tsx
import React, { useRef, useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { joints } from "../hooks/jointConfig";
import AngleBar from "../components/AngleBar";
import { getAngle, drawAngleArc } from "../utils/geometry";
import { usePose } from "../hooks/usePose";
import { useCamera } from "../hooks/useCamera";
import { useResizeCanvas } from "../hooks/useResizeCanvas";
import { drawPoseAnnotations } from "../utils/mediapipeDrawing";


export default function PoseTrackerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedJointId, setSelectedJointId] = useState("leftElbow");
  const selectedJoint = useMemo(
    () => joints.find((j) => j.id === selectedJointId),
    [selectedJointId]
  );

  const [angle, setAngle] = useState<number | null>(0);
  const [visible, setVisible] = useState(true);
  const maxAngle = useRef(0);
  const minAngle = useRef(180);

  const onResults = (results: any) => {
    if (!selectedJoint || !results.poseLandmarks) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    const { width, height } = video.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    ctx?.clearRect(0, 0, width, height);
    ctx?.drawImage(results.image, 0, 0, width, height);
    if (!ctx) return; // ensure ctx is not null
    drawPoseAnnotations(ctx, results);


    const lm = results.poseLandmarks;
    const toPx = ({ x, y, visibility }: any) => ({
      x: x * width,
      y: y * height,
      visible: visibility > 0.7,
    });

    const [A, B, C] = selectedJoint.indices.map((i) => toPx(lm[i]));
    const allVisible = [A, B, C].every((p) => p.visible);
    setVisible(allVisible);

    if (allVisible) {
      const rawAngle = getAngle(A, B, C);
      const flexion = 180 - rawAngle;
      ctx && drawAngleArc(ctx, A, B, C, rawAngle);

      if (flexion > maxAngle.current) maxAngle.current = flexion;
      if (flexion < minAngle.current) minAngle.current = flexion;
      setAngle(flexion);
    } else {
      setAngle(null);
    }
  };

  const { pose, ready } = usePose(onResults);
  const { startCamera } = useCamera(videoRef, pose);
  useResizeCanvas(videoRef, canvasRef);

  const resetAngles = () => {
    maxAngle.current = 0;
    minAngle.current = 180;
    setAngle(null);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Header
        title="Joint Angle Tracker"
        subtitle="Use your camera to track elbow, knee, and other joint flexion in real time using MediaPipe Pose."
        icon={"📐"} // Optional: could be a logo too
      />
      <div className="flex gap-4 mb-4 items-center">
        <select
          value={selectedJointId}
          onChange={(e) => setSelectedJointId(e.target.value)}
          className="border p-2 rounded"
        >
          {joints.map((joint) => (
            <option key={joint.id} value={joint.id}>
              {joint.label}
            </option>
          ))}
        </select>
        <button
          onClick={startCamera}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Start Camera
        </button>
        <button
          onClick={resetAngles}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Reset Max Angles
        </button>
      </div>

      <AngleBar
        label={selectedJoint?.label ?? ""}
        angle={angle}
        maxAngle={maxAngle.current}
        minAngle={minAngle.current}
      />

      {!visible && (
        <div className="text-red-600 text-sm mb-2">
          {selectedJoint?.label} not fully visible. Ensure all points are in view.
        </div>
      )}

      <div className="relative">
        <video ref={videoRef} playsInline className="w-full" />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      </div>
      <Footer />
    </div>
  );
}
