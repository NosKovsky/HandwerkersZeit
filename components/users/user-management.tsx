"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { updateUserRole } from "./actions"
import { Check, X, UserCog, Users, Shield, ShieldAlert } from "lucide-react"

type User = {
  id: string
  email: string
  full_name: string | null
  role: "admin" | "user"
  created_at: string
}

export function UserManagement({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<"admin" | "user">("user")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRoleChange = async (user: User, role: "admin" | "user") => {
    setSelectedUser(user)
    setNewRole(role)
    setRoleDialogOpen(true)
  }

  const confirmRoleChange = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      const result = await updateUserRole(selectedUser.id, newRole)

      if (result.success) {
        setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, role: newRole } : user)))
        toast({
          title: "Rolle aktualisiert",
          description: `${selectedUser.full_name || selectedUser.email} ist jetzt ${newRole === "admin" ? "Administrator" : "Benutzer"}.`,
          variant: "default",
        })
      } else {
        throw new Error(result.error || "Unbekannter Fehler")
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: `Rolle konnte nicht aktualisiert werden: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setRoleDialogOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Benutzer ({users.length})
              </CardTitle>
              <CardDescription>Verwalten Sie Benutzerrollen und Zugriffe.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name / E-Mail</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead className="w-[100px]">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name || "—"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === "admin" ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 flex items-center"
                        >
                          <Shield className="mr-1 h-3 w-3" />
                          Administrator
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 flex items-center"
                        >
                          <UserCog className="mr-1 h-3 w-3" />
                          Benutzer
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      {user.role === "admin" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40"
                          onClick={() => handleRoleChange(user, "user")}
                        >
                          <ShieldAlert className="h-4 w-4 mr-2" />
                          Zu Benutzer
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                          onClick={() => handleRoleChange(user, "admin")}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Zum Admin
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Keine Benutzer gefunden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Benutzerrolle ändern</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie {selectedUser?.full_name || selectedUser?.email} wirklich
              {newRole === "admin" ? " zum Administrator machen?" : " zum Benutzer zurückstufen?"}
              <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                <h4 className="text-sm font-semibold mb-1 flex items-center">
                  <ShieldAlert className="h-4 w-4 mr-1" />
                  Wichtiger Hinweis
                </h4>
                <p className="text-xs">
                  {newRole === "admin"
                    ? "Administratoren haben vollen Zugriff auf alle Daten und Funktionen der Anwendung, einschließlich Benutzerverwaltung."
                    : "Wenn Sie diesen Administrator zum Benutzer zurückstufen, verliert er alle Admin-Berechtigungen."}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmRoleChange()
              }}
              disabled={isSubmitting}
              className={newRole === "admin" ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}
            >
              {isSubmitting ? (
                <>Wird bearbeitet...</>
              ) : newRole === "admin" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Zum Admin machen
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Zu Benutzer zurückstufen
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
