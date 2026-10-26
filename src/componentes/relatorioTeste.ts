export type TestReport = {
  userName: string;
  email: string;
  testName: string;
  score: number;
  attempts: number;
  duration: string;
  details?: Array<[string, string]>;
};

const margin = 20;
const headerHeight = 40;
const footerHeight = 18;
const rowPadding = 5;

export async function createTestReportPdf(report: TestReport): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const document = new jsPDF();
  const pageHeight = document.internal.pageSize.getHeight();
  const pageWidth = document.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  const footerTop = pageHeight - footerHeight;
  let y = headerHeight + 14;

  const drawHeader = () => {
    document.setFillColor(23, 110, 85);
    document.rect(0, 0, pageWidth, headerHeight, "F");
    document.setTextColor(255, 255, 255);
    document.setFont("helvetica", "bold");
    document.setFontSize(19);
    document.text("ConsAttentia", margin, 18);
    document.setFont("helvetica", "normal");
    document.setFontSize(9);
    document.text("Relatório de atividade", margin, 29);
  };

  const startPage = (continuation = false) => {
    document.addPage();
    drawHeader();
    y = headerHeight + 14;
    if (continuation) {
      document.setFont("helvetica", "normal");
      document.setFontSize(9);
      document.setTextColor(110, 124, 118);
      document.text("Continuação", margin, y);
      y += 9;
    }
  };

  const rows: Array<[string, string]> = report.details ?? [
    ["Nome", report.userName],
    ["Email", report.email],
    ["Pontuação", `${report.score} pontos`],
    ["Tentativas", String(report.attempts)],
    ["Tempo total", report.duration],
  ];

  drawHeader();
  document.setTextColor(30, 54, 48);
  document.setFont("helvetica", "bold");
  document.setFontSize(17);
  const titleLines = document.splitTextToSize(report.testName, contentWidth);
  titleLines.forEach((line: string) => {
    if (y + 9 > footerTop) startPage(true);
    document.setFont("helvetica", "bold");
    document.setFontSize(17);
    document.setTextColor(30, 54, 48);
    document.text(line, margin, y);
    y += 9;
  });
  y += 5;

  rows.forEach(([label, value]) => {
    document.setFont("helvetica", "bold");
    document.setFontSize(9);
    const labelLines = document.splitTextToSize(label.toLocaleUpperCase("pt-BR"), contentWidth - rowPadding * 2);
    document.setFont("helvetica", "normal");
    document.setFontSize(11);
    const valueLines: string[] = document.splitTextToSize(value || "Não informado", contentWidth - rowPadding * 2);
    const labelHeight = labelLines.length * 4.5;
    const valueLineHeight = 5.5;
    const firstPageCapacity = Math.max(
      1,
      Math.floor((footerTop - y - labelHeight - rowPadding * 3) / valueLineHeight),
    );

    if (y + labelHeight + Math.min(valueLines.length, firstPageCapacity) * valueLineHeight + rowPadding * 3 > footerTop) {
      startPage(true);
    }

    let lineIndex = 0;
    let firstChunk = true;
    while (lineIndex < valueLines.length) {
      document.setFont("helvetica", "bold");
      document.setFontSize(9);
      const currentLabelLines = firstChunk
        ? labelLines
        : document.splitTextToSize(`${label} (continuação)`.toLocaleUpperCase("pt-BR"), contentWidth - rowPadding * 2);
      const currentLabelHeight = currentLabelLines.length * 4.5;
      const availableLines = Math.floor((footerTop - y - currentLabelHeight - rowPadding * 3) / valueLineHeight);

      if (availableLines < 1) {
        startPage(true);
        continue;
      }

      const chunk = valueLines.slice(lineIndex, lineIndex + availableLines);
      const cardHeight = currentLabelHeight + chunk.length * valueLineHeight + rowPadding * 3;
      document.setFillColor(242, 247, 244);
      document.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, "F");
      document.setFillColor(43, 149, 105);
      document.rect(margin, y, 1.2, cardHeight, "F");
      document.setFont("helvetica", "bold");
      document.setFontSize(9);
      document.setTextColor(86, 111, 101);
      document.text(currentLabelLines, margin + rowPadding, y + rowPadding + 3);
      document.setFont("helvetica", "normal");
      document.setFontSize(11);
      document.setTextColor(30, 54, 48);
      document.text(chunk, margin + rowPadding, y + rowPadding + currentLabelHeight + 3);

      y += cardHeight + 4;
      lineIndex += chunk.length;
      firstChunk = false;

      if (lineIndex < valueLines.length) startPage(true);
    }
  });

  const pageCount = document.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    document.setPage(page);
    document.setDrawColor(222, 232, 226);
    document.line(margin, footerTop, pageWidth - margin, footerTop);
    document.setFont("helvetica", "normal");
    document.setFontSize(8);
    document.setTextColor(110, 124, 118);
    document.text("Documento informativo gerado pelo ConsAttentia.", margin, footerTop + 7);
    document.text(`${page} / ${pageCount}`, pageWidth - margin, footerTop + 7, { align: "right" });
  }

  return document.output("blob");
}

export function getTestReportFileName(testName: string) {
  const safeName = testName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `relatorio-${safeName || "atividade"}.pdf`;
}

export async function shareTestReport(report: TestReport) {
  const blob = await createTestReportPdf(report);
  const fileName = getTestReportFileName(report.testName);
  const file = new File([blob], fileName, { type: "application/pdf" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: `Relatório ${report.testName}`, files: [file] });
    return "shared" as const;
  }

  const downloadUrl = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = downloadUrl;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  return "downloaded" as const;
}