"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Customer {
  id: string
  name: string
  contact_person: string | null
  city: string | null
}

interface CustomerSelectorProps {
  customers: Customer[]
  selectedCustomerId?: string | null
  onCustomerSelect: (customerId: string | null) => void
  onSearchCustomers?: (query: string) => Promise<Customer[]>
  onCreateCustomer?: (customerData: any) => Promise<{ success: boolean; customer?: Customer }>
}

export function CustomerSelector({
  customers,
  selectedCustomerId,
  onCustomerSelect,
  onSearchCustomers,
  onCreateCustomer,
}: CustomerSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Customer[]>(customers)
  const [isCreating, setIsCreating] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState("")

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId)

  useEffect(() => {
    if (searchQuery.length >= 2 && onSearchCustomers) {
      onSearchCustomers(searchQuery).then(setSearchResults)
    } else {
      setSearchResults(customers)
    }
  }, [searchQuery, customers, onSearchCustomers])

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim() || !onCreateCustomer) return

    const result = await onCreateCustomer({
      name: newCustomerName.trim(),
      contact_person: null,
      street: null,
      zip_code: null,
      city: null,
      phone: null,
      email: null,
    })

    if (result.success && result.customer) {
      onCustomerSelect(result.customer.id)
      setNewCustomerName("")
      setIsCreating(false)
      setOpen(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>Kunde</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedCustomer ? selectedCustomer.name : "Kunde auswählen..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Kunde suchen..." value={searchQuery} onValueChange={setSearchQuery} />
            <CommandList>
              <CommandEmpty>
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Kein Kunde gefunden</p>
                  {onCreateCustomer && (
                    <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Neuen Kunden erstellen
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {searchResults.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => {
                      onCustomerSelect(customer.id === selectedCustomerId ? null : customer.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", selectedCustomerId === customer.id ? "opacity-100" : "opacity-0")}
                    />
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      {customer.contact_person && (
                        <div className="text-sm text-muted-foreground">{customer.contact_person}</div>
                      )}
                      {customer.city && <div className="text-sm text-muted-foreground">{customer.city}</div>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          {isCreating && onCreateCustomer && (
            <div className="border-t p-4 space-y-2">
              <Label htmlFor="new-customer-name">Neuer Kunde</Label>
              <Input
                id="new-customer-name"
                placeholder="Kundenname"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateCustomer}>
                  Erstellen
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false)
                    setNewCustomerName("")
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
