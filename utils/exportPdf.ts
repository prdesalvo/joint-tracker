import jsPDF from "jspdf";

export function exportSnapshotsToPDF(snapshots: {
  image: string;
  label: string;
  angle: number | null;
  timestamp: number;
}[]) {
  const doc = new jsPDF();

  snapshots.forEach((shot, i) => {
    if (i > 0) doc.addPage();

    const time = new Date(shot.timestamp).toLocaleString();

    doc.setFontSize(14);
    doc.text(`Measurement: ${shot.label}`, 10, 15);
    doc.text(`Angle: ${Math.round(shot.angle ?? 0)}°`, 10, 23);
    doc.text(`Timestamp: ${time}`, 10, 31);

    // Add image (scale to fit within the page)
    doc.addImage(shot.image, "PNG", 10, 40, 180, 120);
  });

  doc.save("pose_session_report.pdf");
}
