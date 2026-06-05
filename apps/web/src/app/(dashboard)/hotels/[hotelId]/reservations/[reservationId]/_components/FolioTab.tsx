"use client";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { useCreateInvoice, useSendInvoice, useInvoicePdfUrl } from "@/lib/hooks/useFolio";
import type { FolioItemType, FolioResponse, FolioItem, FolioPayment } from "@/lib/hooks/useFolio";
import { Plus, CreditCard, FileText, Trash2, Banknote, Building2, Smartphone } from "lucide-react";

interface SummaryItemProps {
  label: string;
  value: React.ReactNode;
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

interface FolioTabProps {
  reservationId: string;
  folio: FolioResponse | undefined;
  folioLoading: boolean;
  canPostCharge: boolean;
  canPostPayment: boolean;
  canVoidItem: boolean;
  canRefund: boolean;
  canCreateInvoice: boolean;
  onOpenPostCharge: (defaultType?: FolioItemType) => void;
  onOpenPostPayment: () => void;
  onOpenVoidItem: (item: FolioItem) => void;
  onOpenRefund: (payment: FolioPayment) => void;
  reservationStatus?: string;
}

const paymentMethodIcon = (method: string) => {
  switch (method) {
    case "CASH":
      return <Banknote className="h-4 w-4" />;
    case "CREDIT_CARD":
    case "DEBIT_CARD":
      return <CreditCard className="h-4 w-4" />;
    case "BANK_TRANSFER":
      return <Building2 className="h-4 w-4" />;
    case "MOBILE_PAYMENT":
      return <Smartphone className="h-4 w-4" />;
    default:
      return <Banknote className="h-4 w-4" />;
  }
};

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "CAPTURED":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "PENDING":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "FAILED":
      return "text-red-600 bg-red-50 border-red-200";
    case "REFUNDED":
      return "text-gray-600 bg-gray-50 border-gray-200";
    case "VOIDED":
      return "text-gray-600 bg-gray-50 border-gray-200";
    default:
      return "";
  }
};

