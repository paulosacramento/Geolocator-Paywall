/** Query param MDK appends when redirecting to the success URL. */
export const CHECKOUT_ID_QUERY_PARAM = 'checkout-id'

export const PENDING_CHECKOUT_ID_KEY = 'pending_checkout_id'

const MDK_API_PATH =
  (typeof process !== 'undefined' &&
    (process.env.NEXT_PUBLIC_MDK_API_PATH ?? process.env.MDK_API_PATH)) ||
  '/api/mdk'

type CheckoutInvoice = {
  amountSatsReceived?: number | null
}

export type MdkCheckout = {
  status?: string
  invoice?: CheckoutInvoice | null
}

export function isCheckoutPaid(checkout: MdkCheckout | null): boolean {
  if (!checkout) return false
  const invoiceSettled = (checkout.invoice?.amountSatsReceived ?? 0) > 0
  return checkout.status === 'PAYMENT_RECEIVED' || invoiceSettled
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return null
}

function ensureCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  let token = getCookie('mdk_csrf')
  if (!token) {
    token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`
  }
  const cookieAttributes = ['path=/']
  const secureContext = typeof window !== 'undefined' && window.isSecureContext
  if (secureContext) {
    cookieAttributes.push('SameSite=None', 'Secure')
  } else {
    cookieAttributes.push('SameSite=Lax')
  }
  document.cookie = `mdk_csrf=${token}; ${cookieAttributes.join('; ')}`
  return token
}

/** Fetch checkout status from the MDK API route (same contract as the SDK). */
export async function fetchCheckout(checkoutId: string): Promise<MdkCheckout | null> {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  const csrfToken = ensureCsrfToken()
  if (csrfToken) {
    headers['x-moneydevkit-csrf-token'] = csrfToken
  }

  let response: Response
  try {
    response = await fetch(MDK_API_PATH, {
      method: 'POST',
      headers,
      body: JSON.stringify({ handler: 'get_checkout', checkoutId }),
    })
  } catch {
    return null
  }

  if (!response.ok) return null

  try {
    const body = (await response.json()) as { data?: MdkCheckout }
    return body.data ?? null
  } catch {
    return null
  }
}

export function resolveCheckoutId(): string | null {
  if (typeof window === 'undefined') return null
  const fromQuery = new URLSearchParams(window.location.search).get(
    CHECKOUT_ID_QUERY_PARAM,
  )
  if (fromQuery) return fromQuery
  return sessionStorage.getItem(PENDING_CHECKOUT_ID_KEY)
}
