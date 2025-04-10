import jsPDF from "jspdf";

export function exportSnapshotsToPDF(
  snapshots: {
    image: string;
    label: string;
    angle: number | null;
    timestamp: number;
  }[],
  patientName: string,
  sessionDate: string
) {
  const doc = new jsPDF();

  // Title page
  doc.setFontSize(18);
  doc.text("Joint Movement Session Report", 10, 30);
  doc.setFontSize(14);
  doc.text(`Patient: ${patientName || "Unnamed"}`, 10, 45);
  doc.text(`Date: ${sessionDate}`, 10, 53);
  doc.text(`Snapshots captured: ${snapshots.length}`, 10, 61);
  doc.setFontSize(12);
  doc.text("Each page shows the pose at time of capture with angle and joint info.", 10, 75);

  // Measurements pages
  snapshots.forEach((shot, i) => {
    doc.addPage();

    const time = new Date(shot.timestamp).toLocaleString();

    doc.setFontSize(14);
    doc.text(`Measurement: ${shot.label}`, 10, 15);
    doc.text(`Angle: ${Math.round(shot.angle ?? 0)}°`, 10, 23);
    doc.text(`Timestamp: ${time}`, 10, 31);
    doc.addImage(shot.image, "PNG", 10, 40, 180, 120);
  });

  doc.save("pose_session_report.pdf");
}
