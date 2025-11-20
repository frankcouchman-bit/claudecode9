"use client"

import { useQuota } from "@/contexts/quota-context"
import { useEffect } from "react"
import { captureTokensFromURL } from "@/lib/auth"
import { QuotaDisplay } from "@/components/quota-display"
import { usePathname } from "next/navigation"

export function ClientQuotaDisplay() {
  const { quota, isAuthenticated } = useQuota()
  const pathname = usePathname()

  // Capture any access tokens in the URL fragment or query on mount.  This
  // ensures that returning from an OAuth or magic link callback (which
  // encodes tokens in the hash) will persist the tokens even when
  // returning to pages other than /auth or /dashboard.
  useEffect(() => {
    captureTokensFromURL()
  }, [])

  // Don't show on auth page or landing pages
  const hiddenPaths = ['/auth', '/pricing', '/terms', '/privacy']
  const shouldShow = !hiddenPaths.includes(pathname)

  if (!shouldShow) return null

  return <QuotaDisplay isAuthenticated={isAuthenticated} />
}
