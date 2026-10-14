import type { TFunction } from 'i18next';

interface StatementLine { date: string; kind: string; project: string; amount: number; reference?: string | null; period?: string | null }
export interface Statement {
  year: number;
  generatedAt: string;
  user: { id: string; firstName: string | null; lastName: string | null; email: string } | null;
  totals: { paid: number; income: number; capital: number; refunds: number };
  positions: { title: string; invested: number; incomeReceived: number; capitalRepaid: number; state: string }[];
  lines: StatementLine[];
}

/** Montant lisible par jsPDF (les espaces insécables de Intl ne sont pas rendus par les polices standard). */
const amount = (value: number) => `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;

/** Relevé annuel PDF (justificatif) : totaux de l'année, positions et détail des opérations. */
export async function downloadAnnualStatement(statement: Statement, t: TFunction, language: string, companyName: string) {
  // Bibliothèque PDF chargée seulement au moment du téléchargement.
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  // Les années du relevé sont découpées en UTC (fuseau de la plateforme) : les dates sont affichées dans le même fuseau.
  const date = (value: string) => new Date(value).toLocaleDateString(language, { timeZone: 'UTC' });
  const green: [number, number, number] = [20, 80, 50];

  doc.setFillColor(...green);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(companyName.toUpperCase(), 105, 15, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(t('portfolio.statement.pdfTitle', { year: statement.year }), 105, 24, { align: 'center' });

  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  const name = `${statement.user?.firstName ?? ''} ${statement.user?.lastName ?? ''}`.trim();
  doc.text(`${t('portfolio.statement.investor')} : ${name || statement.user?.email || ''}`, 15, 44);
  doc.text(`${t('portfolio.statement.email')} : ${statement.user?.email ?? ''}`, 15, 50);
  doc.text(`${t('portfolio.statement.generated')} : ${date(statement.generatedAt)}`, 140, 44);

  let y = 62;
  const heading = (text: string) => {
    if (y > 255) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...green);
    doc.setFontSize(12);
    doc.text(text, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    y += 7;
  };
  const row = (cells: string[], xs: number[], bold = false) => {
    if (y > 275) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    cells.forEach((c, i) => {
      const parts: string[] = doc.splitTextToSize(c, (xs[i + 1] ?? 195) - xs[i] - 3);
      doc.text(parts.length > 1 ? `${parts[0].replace(/\s+$/, '')}…` : parts[0] ?? '', xs[i], y);
    });
    y += 6;
  };

  heading(t('portfolio.statement.totals'));
  const totals: [string, number][] = [
    [t('portfolio.statement.paid'), statement.totals.paid],
    [t('portfolio.statement.income'), statement.totals.income],
    [t('portfolio.statement.capital'), statement.totals.capital],
    [t('portfolio.statement.refunds'), statement.totals.refunds],
  ];
  totals.forEach(([label, value]) => row([label, amount(value)], [15, 120]));

  y += 4;
  heading(t('portfolio.statement.positions'));
  const posX = [15, 95, 130, 165];
  row([t('portfolio.columns.project'), t('portfolio.columns.invested'), t('portfolio.columns.income'), t('portfolio.columns.capital')], posX, true);
  statement.positions.forEach((p) => row([p.title, amount(p.invested), amount(p.incomeReceived), amount(p.capitalRepaid)], posX));

  y += 4;
  heading(t('portfolio.statement.operations'));
  const opX = [15, 40, 85, 150];
  row([t('portfolio.columns.date'), t('portfolio.columns.operation'), t('portfolio.columns.project'), t('portfolio.columns.amount')], opX, true);
  if (!statement.lines.length) row([t('portfolio.statement.noOperation')], [15]);
  statement.lines.forEach((l) => row([date(l.date), t(`portfolio.kinds.${l.kind}`), l.period ? `${l.project} (${l.period})` : l.project, amount(l.amount)], opX));

  y += 6;
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text(doc.splitTextToSize(t('portfolio.statement.disclaimer'), 180), 15, y);

  doc.save(`${t('portfolio.statement.fileName')}_${statement.year}.pdf`);
}
