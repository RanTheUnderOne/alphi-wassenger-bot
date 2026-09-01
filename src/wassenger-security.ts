import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyWebhookToken(token: string | undefined, secret: string): boolean {
  if (!token) return false
  const received = Buffer.from(token)
  const expected = Buffer.from(secret)
  return received.length === expected.length && timingSafeEqual(received, expected)
}

export function verifyWassengerSignature(rawBody: string, signature: string | undefined, secret: string, allowUnsigned = false): boolean {
  if (!signature) return allowUnsigned
  if (!secret) return false
  const provided = signature.replace(/^sha256=/i, '')
  if (!/^[a-f0-9]{64}$/i.test(provided)) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const receivedBuffer = Buffer.from(provided, 'hex')
  const expectedBuffer = Buffer.from(expected, 'hex')
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer)
}
