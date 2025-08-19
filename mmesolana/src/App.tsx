import './App.css'
import { Web3AuthProvider } from './lib/web3auth'
import WalletPanel from './components/WalletPanel'
import SolanaPayPanel from './components/SolanaPayPanel'

function App() {
  return (
    <Web3AuthProvider>
      <h1>MetaMask Embedded Wallets + Solana</h1>
      <WalletPanel />
      <SolanaPayPanel />
    </Web3AuthProvider>
  )
}

export default App
