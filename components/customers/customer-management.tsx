"use client"

import { useState } from "react"
import type { Tables } from "@/types/supabase"
import CustomerForm from "./customer-form"
import CustomerTable from "./customer-table"

interface CustomerManagementProps {
  initialCustomers: Tables<"customers">[]
  googleMapsApiKey?: string
}

export default function CustomerManagement({ initialCustomers, googleMapsApiKey }: CustomerManagementProps) {
  const [customers, setCustomers] = useState<Tables<"customers">[]>(initialCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<Tables<"customers"> | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleCustomerCreated = (newCustomer: Tables<"customers">) => {
    setCustomers([...customers, newCustomer])
  }

  const handleCustomerUpdated = (updatedCustomer: Tables<"customers">) => {
    setCustomers(customers.map((customer) => (customer.id === updatedCustomer.id ? updatedCustomer : customer)))
  }

  const handleCustomerDeleted = (deletedCustomerId: string) => {
    setCustomers(customers.filter((customer) => customer.id !== deletedCustomerId))
  }

  const handleEditCustomer = (customer: Tables<"customers">) => {
    setSelectedCustomer(customer)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setSelectedCustomer(null)
    setIsFormOpen(false)
  }

  return (
    <div className="space-y-4">
      <CustomerTable
        initialCustomers={customers}
        onEdit={handleEditCustomer}
        onDelete={handleCustomerDeleted}
        onAdd={() => {
          setSelectedCustomer(null)
          setIsFormOpen(true)
        }}
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-zinc-500/75">
          <div className="relative m-auto mt-20 flex max-w-2xl flex-col rounded-xl bg-white p-8">
            <button
              onClick={handleCloseForm}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                data-icon="x"
              >
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
              <span className="sr-only">Close</span>
            </button>
            <CustomerForm
              initialData={selectedCustomer || undefined}
              onSuccess={() => {
                // This logic should be improved to refresh data properly
                handleCloseForm()
              }}
              googleMapsApiKey={googleMapsApiKey}
            />
          </div>
        </div>
      )}
    </div>
  )
}
