'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchCheckout,
  isCheckoutPaid,
  PENDING_CHECKOUT_ID_KEY,
  resolveCheckoutId,
} from '@/lib/mdk-checkout'

const POLL_INTERVAL_MS = 2000
/** Allow time for the MDK webhook handler (up to 60s on Vercel). */
const MAX_POLL_MS = 90_000

export type PaymentVerificationState =
  | { status: 'loading' }
  | { status: 'missing_checkout' }
  | { status: 'paid' }
  | { status: 'unpaid'; canRetry: boolean }

/**
 * Polls MDK for payment confirmation. The stock `useCheckoutSuccess` hook only
 * fetches once, which often races the Lightning webhook that marks the checkout paid.
 */
export function usePaymentVerification(): PaymentVerificationState & {
  retry: () => void
} {
  const [state, setState] = useState<PaymentVerificationState>({ status: 'loading' })
  const [retryCount, setRetryCount] = useState(0)
  const attemptRef = useRef(0)

  useEffect(() => {
    const checkoutId = resolveCheckoutId()
    if (!checkoutId) {
      setState({ status: 'missing_checkout' })
      return
    }

    setState({ status: 'loading' })
    const attempt = ++attemptRef.current
    const startedAt = Date.now()
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const poll = async () => {
      if (cancelled || attemptRef.current !== attempt) return

      const checkout = await fetchCheckout(checkoutId)
      if (cancelled || attemptRef.current !== attempt) return

      if (isCheckoutPaid(checkout)) {
        sessionStorage.removeItem(PENDING_CHECKOUT_ID_KEY)
        setState({ status: 'paid' })
        return
      }

      const elapsed = Date.now() - startedAt
      if (elapsed >= MAX_POLL_MS) {
        setState({ status: 'unpaid', canRetry: true })
        return
      }

      timeoutId = setTimeout(poll, POLL_INTERVAL_MS)
    }

    void poll()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [retryCount])

  const retry = useCallback(() => {
    setRetryCount((n) => n + 1)
  }, [])

  return { ...state, retry }
}
