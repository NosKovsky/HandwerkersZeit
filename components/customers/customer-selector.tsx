"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { searchCustomers, type Customer } from "@/app/customers/actions"
import { CustomerForm } from "./customer-form"

interface CustomerSelectorProps {
  selectedCustomer?: Customer | null
  onCustomerSelect: (customer: Customer | null) => void
  onCustomerDataChange?: (customerData: Partial<Customer>) => void
}

export function CustomerSelector({ selectedCustomer, onCustomerSelect, onCustomerDataChange }: CustomerSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (searchQuery.length >= 2) {
      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsLoading(true)
        try {
          const results = await searchCustomers(searchQuery)
          setCustomers(results)
        } catch (error) {
          console.error("Error searching customers:", error)
        } finally {
          setIsLoading(false)
        }
      }, 300)
    } else {
      setCustomers([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleCustomerSelect = (customer: Customer) => {
    onCustomerSelect(customer)
    setOpen(false)
    setSearchQuery("")

    // Automatisch Adressdaten übernehmen, falls gewünscht
    if (onCustomerDataChange && customer.street && customer.city) {
      const address = `${customer.street}, ${customer.zip_code || ""} ${customer.city}`.trim()
      onCustomerDataChange({
        address: address.replace(/^,\s*/, "").replace(/,\s*$/, ""), // Kommas am Anfang/Ende entfernen
      })
    }
  }

  const handleNewCustomerCreated = (customer: Customer) => {
    setShowNewCustomerDialog(false)
    handleCustomerSelect(customer)
  }

  const displayValue = selectedCustomer
    ? `${selectedCustomer.name}${selectedCustomer.city ? ` (${selectedCustomer.city})` : ""}`
    : "Kunde auswählen..."

  return (
    <div className="space-y-2">
      <Label htmlFor="customer-selector">Kunde (optional)</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="flex-1 justify-between">
              <span className="truncate">{displayValue}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput
                placeholder="Kunde suchen (Name, Straße, Ort)..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>
                  {searchQuery.length < 2
                    ? "Mindestens 2 Zeichen eingeben..."
                    : isLoading
                      ? "Suche läuft..."
                      : "Kein Kunde gefunden."}
                </CommandEmpty>
                {customers.length > 0 && (
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.id}
                        onSelect={() => handleCustomerSelect(customer)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            {(customer.street || customer.city) && (
                              <div className="text-sm text-muted-foreground">
                                {customer.street && `${customer.street}, `}
                                {customer.zip_code && `${customer.zip_code} `}
                                {customer.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Neuen Kunden anlegen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen neuen Kunden, der dann automatisch ausgewählt wird.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm onCustomerCreated={handleNewCustomerCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {selectedCustomer && (
        <div className="flex items-center justify-between p-2 bg-muted rounded-md">
          <div className="flex items-center text-sm">
            <User className="mr-2 h-4 w-4" />
            <span className="font-medium">{selectedCustomer.name}</span>
            {selectedCustomer.contact_person && (
              <span className="ml-2 text-muted-foreground">({selectedCustomer.contact_person})</span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => onCustomerSelect(null)}>
            Entfernen
          </Button>
        </div>
      )}
    </div>
  )
}
