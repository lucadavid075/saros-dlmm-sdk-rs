import { useEffect, useMemo, useState } from 'react'
import { useWeb3Auth } from '../lib/web3auth'
import { airdropIfNeeded, buildTransferTransaction, getConnection } from '../lib/solana'
import { PublicKey } from '@solana/web3.js'
import { useSignAndSendTransaction } from '@web3auth/modal/react/solana'

export function WalletPanel() {
  const { isInitialized, isLoggingIn, isLoggedIn, publicKey, login, logout, getBalance } = useWeb3Auth()
  const { signAndSendTransaction, loading } = useSignAndSendTransaction()
  const [balance, setBalance] = useState<number | null>(null)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('0.01')
  const [status, setStatus] = useState('')

  useEffect(() => {
    async function fetchBal() {
      if (!isLoggedIn) return
      const sol = await getBalance()
      setBalance(sol)
    }
    fetchBal()
  }, [isLoggedIn, getBalance])

  useEffect(() => {
    async function maybeAirdrop() {
      if (!publicKey) return
      await airdropIfNeeded(new PublicKey(publicKey), 0.05)
      const sol = await getBalance()
      setBalance(sol)
    }
    maybeAirdrop()
  }, [publicKey, getBalance])

  const shortPk = useMemo(() => (publicKey ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : ''), [publicKey])

  async function send() {
    if (!publicKey) return
    try {
      setStatus('Preparing transaction...')
      const from = new PublicKey(publicKey)
      const to = new PublicKey(recipient)
      const tx = await buildTransferTransaction({ from, to, amountSol: parseFloat(amount) })
      setStatus('Signing and sending...')
      const sig = await signAndSendTransaction(tx)
      const connection = getConnection()
      await connection.confirmTransaction(sig, 'confirmed')
      setStatus(`Confirmed: ${sig}`)
      const sol = await getBalance()
      setBalance(sol)
    } catch (e: any) {
      setStatus(e?.message || 'Failed to send')
    }
  }

  return (
    <div className="card">
      {!isInitialized && <p>Loading wallet...</p>}
      {isInitialized && !isLoggedIn && (
        <button onClick={() => { void login() }} disabled={isLoggingIn}>
          {isLoggingIn ? 'Connecting...' : 'Login with Social / Email'}
        </button>
      )}
      {isLoggedIn && (
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <span>Connected: {shortPk}</span>
            <button onClick={() => { void logout() }}>Logout</button>
          </div>
          <div style={{ marginBottom: 12 }}>
            <strong>Balance:</strong> {balance === null ? '—' : `${balance.toFixed(4)} SOL`}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <input style={{ width: 380 }} placeholder="Recipient address" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            <input style={{ width: 100 }} placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button onClick={send} disabled={!recipient || !amount || loading}>{loading ? 'Sending...' : 'Send'}</button>
          </div>
          <div style={{ minHeight: 24 }}>{status}</div>
        </div>
      )}
    </div>
  )
}

export default WalletPanel

