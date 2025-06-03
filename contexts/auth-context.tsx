"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, AuthError } from "@supabase/supabase-js"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      console.log("Profile fetched:", data)
      return data
    } catch (error) {
      console.error("Unexpected error fetching profile:", error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true) // Explizit Loading setzen
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        console.log("Initial session:", session?.user?.email)

        if (session?.user) {
          setUser(session.user)
          const profileData = await fetchProfile(session.user.id)
          if (mounted) {
            setProfile(profileData)
          }
        } else {
          // Explizit null setzen wenn keine Session
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false) // Wichtig: Loading auf false setzen
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event, session?.user?.email)

      // Bei Auth-Änderungen explizit Loading setzen
      setLoading(true)

      if (session?.user) {
        setUser(session.user)
        const profileData = await fetchProfile(session.user.id)
        if (mounted) {
          setProfile(profileData)
        }
      } else {
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      }

      if (mounted) {
        setLoading(false) // Wichtig: Loading auf false setzen
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Verbesserte Admin-Erkennung
  const isAdmin = profile?.role === "admin" || profile?.position === "Administrator"

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
