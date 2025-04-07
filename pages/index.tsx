// pages/index.tsx
import React from "react";
import PoseWithMediaPipe from "../components/PoseWithMediaPipe";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">Pose Tracker</h1>
      <PoseWithMediaPipe />
    </main>
  );
}
