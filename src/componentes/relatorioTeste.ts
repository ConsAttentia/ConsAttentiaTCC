export type TestReport = {
  userName: string;
  email: string;
  testName: string;
  score: number;
  attempts: number;
  duration: string;
  details?: Array<[string, string]>;
};

export async function shareTestReport(report: TestReport) {
  const { jsPDF } = await import("jspdf");
  const document = new jsPDF();
  const pageWidth = document.internal.pageSize.getWidth();

  document.setFillColor(23, 110, 85);
  document.rect(0, 0, pageWidth, 42, "F");
  document.setTextColor(255, 255, 255);
  document.setFont("helvetica", "bold");
  document.setFontSize(20);
  document.text("ConsAttentia", 20, 20);
  document.setFont("helvetica", "normal");
  document.setFontSize(10);
  document.text("Relatório de atividade de atenção", 20, 30);

  document.setTextColor(30, 54, 48);
  document.setFont("helvetica", "bold");
  document.setFontSize(16);
  document.text(report.testName, 20, 62);

  const rows: Array<[string, string]> = report.details ?? [
    ["Nome", report.userName],
    ["Email", report.email],
    ["Pontuação", `${report.score} pontos`],
    ["Tentativas", String(report.attempts)],
    ["Tempo total", report.duration],
  ];

  let y = 82;
  rows.forEach(([label, value]) => {
    document.setFont("helvetica", "bold");
    document.setFontSize(10);
    document.setTextColor(86, 111, 101);
    document.text(label.toUpperCase(), 20, y);
    document.setFont("helvetica", "normal");
    document.setFontSize(13);
    document.setTextColor(30, 54, 48);
    const wrapped = document.splitTextToSize(value || "Não informado", pageWidth - 40);
    document.text(wrapped, 20, y + 7);
    y += Math.max(19, wrapped.length * 6 + 12);
    document.setDrawColor(222, 232, 226);
    document.line(20, y - 3, pageWidth - 20, y - 3);
  });

  document.setFontSize(8);
  document.setTextColor(110, 124, 118);
  document.text("Documento informativo gerado pelo ConsAttentia.", 20, 278);

  const fileName = `relatorio-${report.testName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
  const blob = document.output("blob");
  const file = new File([blob], fileName, { type: "application/pdf" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: `Relatório ${report.testName}`, files: [file] });
    return "shared" as const;
  }

  document.save(fileName);
  return "downloaded" as const;
}