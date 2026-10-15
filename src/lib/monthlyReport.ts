import type { TFunction } from 'i18next';

export interface MonthlyReport {
  month: string;
  generatedAt: string;
  funding: {
    invested: number; investments: number; fees: number; investors: number; newInvestors: number;
    byProject: { title: string; amount: number; count: number }[];
    projectsFunded: number; projectsFailed: number;
  };
  payments: {
    succeeded: { count: number; amount: number }; failed: number; expired: number; cancelled: number; pending: number;
    byProvider: { provider: string; count: number; amount: number }[];
    refunds: { count: number; amount: number }; withdrawals: number;
  };
  distributions: { income: number; capital: number; count: number };
  kyc: { submitted: number; verified: number; rejected: number; pendingNow: number };
  users: { registered: number };
  support: { tickets: number; resolved: number; contacts: number; newsletter: number };
}

export interface ReportSection {
  key: string;
  title: string;
  rows: [string, string][];
  table?: { head: string[]; rows: string[][] };
}

/** Montant lisible par jsPDF (les espaces insécables de Intl ne sont pas rendus par les polices standard). */
const money = (value: number) => `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
const count = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Libellé du mois (« octobre 2026 »). */
export const monthLabel = (month: string, language: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString(language, { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Sections du rapport : source unique de l'écran et du PDF. */
export function reportSections(r: MonthlyReport, t: TFunction): ReportSection[] {
  const k = (key: string) => t(`admin.reports.rows.${key}`);
  return [
    {
      key: 'funding', title: t('admin.reports.sections.funding'),
      rows: [
        [k('invested'), money(r.funding.invested)],
        [k('investments'), count(r.funding.investments)],
        [k('investors'), count(r.funding.investors)],
        [k('newInvestors'), count(r.funding.newInvestors)],
        [k('fees'), money(r.funding.fees)],
        [k('projectsFunded'), count(r.funding.projectsFunded)],
        [k('projectsFailed'), count(r.funding.projectsFailed)],
      ],
      table: r.funding.byProject.length ? {
        head: [t('admin.reports.cols.project'), t('admin.reports.cols.investments'), t('admin.reports.cols.amount')],
        rows: r.funding.byProject.map((p) => [p.title, count(p.count), money(p.amount)]),
      } : undefined,
    },
    {
      key: 'payments', title: t('admin.reports.sections.payments'),
      rows: [
        [k('paymentsSucceeded'), `${count(r.payments.succeeded.count)} · ${money(r.payments.succeeded.amount)}`],
        [k('paymentsFailed'), count(r.payments.failed)],
        [k('paymentsExpired'), count(r.payments.expired)],
        [k('paymentsCancelled'), count(r.payments.cancelled)],
        [k('paymentsPending'), count(r.payments.pending)],
        [k('refunds'), `${count(r.payments.refunds.count)} · ${money(r.payments.refunds.amount)}`],
        [k('withdrawals'), count(r.payments.withdrawals)],
      ],
      table: r.payments.byProvider.length ? {
        head: [t('admin.reports.cols.provider'), t('admin.reports.cols.payments'), t('admin.reports.cols.amount')],
        rows: r.payments.byProvider.map((p) => [p.provider, count(p.count), money(p.amount)]),
      } : undefined,
    },
    {
      key: 'distributions', title: t('admin.reports.sections.distributions'),
      rows: [[k('income'), money(r.distributions.income)], [k('capital'), money(r.distributions.capital)], [k('distributions'), count(r.distributions.count)]],
    },
    {
      key: 'kyc', title: t('admin.reports.sections.kyc'),
      rows: [[k('kycSubmitted'), count(r.kyc.submitted)], [k('kycVerified'), count(r.kyc.verified)], [k('kycRejected'), count(r.kyc.rejected)], [k('kycPending'), count(r.kyc.pendingNow)]],
    },
    {
      key: 'community', title: t('admin.reports.sections.community'),
      rows: [[k('registered'), count(r.users.registered)], [k('tickets'), count(r.support.tickets)], [k('resolved'), count(r.support.resolved)], [k('contacts'), count(r.support.contacts)], [k('newsletter'), count(r.support.newsletter)]],
    },
  ];
}

/** Rapport mensuel PDF (même mise en page que le relevé annuel). */
export async function downloadMonthlyReport(report: MonthlyReport, t: TFunction, language: string, companyName: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const green: [number, number, number] = [20, 80, 50];
  const label = monthLabel(report.month, language);

  doc.setFillColor(...green);
  doc.rect(0, 0, 210, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(companyName.toUpperCase(), 105, 15, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(t('admin.reports.pdfTitle', { month: label }), 105, 24, { align: 'center' });
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.text(`${t('admin.reports.generated')} : ${new Date(report.generatedAt).toLocaleString(language)}`, 15, 42);

  let y = 52;
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

  for (const section of reportSections(report, t)) {
    heading(section.title);
    section.rows.forEach(([name, value]) => row([name, value], [15, 120]));
    if (section.table) {
      y += 2;
      const xs = [15, 120, 150];
      row(section.table.head, xs, true);
      section.table.rows.forEach((cells) => row(cells, xs));
    }
    y += 5;
  }
  doc.save(`${t('admin.reports.fileName')}_${report.month}.pdf`);
}
