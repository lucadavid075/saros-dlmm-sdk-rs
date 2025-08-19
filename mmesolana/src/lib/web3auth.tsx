import { Web3AuthProvider as Web3AuthProviderBase } from '@web3auth/modal/react'
import { useWeb3Auth as useWeb3AuthBase, useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from '@web3auth/modal/react'
import { useSolanaWallet } from '@web3auth/modal/react/solana'
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
type Web3AuthContextConfig = {
  web3AuthOptions: any
}

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID as string | undefined
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
  const config: Web3AuthContextConfig = {
    web3AuthOptions: {
      web3AuthNetwork: 'sapphire_devnet',
      clientId: clientId || '',
      uiConfig: { mode: 'dark' },
      chainConfig: {
        chainNamespace: 'solana',
        chainId: '0x3',
        rpcTarget: rpcUrl,
        blockExplorer: 'https://explorer.solana.com?cluster=devnet',
        displayName: 'Solana Devnet',
        ticker: 'SOL',
        tickerName: 'Solana',
      },
    },
  }
  return <Web3AuthProviderBase config={config}>{children}</Web3AuthProviderBase>
}

export function useWeb3Auth() {
  const auth = useWeb3AuthBase()
  const { connect, loading: connecting } = useWeb3AuthConnect()
  const { disconnect } = useWeb3AuthDisconnect()
  const { userInfo } = useWeb3AuthUser()
  const { accounts, solanaWallet } = useSolanaWallet()

  const publicKey = accounts?.[0] ?? null
  const isLoggedIn = !!publicKey
  const isInitialized = !!auth.web3Auth
  const isLoggingIn = connecting

  const getBalance = async () => {
    if (!publicKey) return 0
    const connection = new Connection(import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed')
    const lamports = await connection.getBalance(new (await import('@solana/web3.js')).PublicKey(publicKey))
    return lamports / LAMPORTS_PER_SOL
  }

  return {
    isInitialized,
    isLoggingIn,
    isLoggedIn,
    publicKey,
    login: connect,
    logout: disconnect,
    getBalance,
    signAndSend: async () => {
      throw new Error('Use useSignAndSendTransaction hook for sending transactions')
    },
    solanaWallet,
    user: userInfo,
  }
}

