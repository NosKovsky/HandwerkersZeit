"use client"

// This file provides client-side wrappers for server actions
// to avoid direct imports of server-only modules in client components

import { createBaustelle, updateBaustelle } from "@/app/baustellen/actions"
import { createProject, updateProject } from "@/app/projects/actions"
import { updateUserProfile } from "@/components/users/actions"

// Re-export the server actions for client components to use
export { createBaustelle, updateBaustelle, createProject, updateProject, updateUserProfile }
