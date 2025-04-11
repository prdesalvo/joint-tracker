import React, { useMemo } from "react";

interface AngleBarProps {
  angle: number | null;
  maxAngle: number | null; // ← allow null
  minAngle: number | null; // ← allow null
  label: string;
  labels?: {
    min: string;
    max: string;
  };
  calc?: string;
  range?: { good: number; fair: number; poor: number };
}

const ANGLE_MIN = -270;
const ANGLE_MAX = 270;
const ANGLE_RANGE = ANGLE_MAX - ANGLE_MIN;

function getPerformanceColor(angle: number | null, range?: { good: number; fair: number; poor: number }) {
  if (angle === null || !range) return "bg-gray-400";

  if (angle >= range.good) return "bg-green-500";
  if (angle >= range.fair) return "bg-yellow-400";
  if (angle >= range.poor) return "bg-red-500";

  return "bg-gray-400";
}


const AngleBar = React.memo(({ angle, maxAngle, minAngle, label, labels, calc, range }: AngleBarProps) => {
  const normalize = (value: number) => Math.max(Math.min(value, ANGLE_MAX), ANGLE_MIN);

  const percentage = useMemo(() => {
    if (angle === null) return 0;
    const clamped = normalize(angle);
    return ((clamped - ANGLE_MIN) / ANGLE_RANGE) * 100;
  }, [angle]);

  const maxPercentage = useMemo(() => {
    if (maxAngle === null) return 0;
    const clamped = normalize(maxAngle);
    return ((clamped - ANGLE_MIN) / ANGLE_RANGE) * 100;
  }, [maxAngle]);

  const minPercentage = useMemo(() => {
    if (minAngle === null) return 0;
    const clamped = normalize(minAngle);
    return ((clamped - ANGLE_MIN) / ANGLE_RANGE) * 100;
  }, [minAngle]);


  const formattedAngle = useMemo(() => {
    if (angle === null) return "Waiting for landmarks...";
    const rounded = Math.round(angle);

    if (calc === "Flexion" && rounded < 0) {
      return `${rounded}° hyperextension`;
    }

    return `${rounded}°`;
  }, [angle, calc]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      <div className="relative h-4 bg-gray-200 rounded">
        {/* 0° center marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
          style={{ left: `calc(${(0 - ANGLE_MIN) / ANGLE_RANGE * 100}% - 0.0625rem)` }}
          title="Neutral (0°)"
        />

        {/* 0° label */}
        <div
          className="absolute text-[10px] text-gray-600"
          style={{
            top: "1.25rem", // below the bar
            left: `calc(${(0 - ANGLE_MIN) / ANGLE_RANGE * 100}% - 0.5rem)`,
          }}
        >
          0°
        </div>

        {/* Min angle marker */}
        {minAngle !== null && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-blue-400"
            style={{ left: `calc(${minPercentage}% - 0.125rem)` }}
            title={`Min Angle: ${Math.round(minAngle)}°`}
          />
        )}

        {/* Max angle marker */}
        {maxAngle !== null && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-purple-400"
            style={{ left: `calc(${maxPercentage}% - 0.125rem)` }}
            title={`Max Angle: ${Math.round(maxAngle)}°`}
          />
        )}

        {/* Current angle as a blue circle */}
        {angle !== null && (
          <div
            className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full border border-white shadow ${getPerformanceColor(angle, range)}`}
            style={{ left: `calc(${percentage}% - 0.625rem)` }}
            title={`Current Angle: ${Math.round(angle)}°`}
          />
        )}

      </div>

      <div className="text-xs text-gray-600 mt-1">
        {angle !== null
          ? `${formattedAngle} (${labels?.min ?? "Extension"}: ${minAngle !== null ? Math.round(minAngle) : "-"
          }°, ${labels?.max ?? "Flexion"}: ${maxAngle !== null ? Math.round(maxAngle) : "-"
          }°)`
          : `Waiting for landmarks... (${labels?.min ?? "Extension"}: ${minAngle !== null ? Math.round(minAngle) : "-"
          }°, ${labels?.max ?? "Flexion"}: ${maxAngle !== null ? Math.round(maxAngle) : "-"
          }°)`}
      </div>


    </div>
  );
});

export default AngleBar;