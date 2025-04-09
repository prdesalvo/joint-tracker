// pages/index.tsx
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AngleBar from "../components/AngleBar";
import { joints } from "../hooks/jointConfig";
import { computeYawFromNose, getAngle, getFlexionAngle, getTiltAngle, drawAngleArc, drawTiltAngleArc, drawYawArc } from "../utils/geometry";
import { useHolistic } from "../hooks/useHolistic";
import { useCamera } from "../hooks/useCamera";
import { useResizeCanvas } from "../hooks/useResizeCanvas";
import { drawPoseAnnotations } from "../utils/mediapipeDrawing";

export default function PoseTrackerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, forceUpdate] = useState(0);

  const [selectedJointId, setSelectedJointId] = useState("leftElbow");
  const selectedJointIdRef = useRef(selectedJointId);

  useEffect(() => {
    selectedJointIdRef.current = selectedJointId;
    resetAngles();
  }, [selectedJointId]);

  const selectedJoint = useMemo(
    () => joints.find((j) => j.id === selectedJointId),
    [selectedJointId]
  );

  const [angle, setAngle] = useState<number | null>(0);
  const [visible, setVisible] = useState(true);
  const maxAngle = useRef(0);
  const minAngle = useRef(180);

  const onResults = useCallback((results: any) => {
    const jointId = selectedJointIdRef.current;
    const selectedJoint = joints.find(j => j.id === jointId);
    if (!selectedJoint) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    const { width, height } = video.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    ctx?.clearRect(0, 0, width, height);
    ctx?.drawImage(results.image, 0, 0, width, height);
    if (!ctx) return;
    drawPoseAnnotations(ctx, results);

    const landmarks = selectedJoint.type === "face"
      ? results.faceLandmarks
      : results.poseLandmarks;

    if (!landmarks || selectedJoint.indices.some(i => !landmarks[i])) {
      setAngle(null);
      setVisible(false);
      return;
    }

    const toPx = (point: any) => ({
      x: point.x * width,
      y: point.y * height,
      visible: point.visibility === undefined || point.visibility > 0.7,
    });

    const points = selectedJoint.indices.map(i => toPx(landmarks[i]));
    const allVisible = points.every(p => p.visible);
    setVisible(allVisible);

    if (!allVisible) {
      setAngle(null);
      return;
    }

    let rawAngle: number | null = null;

    try {
      if (selectedJoint.calc === "yawFromNose") {
        rawAngle = computeYawFromNose(results.faceLandmarks);
        if (rawAngle !== null) {
          const centerX = width / 2;
          const centerY = height * 0.25;
          drawYawArc(ctx, centerX, centerY, rawAngle);
        }
      }

      else if (selectedJoint.calc === "tilt") {
        if (points.length >= 2) {
          const [A, B] = points;
          rawAngle = getTiltAngle(A, B);
          drawTiltAngleArc(ctx, A, B, rawAngle);
        } else {
          console.warn("Tilt calculation requires 2 points");
        }
      }

      else if (selectedJoint.calc === "Flexion") {
        if (points.length === 3) {
          const [A, B, C] = points;
          rawAngle = getFlexionAngle(A, B, C);
          drawAngleArc(ctx, A, B, C, rawAngle);
        } else {
          console.warn("Flexion calculation requires 3 points");
        }
      }

      else if (points.length === 3) {
        const [A, B, C] = points;
        rawAngle = getAngle(A, B, C);
        drawAngleArc(ctx, A, B, C, rawAngle);
      }

      else {
        console.warn("Insufficient points for angle calculation", points);
      }
    } catch (err) {
      console.error("Error while computing/drawing angle:", err);
      rawAngle = null;
    }


    if (rawAngle !== null) {
      if (rawAngle > maxAngle.current) maxAngle.current = rawAngle;
      if (rawAngle < minAngle.current) minAngle.current = rawAngle;
      setAngle(rawAngle);
    }

  }, [selectedJoint]);

  const { holistic, ready } = useHolistic(onResults);
  const { startCamera } = useCamera(videoRef, holistic);
  useResizeCanvas(videoRef, canvasRef);

  const resetAngles = () => {
    maxAngle.current = 0;
    minAngle.current = 180;
    setAngle(null);
    forceUpdate(n => n + 1);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Header
        title="Joint Angle Tracker"
        subtitle="Use your camera to track elbow, knee, and other joint flexion in real time using MediaPipe Holistic."
        icon={"📐"}
      />
      <div className="flex flex-col items-center justify-center gap-4 mb-6 sm:flex-row sm:items-stretch">
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
        labels={selectedJoint?.labels}
        calc={selectedJoint?.calc}
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
