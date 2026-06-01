export { GET, POST } from '@moneydevkit/nextjs/server/route'

/** Lightning webhook handler needs up to 60s to claim payments and notify MDK. */
export const maxDuration = 60
export const runtime = 'nodejs'
