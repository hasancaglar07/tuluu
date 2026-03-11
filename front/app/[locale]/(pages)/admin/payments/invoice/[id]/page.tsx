import { InvoiceManagementPage } from "@/components/modules/admin/payments/invoice";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <InvoiceManagementPage invoiceId={id} />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: "Fatura Detayı - TULU",
    description: "Ödeme faturasının detaylarını görüntüleyin ve yönetin.",
    icons: {
      icon: "/favicon.ico",
    },
  };
}
