import React, { useMemo } from "react";

interface AngleBarProps {
  angle: number | null;
  maxAngle: number;
  minAngle: number;
  label: string;
}

const AngleBar = React.memo(({ angle, maxAngle, minAngle, label }: AngleBarProps) => {
  const percentage = useMemo(() => (angle !== null ? Math.min((angle / 360) * 100, 100) : 0), [angle]);
  const maxPercentage = useMemo(() => Math.min((maxAngle / 360) * 100, 100), [maxAngle]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative h-2 bg-gray-200 rounded">
        <div className="absolute top-0 h-2 w-1 bg-red-500" style={{ left: `${maxPercentage}%` }} />
        {angle !== null && (
          <div className="absolute top-0 h-2 w-1 bg-blue-500" style={{ left: `${percentage}%` }} />
        )}
      </div>
      <div className="text-xs text-gray-600 mt-1">
        {angle !== null
          ? `${Math.round(angle)}° (Extension: ${Math.round(minAngle)}°, Flexion: ${Math.round(maxAngle)}°)`
          : `Waiting for landmarks... (Extension: ${Math.round(minAngle)}°, Flexion: ${Math.round(maxAngle)}°)`}
      </div>
    </div>
  );
});

export default AngleBar;