export function FolioTab({
  reservationId,
  folio,
  folioLoading,
  canPostCharge,
  canPostPayment,
  canVoidItem,
  canRefund,
  canCreateInvoice,
  onOpenPostCharge,
  onOpenPostPayment,
  onOpenVoidItem,
  onOpenRefund,
  reservationStatus,
}: FolioTabProps) {
  const createInvoice = useCreateInvoice(reservationId);
  const sendInvoice = useSendInvoice(reservationId);

  const handleCreateInvoice = () => {
    createInvoice.mutate({});
  };

  const handleSendInvoice = (invoiceId: string) => {
    sendInvoice.mutate(invoiceId);
  };

  if (folioLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  if (!folio) {
    return <div className="text-sm text-muted-foreground text-center py-8">Folio data not available</div>;
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg border bg-card shadow-sm mb-4">
        <SummaryItem label="Charges" value={formatCurrency(folio.summary.totalCharges, folio.summary.currencyCode)} />
        <SummaryItem label="Payments" value={formatCurrency(folio.summary.totalPayments, folio.summary.currencyCode)} />
        <SummaryItem label="Taxes" value={formatCurrency(folio.summary.totalTaxes, folio.summary.currencyCode)} />
        <SummaryItem
          label="Balance"
          value={
            folio.summary.balance > 0 ? (
              <span className="text-red-600 font-bold">
                {formatCurrency(folio.summary.balance, folio.summary.currencyCode)}
              </span>
            ) : folio.summary.balance === 0 ? (
              <span className="text-emerald-600 font-bold">Paid</span>
            ) : (
              <span className="text-blue-600 font-bold">
                {formatCurrency(Math.abs(folio.summary.balance), folio.summary.currencyCode)} Credit
              </span>
            )
          }
        />
      </div>

      <div className="flex justify-end gap-2 mb-4">
        {canPostCharge && (
          <Button size="sm" variant="outline" onClick={() => onOpenPostCharge()}>
            <Plus className="h-4 w-4 mr-1" /> Post Charge
          </Button>
        )}
        {canPostPayment && (
          <Button size="sm" variant="outline" onClick={onOpenPostPayment}>
            <CreditCard className="h-4 w-4 mr-1" /> Post Payment
          </Button>
        )}
        {canCreateInvoice && (
          <Button size="sm" variant="outline" onClick={handleCreateInvoice}>
            <FileText className="h-4 w-4 mr-1" /> Create Invoice
          </Button>
        )}
      </div>

      <h4 className="text-sm font-semibold mb-2">Charges</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Dept</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Tax</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folio.items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                No charges posted yet
              </TableCell>
            </TableRow>
          ) : (
            folio.items
              .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
              .map((item) => (
                <TableRow key={item.id} className={item.isVoided ? "opacity-50" : ""}>
                  <TableCell className={item.isVoided ? "line-through" : ""}>
                    {formatDate(item.postedAt)}
                  </TableCell>
                  <TableCell className={item.isVoided ? "line-through" : ""}>
                    <div>
                      <span>{item.description}</span>
                      {item.source && <Badge variant="outline" className="ml-1 text-[10px]">{item.source}</Badge>}
                      {item.isVoided && <Badge variant="outline" className="ml-1 text-[10px] text-red-500 border-red-200">VOIDED</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className={item.isVoided ? "line-through" : ""}>{item.department}</TableCell>
                  <TableCell className={`text-right tabular-nums ${item.isVoided ? "line-through" : ""}`}>{item.quantity}</TableCell>
                  <TableCell className={`text-right tabular-nums ${item.isVoided ? "line-through" : ""}`}>{formatCurrency(item.unitPrice, folio.summary.currencyCode)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${item.isVoided ? "line-through" : ""}`}>{formatCurrency(item.amount, folio.summary.currencyCode)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${item.isVoided ? "line-through" : ""}`}>{formatCurrency(item.taxAmount, folio.summary.currencyCode)}</TableCell>
                  <TableCell className="text-right">
                    {!item.isVoided && canVoidItem && reservationStatus !== "CHECKED_OUT" && (
                      <Button variant="ghost" size="sm" onClick={() => onOpenVoidItem(item)} className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>

      <Separator className="my-6" />
      <h4 className="text-sm font-semibold mb-2">Payments</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Card</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folio.payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                No payments recorded
              </TableCell>
            </TableRow>
          ) : (
            folio.payments
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {paymentMethodIcon(payment.method)}
                      <span className="text-xs">{payment.method.replace(/_/g, " ")}</span>
                    </div>
                  </TableCell>
                  <TableCell className={`text-right tabular-nums ${!payment.isRefund ? "text-emerald-600" : "text-red-500 italic"}`}>
                    {formatCurrency(payment.amount, payment.currencyCode)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${statusBadgeClass(payment.status)}`}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {payment.cardBrand && payment.cardLastFour
                      ? `${payment.cardBrand} ****${payment.cardLastFour}`
                      : payment.cardBrand || payment.cardLastFour || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.status === "CAPTURED" && !payment.isRefund && canRefund && (
                      <Button variant="ghost" size="sm" onClick={() => onOpenRefund(payment)}>
                        Refund
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>

      {folio.invoices.length > 0 && (
        <>
          <Separator className="my-6" />
          <h4 className="text-sm font-semibold mb-2">Invoices</h4>
          {folio.invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <span className="font-medium text-sm">{inv.invoiceNumber}</span>
                <span className="text-xs text-muted-foreground ml-2">{formatDate(inv.issueDate)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-nums">{formatCurrency(inv.total, folio.summary.currencyCode)}</span>
                <Badge variant="outline" className="text-xs">{inv.status}</Badge>
                <div className="flex gap-1">
                  {!inv.sentAt && (
                    <Button variant="ghost" size="sm" onClick={() => handleSendInvoice(inv.id)}>Send</Button>
                  )}
                  {inv.documentUrl && (
                    <a href={useInvoicePdfUrl(reservationId, inv.id) ?? "#"} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">PDF</Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
