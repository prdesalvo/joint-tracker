import jsPDF from "jspdf";

export function exportSnapshotsToPDF(
  snapshots: {
    image: string;
    label: string;
    angle: number | null;
    timestamp: number;
    range?: { good: number; fair: number; poor: number };
  }[],
  patientName: string,
  sessionDate: string
) {
  const doc = new jsPDF();

  const getPerformanceLabel = (
    angle: number,
    range?: { good: number; fair: number; poor: number }
  ): string => {
    if (!range) return "Not Rated";
    if (angle >= range.good) return "Good";
    if (angle >= range.fair) return "Fair";
    if (angle >= range.poor) return "Poor";
    return "Very Poor";
  };

  // Cover page
  doc.setFontSize(18);
  doc.text("Joint Movement Session Report", 10, 30);
  doc.setFontSize(14);
  doc.text(`Patient: ${patientName || "Unnamed"}`, 10, 45);
  doc.text(`Date: ${sessionDate}`, 10, 53);
  doc.text(`Snapshots captured: ${snapshots.length}`, 10, 61);
  doc.setFontSize(12);
  doc.text("Each page shows the pose at time of capture with angle and performance rating.", 10, 75);

  // Snapshot pages
  snapshots.forEach((shot, i) => {
    doc.addPage();

    const time = new Date(shot.timestamp).toLocaleString();
    const angle = Math.round(shot.angle ?? 0);
    const rating = getPerformanceLabel(angle, shot.range);

    doc.setFontSize(14);
    doc.text(`Measurement: ${shot.label}`, 10, 15);
    doc.text(`Angle: ${angle}°`, 10, 23);
    doc.text(`Performance: ${rating}`, 10, 31);
    doc.text(`Timestamp: ${time}`, 10, 39);

    if (shot.range) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100);

      doc.text(
        `Target Ranges: Good >= ${shot.range.good}°, Fair >= ${shot.range.fair}°, Poor >= ${shot.range.poor}°`,
        10,
        47
      );

      doc.setTextColor(0);

    }

    doc.addImage(shot.image, "PNG", 10, 50, 180, 120);
  });

  doc.save("pose_session_report.pdf");
}
