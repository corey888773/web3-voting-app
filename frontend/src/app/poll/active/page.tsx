'use client'

import CreatePoll from '@/components/createPoll'
import Header from '@/components/header'
import PollTable from '@/components/pollTable'
import WalletConnectedWrapper from '@/components/walletConnectedWrapper'
import { Suspense } from 'react'

export default function Home() {
    return (
        <>
            <div>
                <WalletConnectedWrapper>
                    <Header />
                    <Suspense fallback={<p>Loading feed...</p>}>
                        <PollTable />
                    </Suspense>
                </WalletConnectedWrapper>
            </div>
        </>
    )
}
