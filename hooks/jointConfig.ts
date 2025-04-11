export const joints = [
  {
    id: "headTilt",
    label: "Head Tilt (Roll)",
    indices: [33, 263],
    type: "face",
    calc: "tilt",
    labels: {
      min: "Left Tilt",
      max: "Right Tilt",
    },
    range: {
      good: 45,
      fair: 38.25,
      poor: 31.5,
    },
    instructions: "Tilt your head side to side, like trying to bring your ear toward your shoulder.",
    positioning: "Face the camera directly with your shoulders level.",
    visibility: "Your full face should be visible, including both outer eye corners."
  },
  {
    id: "headRotation",
    label: "Head Rotation (Yaw)",
    indices: [234, 1, 454],
    type: "face",
    calc: "yawFromNose",
    labels: {
      min: "Looking Left",
      max: "Looking Right",
    },
    range: {
      good: 90.0,
      fair: 76.5,
      poor: 63.3,
    },
    instructions: "Rotate your head left and right like you're checking over each shoulder.",
    positioning: "Sit or stand upright facing the camera with your shoulders squared.",
    visibility: "Ensure your nose and both sides of your face are visible."
  },
    {
      id: "neckFlexion",
      label: "Neck Flexion/Extension",
      indices: [10, 4, 152],
      type: "face",
      calc: "Flexion",
      labels: {
        min: "Extension (Look Up)",
        max: "Flexion (Look Down)",
      },
      range: {
        good: 80,
        fair: 68,
        poor: 56,
      },
      instructions: "Nod your head up and down to measure your neck's range of motion.",
      positioning: "Sit or stand facing the camera with your body aligned vertically.",
      visibility: "Your full face, including forehead, nose, and chin, must be visible."
    },
    {
    id: "leftElbow",
    label: "Left Elbow",
    indices: [15, 13, 11],
    type: "pose",
    calc: "Flexion",
    labels: {
      min: "Extension",
      max: "Flexion",
    },
    range: {
      good: 145.0,
      fair: 123.25,
      poor: 101.5,
    },
    instructions: "Bend and straighten your left elbow as far as possible.",
    positioning: "Turn your left side to the camera so your full arm is visible in profile.",
    visibility: "Your left shoulder, elbow, and wrist should all be clearly visible."
  },
  {
    id: "rightElbow",
    label: "Right Elbow",
    indices: [12, 14, 16],
    type: "pose",
    calc: "Flexion",
    labels: {
      min: "Extension",
      max: "Flexion",
    },
    range: {
      good: 145.0,
      fair: 123.25,
      poor: 101.5,
    },
    instructions: "Bend and straighten your right elbow as far as possible.",
    positioning: "Turn your right side to the camera so your full arm is visible in profile.",
    visibility: "Your right shoulder, elbow, and wrist should all be clearly visible."
  },
  {
    id: "leftKnee",
    label: "Left Knee",
    indices: [27, 25, 23],
    type: "pose",
    calc: "Flexion",
    labels: {
      min: "Extension",
      max: "Flexion",
    },
    range: {
      good: 140.0,
      fair: 119.0,
      poor: 98.0,
    },
    instructions: "Bend and extend your left knee as if doing a seated leg curl.",
    positioning: "Position your left side toward the camera, standing or seated with a visible leg.",
    visibility: "Your left hip, knee, and ankle must all be in the camera's view."
  },
  {
    id: "rightKnee",
    label: "Right Knee",
    indices: [24, 26, 28],
    type: "pose",
    calc: "Flexion",
    labels: {
      min: "Extension",
      max: "Flexion",
    },
    range: {
      good: 140.0,
      fair: 119.0,
      poor: 98.0,
    },
    instructions: "Bend and extend your right knee to assess its range of motion.",
    positioning: "Position your right side toward the camera, standing or seated.",
    visibility: "Ensure your right hip, knee, and ankle are visible and not occluded."
  },
  {
    id: "leftShoulderAbduction",
    label: "Left Shoulder Abduction",
    indices: [23, 11, 13],
    type: "pose",
    calc: "None",
    labels: {
      min: "Arm Down",
      max: "Arm Raised",
    },
    range: {
      good: 180,
      fair: 160,
      poor: 100,
    },
    instructions: "Raise your left arm straight out to the side and upward, then lower it.",
    positioning: "Stand facing slightly to the right so the left shoulder and arm are visible.",
    visibility: "Your left hip, shoulder, and elbow should all be clearly seen."
  },
  {
    id: "rightShoulderAbduction",
    label: "Right Shoulder Abduction",
    indices: [14, 12, 24],
    type: "pose",
    calc: "None",
    labels: {
      min: "Arm Down",
      max: "Arm Raised",
    },
    range: {
      good: 180.0,
      fair: 160.0,
      poor: 100.0,
    },
    instructions: "Raise your right arm straight out to the side and upward, then lower it.",
    positioning: "Stand facing slightly to the left so the right arm is in view.",
    visibility: "Make sure the right shoulder, elbow, and hip landmarks are visible."
  },
  {
    id: "leftHipFlexion",
    label: "Left Hip Flexion",
    indices: [25, 23, 11],
    type: "pose",
    calc: "Flexion",
    labels: {
      min: "Extension",
      max: "Flexion",
    },
    range: {
      good: 135.0,
      fair: 114.75,
      poor: 94.5,
    },
    instructions: "Lift your left leg upward in front of you while keeping your upper body upright.",
    positioning: "Face your left side toward the camera so the leg motion is visible.",
    visibility: "Your left shoulder, hip, and knee should all be tracked clearly."
  },
  {
    id: "rightHipFlexion",
    label: "Right Hip Flexion",
    indices: [12, 24, 26],
    type: "pose",
    calc: "Flexion",
    labels: {
      min: "Extension",
      max: "Flexion",
    },
    range: {
      good: 135.0,
      fair: 114.75,
      poor: 94.5,
    },
    instructions: "Lift your right leg forward and then return to standing.",
    positioning: "Face your right side toward the camera to expose the full right leg.",
    visibility: "Ensure the right shoulder, hip, and knee are unobstructed and in view."
  },
];
