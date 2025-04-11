import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import NavHeader from "../components/NavHeader";
import Footer from "../components/Footer";
import AngleBar from "../components/AngleBar";
import { joints } from "../hooks/jointConfig";
import { computeYawFromNose, getAngle, getFlexionAngle, getTiltAngle, drawAngleArc, drawTiltAngleArc, drawYawArc } from "../utils/geometry";
import { useHolistic } from "../hooks/useHolistic";
import { useCamera } from "../hooks/useCamera";
import { useResizeCanvas } from "../hooks/useResizeCanvas";
import { drawPoseAnnotations } from "../utils/mediapipeDrawing";
import { capturePoseSnapshot } from "../utils/capture";
import { exportSnapshotsToPDF } from "../utils/exportPdf";



export default function PoseTrackerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, forceUpdate] = useState(0);
  const [selectedJointId, setSelectedJointId] = useState("headTilt");
  const selectedJointIdRef = useRef(selectedJointId);
  const [patientName, setPatientName] = useState("Test Patient");
  const [sessionDate, setSessionDate] = useState(() =>
    new Date().toISOString().substring(0, 10)
  );
  const [snapshots, setSnapshots] = useState<
    { image: string; angle: number | null; label: string; timestamp: number }[]
  >([]);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showDelayPicker, setShowDelayPicker] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setCameras(videoInputs);

      // ✅ Only assign default camera on first load
      setSelectedDeviceId((currentId) => {
        if (!currentId && videoInputs.length > 0) {
          return videoInputs[0].deviceId;
        }
        return currentId;
      });
    });
  }, []);




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
  const maxAngle = useRef<number | null>(null);
  const minAngle = useRef<number | null>(null);

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
      if (maxAngle.current === null || rawAngle > maxAngle.current) {
        maxAngle.current = rawAngle;
      }

      if (minAngle.current === null || rawAngle < minAngle.current) {
        minAngle.current = rawAngle;
      }
    }

    setAngle(rawAngle);

  }, [selectedJoint]);

  const { holistic, ready } = useHolistic(onResults);
  console.log("Holistic ready?", ready);
  // const { startCamera } = useCamera(videoRef, holistic);
  const { startCamera, stopCamera, cameraStarted } = useCamera(videoRef, holistic, selectedDeviceId);

  useResizeCanvas(videoRef, canvasRef);

  const handleToggleCamera = async () => {
    if (!ready) return;
    if (cameraStarted) {
      stopCamera();
    } else {
      await startCamera(); 
    }
  };


  const resetAngles = () => {
    maxAngle.current = null;
    minAngle.current = null;
    setAngle(null);
    forceUpdate(n => n + 1);
  };

  const handleDelayedSnapshot = () => {
    if (delaySeconds === 0) {
      doCapture();
      return;
    }

    let seconds = delaySeconds;
    setCountdown(seconds);

    const countdownInterval = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);

      if (seconds === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        doCapture();
      }
    }, 1000);
  };

  const doCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !selectedJoint) return;

    const image = capturePoseSnapshot(video, canvas);
    if (!image) return;

    setSnapshots((prev) => [
      ...prev,
      {
        image,
        angle,
        label: selectedJoint.label,
        timestamp: Date.now(),
        range: selectedJoint.range, // Add range to the snapshot
      },
    ]);
    
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (cameraStarted && selectedDeviceId) {
      timeout = setTimeout(() => {
        stopCamera();
        startCamera();
      }, 250); // wait a bit to avoid rapid toggling
    }
    return () => clearTimeout(timeout);
  }, [selectedDeviceId]);



  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 max-w-3xl mx-auto"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <NavHeader />

        <br></br>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center gap-4 mb-6 sm:flex-row sm:items-stretch"
      >
        <select
          value={selectedJointId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedJointId(e.target.value)}
          className="border p-2 rounded hover:scale-102 transition-transform"
        >
          {joints.map((joint) => (
            <option key={joint.id} value={joint.id}>
              {joint.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleToggleCamera}
          className={`${cameraStarted ? "bg-red-600" : "bg-blue-600"} text-white px-4 py-2 rounded hover:scale-105 active:scale-95 transition-transform`}
        >
          {cameraStarted ? "Stop Camera" : "Start Camera"}
        </button>

        {cameras.length > 1 && (
          <select
            value={selectedDeviceId ?? ""}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="border p-2 rounded text-sm"
          >
            {cameras.map((cam) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `Camera ${cam.deviceId.slice(-4)}`}
              </option>
            ))}
          </select>
        )}

        
        <button
          onClick={resetAngles}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:scale-105 active:scale-95 transition-transform"
        >
          Reset Max Angles
        </button>
      </motion.div>

      <div className="flex flex-col items-center justify-center gap-4 mb-6 sm:flex-row sm:items-stretch">
        <div className="relative flex items-center gap-2">
          {/* Snapshot button */}
          <button
            onClick={handleDelayedSnapshot}
            disabled={countdown !== null}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {countdown !== null ? `Capturing in ${countdown}` : "Capture Snapshot"}
          </button>

          {/* Arrow to open delay menu */}
          <button
            onClick={() => setShowDelayPicker((prev) => !prev)}
            className="bg-green-700 text-white px-2 py-2 rounded"
            aria-label="Set delay"
          >
            ⏱️
          </button>

          {/* Inline delay picker */}
          {showDelayPicker && (
            <div className="absolute top-full mt-2 left-0 bg-white border rounded shadow-md p-2 z-10">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Delay:</span>
                <button
                  onClick={() => setDelaySeconds(Math.max(0, delaySeconds - 1))}
                  className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  −
                </button>
                <span className="w-6 text-center">{delaySeconds}s</span>
                <button
                  onClick={() => setDelaySeconds(delaySeconds + 1)}
                  className="px-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>


        {snapshots.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => exportSnapshotsToPDF(snapshots, patientName, sessionDate)}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Download PDF Report
          </motion.button>
        )}
      </div>

      {selectedJoint && (
        <div className="bg-blue-50 p-4 rounded border border-blue-200 text-sm mb-4">
          <h3 className="font-semibold text-blue-800 mb-1">
            Instructions for: {selectedJoint.label}
          </h3>
          <p><strong>What:</strong> {selectedJoint.instructions}</p>
          <p><strong>Position:</strong> {selectedJoint.positioning}</p>
          <p><strong>Visibility:</strong> {selectedJoint.visibility}</p>
        </div>
      )}


      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <AngleBar
          label={selectedJoint?.label ?? ""}
          angle={angle}
          maxAngle={maxAngle.current}
          minAngle={minAngle.current}
          labels={selectedJoint?.labels}
          calc={selectedJoint?.calc}
          range={selectedJoint?.range}
        />

        {!visible && selectedJoint?.visibility && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-lg mb-2"
          >
            {selectedJoint.visibility}
          </motion.div>
        )}

        <div className="relative">
          <video ref={videoRef} playsInline className="w-full" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >

        {snapshots.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Captured Snapshots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {snapshots.map((shot, idx) => (
                <div key={idx} className="border p-2 rounded shadow">
                  <img src={shot.image} alt={`Snapshot ${idx}`} className="w-full" />
                  <div className="text-sm mt-2">
                    <strong>{shot.label}</strong>: {Math.round(shot.angle ?? 0)}°
                    <br />
                    {new Date(shot.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        
        <Footer />
      </motion.div>
    </motion.div>
  );
}