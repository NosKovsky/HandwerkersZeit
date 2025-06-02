"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User, AuthError, Session } from "@supabase/supabase-js"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  loadingInitial: boolean
  loadingProfile: boolean
  isAdmin: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string,
    role?: "admin" | "user",
  ) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(false)

  const fetchProfile = useCallback(
    async (currentUser: User | null) => {
      if (!currentUser) {
        setProfile(null)
        setLoadingProfile(false)
        return
      }
      setLoadingProfile(true)
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()

        if (error) {
          console.error("Error fetching profile:", error)
          setProfile(null)
        } else {
          setProfile(data)
        }
      } catch (e) {
        console.error("Exception fetching profile:", e)
        setProfile(null)
      } finally {
        setLoadingProfile(false)
      }
    },
    [supabase],
  )

  useEffect(() => {
    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await fetchProfile(currentUser)
      if (event === "INITIAL_SESSION") {
        setLoadingInitial(false)
      }
    })

    // Initial check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      await fetchProfile(currentUser)
      setLoadingInitial(false)
    })

    return () => {
      authListener?.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    role: "admin" | "user" = "user",
  ) => {
    // Note: Die `handle_new_user` Funktion in SQL wird das Profil erstellen.
    // Die Rolle kann hier als Metadaten übergeben werden, wenn die SQL-Funktion angepasst wird,
    // oder nach der Registrierung durch einen Admin gesetzt werden.
    // Für Einfachheit wird die SQL-Funktion die Standardrolle 'user' setzen.
    // Ein Admin kann die Rolle später in der UI ändern.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          // 'role' wird durch den SQL Trigger `handle_new_user` gesetzt,
          // der `raw_user_meta_data->>'role'` lesen könnte, falls hier übergeben.
          // Standardmäßig wird 'user' gesetzt.
        },
      },
    })
    // Wenn die Registrierung erfolgreich war und ein Benutzerobjekt zurückgegeben wurde,
    // wird der onAuthStateChange Listener das Profil laden.
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user)
    }
  }

  const isAdmin = profile?.role === "admin"

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loadingInitial,
        loadingProfile,
        isAdmin,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
