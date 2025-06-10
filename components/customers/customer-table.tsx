"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Customer } from "@/app/customers/actions"

interface CustomerTableProps {
  customers?: Customer[]
  onEdit?: (customer: Customer) => void
  onDelete?: (customerId: string) => void
}

function CustomerTable({ customers = [], onEdit, onDelete }: CustomerTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (customerId: string) => {
    if (!onDelete) return

    setDeletingId(customerId)
    try {
      await onDelete(customerId)
    } finally {
      setDeletingId(null)
    }
  }

  // Sichere Behandlung von undefined/null customers
  const safeCustomers = Array.isArray(customers) ? customers : []

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Ansprechpartner</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Ort</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeCustomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Keine Kunden gefunden
              </TableCell>
            </TableRow>
          ) : (
            safeCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.contact_person || "-"}</TableCell>
                <TableCell>{customer.email || "-"}</TableCell>
                <TableCell>{customer.phone || "-"}</TableCell>
                <TableCell>{customer.city || "-"}</TableCell>
                <TableCell>
                  <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                    {customer.status === "active" ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menü öffnen</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(customer)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Bearbeiten
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(customer.id)}
                          disabled={deletingId === customer.id}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === customer.id ? "Löschen..." : "Löschen"}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default CustomerTable
