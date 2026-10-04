"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Hourglass,
  Megaphone,
  RefreshCw,
  Receipt,
  Wallet,
  XCircle,
} from "lucide-react";

type PaymentStatus =
  | "PENDING_PAYMENT"
  | "ESCROW_LOCKED"
  | "SUBMITTED"
  | "COMPLETED"
  | "REFUNDED";

interface BrandLedgerItem {
  id: string;
  razorpayOrderId: string | null;
  campaignId: string;
  campaignTitle: string;
  companyName: string;
  amount: number;
  createdAt: string;
  status: PaymentStatus;
  applicantCount: number;
}

interface BrandPaymentsSummary {
  totalSpent: number;
  inEscrow: number;
  pendingPayment: number;
  refunded: number;
  totalInvoices: number;
  ledger: BrandLedgerItem[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function ledgerStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Awaiting payment";
    case "ESCROW_LOCKED":
      return "In escrow / processing";
    case "SUBMITTED":
      return "Reviewing deliverables";
    case "COMPLETED":
      return "Paid — released";
    case "REFUNDED":
      return "Refunded";
  }
}

function ledgerStatusStyles(status: PaymentStatus): string {
  switch (status) {
    case "PENDING_PAYMENT":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "ESCROW_LOCKED":
      return "border-indigo-200 bg-indigo-50 text-indigo-800";
    case "SUBMITTED":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "REFUNDED":
      return "border-rose-200 bg-rose-50 text-rose-800";
  }
}

function ledgerStatusIcon(status: PaymentStatus) {
  switch (status) {
    case "PENDING_PAYMENT":
      return CreditCard;
    case "ESCROW_LOCKED":
      return Hourglass;
    case "SUBMITTED":
      return RefreshCw;
    case "COMPLETED":
      return CheckCircle2;
    case "REFUNDED":
      return XCircle;
  }
}

function transactionIdDisplay(item: BrandLedgerItem): string {
  if (item.razorpayOrderId) return item.razorpayOrderId;
  return `INV-${item.id.slice(0, 8).toUpperCase()}`;
}

interface StatCardProps {
  icon: typeof Wallet;
  label: string;
  value: string;
  caption: string;
  tone?: "default" | "success" | "pending" | "escrow" | "refund";
}

function StatCard({ icon: Icon, label, value, caption, tone = "default" }: StatCardProps) {
  const toneStyles =
    tone === "success"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : tone === "pending"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : tone === "escrow"
          ? "text-indigo-700 bg-indigo-50 border-indigo-200"
          : tone === "refund"
            ? "text-rose-700 bg-rose-50 border-rose-200"
            : "text-slate-700 bg-slate-50 border-slate-200";

  return (
    <div className="flex items-start justify-between border border-slate-200 bg-white p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{caption}</p>
      </div>
      <span className={`inline-flex h-10 w-10 items-center justify-center border ${toneStyles}`}>
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
    </div>
  );
}

interface BrandPaymentsDashboardProps {
  summary: BrandPaymentsSummary;
}

export function BrandPaymentsDashboard({ summary }: BrandPaymentsDashboardProps) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
            Brand workspace
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-950">
            <Receipt aria-hidden="true" className="h-6 w-6 text-slate-500" />
            Invoices / Payments
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review campaign invoices, payment status, and billing history.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex w-fit items-center border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
            {summary.totalInvoices} invoice{summary.totalInvoices === 1 ? "" : "s"}
          </span>
          <Link
            href="/dashboard/brand/campaigns/new"
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
          >
            <Megaphone aria-hidden="true" className="h-4 w-4" />
            Post a new campaign
          </Link>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Total spent"
          value={formatCurrency(summary.totalSpent)}
          caption="Paid out to creators for completed work"
          tone="success"
        />
        <StatCard
          icon={Hourglass}
          label="Funds in escrow"
          value={formatCurrency(summary.inEscrow)}
          caption="Locked for active deliverables + submissions"
          tone="escrow"
        />
        <StatCard
          icon={CreditCard}
          label="Awaiting payment"
          value={formatCurrency(summary.pendingPayment)}
          caption="Draft invoices — complete checkout to lock escrow"
          tone="pending"
        />
        <StatCard
          icon={XCircle}
          label="Refunds issued"
          value={formatCurrency(summary.refunded)}
          caption="Returned from canceled or refunded campaigns"
          tone="refund"
        />
      </div>

      <section className="border border-slate-200 bg-white">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Ledger</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Every campaign charge, escrow hold, and payout release tied to your account.
            </p>
          </div>
          <Link
            href="/dashboard/brand"
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 transition hover:text-violet-950"
          >
            Manage campaigns <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </header>

        {summary.ledger.length === 0 ? (
          <div className="mx-4 my-4 border border-dashed border-slate-300 bg-white px-6 py-14 text-center sm:mx-5">
            <FileText aria-hidden="true" className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 text-base font-semibold text-slate-900">No invoices yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              When you post a campaign and lock its budget, your first invoice will appear here.
            </p>
            <Link
              href="/dashboard/brand/campaigns/new"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900"
            >
              Create your first campaign <ArrowUpRight aria-hidden="true" className="ml-1 h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-5">
                    Invoice / Tx ID
                  </th>
                  <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-5">
                    Campaign
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-5">
                    Amount
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-5">
                    Date
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-5">
                    Status
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:px-5">
                    Applicants
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {summary.ledger.map((item) => {
                  const StatusIcon = ledgerStatusIcon(item.status);
                  return (
                    <tr key={item.id} className="align-top transition hover:bg-slate-50/60">
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[12px] text-slate-600 sm:px-5">
                        <div className="flex items-center gap-1.5">
                          <FileText aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate max-w-[160px]" title={transactionIdDisplay(item)}>
                            {transactionIdDisplay(item)}
                          </span>
                        </div>
                        {item.razorpayOrderId ? (
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                            Razorpay
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                            Draft invoice
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 sm:px-5">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/campaigns/${encodeURIComponent(item.campaignId)}`}
                              className="block truncate font-semibold text-slate-950 hover:text-violet-800"
                            >
                              {item.campaignTitle}
                            </Link>
                            <p className="mt-0.5 truncate text-xs text-slate-500">{item.companyName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-slate-950 sm:px-5">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600 sm:px-5">
                        <div className="inline-flex items-center gap-1.5">
                          <Clock aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(item.createdAt)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 sm:px-5">
                        <span
                          className={`inline-flex items-center gap-1 border px-2 py-1 text-[11px] font-semibold ${ledgerStatusStyles(item.status)}`}
                        >
                          <StatusIcon aria-hidden="true" className="h-3.5 w-3.5" />
                          {ledgerStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right text-xs text-slate-600 sm:px-5">
                        <span className="inline-flex items-center gap-1 justify-end">
                          <Megaphone aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" />
                          {item.applicantCount}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
