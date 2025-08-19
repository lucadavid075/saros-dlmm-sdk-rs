import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'

export function getConnection(rpcUrl?: string) {
  const endpoint = rpcUrl || import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
  return new Connection(endpoint, 'confirmed')
}

export async function airdropIfNeeded(publicKey: PublicKey, minimumSol: number) {
  const connection = getConnection()
  const balanceLamports = await connection.getBalance(publicKey)
  const balanceSol = balanceLamports / LAMPORTS_PER_SOL
  if (balanceSol < minimumSol) {
    try {
      const sig = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL)
      await connection.confirmTransaction(sig, 'confirmed')
    } catch (_) {
      // ignore airdrop failures
    }
  }
}

export async function buildTransferTransaction(params: {
  from: PublicKey
  to: PublicKey
  amountSol: number
  recentBlockhash?: string
}) {
  const connection = getConnection()
  const { blockhash } = await connection.getLatestBlockhash('finalized')
  const tx = new Transaction({ feePayer: params.from, recentBlockhash: params.recentBlockhash || blockhash })
  tx.add(SystemProgram.transfer({ fromPubkey: params.from, toPubkey: params.to, lamports: Math.round(params.amountSol * LAMPORTS_PER_SOL) }))
  return tx
}

