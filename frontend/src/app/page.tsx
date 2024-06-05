'use client'

import ApiTest from '@/components/apiTest'
import CreatePoll from '@/components/createPoll'
import Header from '@/components/header'
import LoginComponent from '@/components/login'
import PollForm from '@/components/pollForm'
import PollTable from '@/components/pollTable'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function App() {
    const account = useAccount()
    const { connectors, connect, status, error } = useConnect()
    const { disconnect } = useDisconnect()

    if (!account.isConnected) {
        return (
            <div>
                <LoginComponent />
                <ApiTest />
                <Header />
                <h1>Connect Wallet to get access to polls</h1>
            </div>
        )
    }

    return (
        <>
            <div>
                <Header />
                <PollTable />
                <CreatePoll />
            </div>
        </>
    )
}

export default App
