import React, { useMemo } from "react";

interface AngleBarProps {
  angle: number | null;
  maxAngle: number;
  minAngle: number;
  label: string;
}

const ANGLE_MIN = -120;
const ANGLE_MAX = 270;
const ANGLE_RANGE = ANGLE_MAX - ANGLE_MIN;

const AngleBar = React.memo(({ angle, maxAngle, minAngle, label }: AngleBarProps) => {
  const normalize = (value: number) => Math.max(Math.min(value, ANGLE_MAX), ANGLE_MIN);

  const percentage = useMemo(() => {
    if (angle === null) return 0;
    const clamped = normalize(angle);
    return ((clamped - ANGLE_MIN) / ANGLE_RANGE) * 100;
  }, [angle]);

  const maxPercentage = useMemo(() => {
    const clamped = normalize(maxAngle);
    return ((clamped - ANGLE_MIN) / ANGLE_RANGE) * 100;
  }, [maxAngle]);

  const minPercentage = useMemo(() => {
    const clamped = normalize(minAngle);
    return ((clamped - ANGLE_MIN) / ANGLE_RANGE) * 100;
  }, [minAngle]);

  const formattedAngle = useMemo(() => {
    if (angle === null) return "Waiting for landmarks...";
    const rounded = Math.round(angle);
    return rounded < 0 ? `${Math.abs(rounded)}° hyperextension` : `${rounded}°`;
  }, [angle]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      <div className="relative h-4 bg-gray-200 rounded">
        {/* Min angle marker (green) */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-green-500"
          style={{ left: `calc(${minPercentage}% - 0.125rem)` }} // offset half width
          title={`Min Angle: ${Math.round(minAngle)}°`}
        />

        {/* Max angle marker (red) */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-red-500"
          style={{ left: `calc(${maxPercentage}% - 0.125rem)` }} // offset half width
          title={`Max Angle: ${Math.round(maxAngle)}°`}
        />

        {/* Current angle as a blue circle */}
        {angle !== null && (
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-blue-500 rounded-full border border-white shadow"
            style={{ left: `calc(${percentage}% - 0.625rem)` }} // offset half width (5/2 = 2.5 = 0.625rem)
            title={`Current Angle: ${Math.round(angle)}°`}
          />
        )}
      </div>

      <div className="text-xs text-gray-600 mt-1">
        {angle !== null
          ? `${formattedAngle} (Extension: ${Math.round(minAngle)}°, Flexion: ${Math.round(maxAngle)}°)`
          : `Waiting for landmarks... (Extension: ${Math.round(minAngle)}°, Flexion: ${Math.round(maxAngle)}°)`}
      </div>
    </div>
  );
});

export default AngleBar;