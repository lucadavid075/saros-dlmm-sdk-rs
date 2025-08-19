import { useEffect, useRef } from 'react'
import { useWeb3Auth } from '../lib/web3auth'
import { createQR, encodeURL, type TransferRequestURLFields } from '@solana/pay'
import { PublicKey } from '@solana/web3.js'

export function SolanaPayPanel() {
  const { publicKey } = useWeb3Auth()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!publicKey || !ref.current) return
    const recipient = new PublicKey(publicKey)
    const urlParams: TransferRequestURLFields = { recipient, amount: undefined, label: 'Pay to my wallet', message: 'Thanks!' }
    const url = encodeURL(urlParams)
    const qr = createQR(url, 256, 'transparent')
    ref.current.innerHTML = ''
    qr.append(ref.current)
  }, [publicKey])

  if (!publicKey) return null

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 8 }}><strong>Receive with Solana Pay</strong></div>
      <div ref={ref} />
    </div>
  )
}

export default SolanaPayPanel

