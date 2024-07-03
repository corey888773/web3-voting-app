'use client'

import CreatePoll from '@/components/createPoll'
import Header from '@/components/header'
import PollTable from '@/components/pollTable'
import WalletConnectedWrapper from '@/components/walletConnectedWrapper'

export default function Home() {
    return (
        <>
            <div>
                <WalletConnectedWrapper>
                    <Header />
                    <PollTable />
                </WalletConnectedWrapper>
            </div>
        </>
    )
}
