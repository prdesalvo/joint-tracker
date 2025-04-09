export const joints = [
  {
    id: "headTilt",
    label: "Head Tilt (Roll)",
    indices: [33, 263], // outer left eye, outer right eye
    type: "face",
    calc: "tilt",
    labels: {
      min: "Left",
      max: "Right",
    }
  },
  {
    id: "headRotation",
    label: "Head Rotation (Yaw)",
    indices: [234, 1, 454], // left cheek → nose → right cheek
    type: "face",
    calc: "yawFromNose",
    labels: {
      min: "Left",
      max: "Right",
    }
  },
  {
    id: "leftElbow",
    label: "Left Elbow",
    indices: [15, 13, 11], // wrist, elbow, shoulder (flipped to correct sign)
    type: "pose",
    calc: "Flexion",
    labels: {
      min: "Extension",
      max: "Flexion",
    }
  },
  {
    id: "rightElbow",
    label: "Right Elbow",
    indices: [12, 14, 16], // shoulder, elbow, wrist
    type: "pose",
    calc: "Flexion",
    labels: {
      min: "Extension",
      max: "Flexion",
    }
  },
  {
    id: "leftKnee",
    label: "Left Knee",
    indices: [23, 25, 27], // hip, knee, ankle
    type: "pose",
    calc: "Flexion",
    labels: {
      min: "Extension",
      max: "Flexion",
    }
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
    }
  },
  {
    id: "leftShoulderAbduction",
    label: "Left Shoulder Abduction",
    indices: [23, 11, 13], // hip, shoulder, elbow
    type: "pose",
    calc: "None",
    labels: {
      min: "Extension",
      max: "Flexion",
    }
  },
  {
    id: "rightShoulderAbduction",
    label: "Right Shoulder Abduction",
    indices: [14, 12, 24], // elbow, shoulder, hip
    type: "pose",
    calc: "None",
    labels: {
      min: "Extension",
      max: "Flexion",
    }
  },
  {
    id: "leftHipFlexion",
    label: "Left Hip Flexion",
    indices: [11, 23, 25], // shoulder, hip, knee
    type: "pose",
    calc: "None",
    labels: {
      min: "Extension",
      max: "Flexion",
    }
  },
  {
    id: "rightHipFlexion",
    label: "Right Hip Flexion",
    indices: [12, 24, 26],
    type: "pose",
    calc: "None",
    labels: {
      min: "Extension",
      max: "Flexion",
    }
  },
];
