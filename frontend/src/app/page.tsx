'use client'

import Header from '@/components/header'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import './page.css'

function App() {
    const account = useAccount()
    const { connectors, connect, status, error } = useConnect()
    const { disconnect } = useDisconnect()

    return (
        <div className="app-container">
            <Header />
            <div className="content">
                <h1>Connect Wallet to get access to polls</h1>
            </div>
        </div>
    )
}

export default App
