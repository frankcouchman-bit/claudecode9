'use client'
const ACCESS_KEY='seoscribe_access_token', REFRESH_KEY='seoscribe_refresh_token', TYPE_KEY='seoscribe_auth_type'
export function setTokens(a:string,r:string,t='magiclink'){ if(typeof window==='undefined')return; localStorage.setItem(ACCESS_KEY,a||''); localStorage.setItem(REFRESH_KEY,r||''); localStorage.setItem(TYPE_KEY,t||'') }
export function getAccessToken(){ if(typeof window==='undefined')return null; return localStorage.getItem(ACCESS_KEY) }
export function clearTokens(){ if(typeof window==='undefined')return; localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); localStorage.removeItem(TYPE_KEY) }
export function isAuthed() {
  if (typeof window === 'undefined') return false
  const token = getAccessToken()
  if (!token) return false
  try {
    // Decode the JWT payload to check expiry.  JWTs are in the form
    // header.payload.signature, where payload is base64url encoded JSON.
    const parts = token.split('.')
    if (parts.length < 2) return false
    const payload = parts[1]
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    const exp = json.exp
    // exp is in seconds since epoch.  Consider token valid if it has not expired.
    if (typeof exp === 'number' && exp * 1000 > Date.now()) {
      return true
    }
  } catch {
    // Fall through to return false on error
  }
  return false
}
export function captureTokensFromURL() {
  if (typeof window === 'undefined') return
  const u = new URL(window.location.href)
  // Try to extract tokens from query params first
  let access = u.searchParams.get('access_token')
  let refresh = u.searchParams.get('refresh_token')
  let type = u.searchParams.get('type') || undefined
  // If no access token found in search params, look in the hash fragment
  if (!access && typeof window !== 'undefined' && window.location.hash) {
    // Remove the leading '#'
    const hash = window.location.hash.substring(1)
    const hashParams = new URLSearchParams(hash)
    access = hashParams.get('access_token') || null
    refresh = hashParams.get('refresh_token') || null
    type = hashParams.get('type') || type
    if (access) {
      // Persist tokens
      setTokens(access, refresh || '', type)
      // Remove the token params from the hash
      hashParams.delete('access_token')
      hashParams.delete('refresh_token')
      hashParams.delete('type')
      // Build the new hash string
      const newHash = hashParams.toString()
      const base = u.origin + u.pathname + u.search
      history.replaceState(null, '', newHash ? `${base}#${newHash}` : base)
      return
    }
  }
  if (access) {
    setTokens(access, refresh || '', type)
    // Clean up query params
    u.searchParams.delete('access_token')
    u.searchParams.delete('refresh_token')
    u.searchParams.delete('type')
    history.replaceState(null, '', u.toString())
  }
}
