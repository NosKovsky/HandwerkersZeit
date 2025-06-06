import { InvoiceGenerator } from "@/components/invoicing/invoice-generator"
import { MainLayout } from "@/components/layout/main-layout"

export default function InvoicingPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <InvoiceGenerator />
      </div>
    </MainLayout>
  )
}
