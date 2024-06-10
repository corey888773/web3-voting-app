'use client'

import Header from '@/components/header'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function App() {
    const account = useAccount()
    const { connectors, connect, status, error } = useConnect()
    const { disconnect } = useDisconnect()

    return (
        <div>
            <Header />
            <h1>Connect Wallet to get access to polls</h1>
        </div>
    )
}

export default App
