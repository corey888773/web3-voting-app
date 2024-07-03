'use client'

import Header from '@/components/header'
import MyPollsTable from '@/components/myPollsTable'
import WalletConnectedWrapper from '@/components/walletConnectedWrapper'
import { Suspense } from 'react'

export default function Home() {
    return (
        <>
            <div>
                <WalletConnectedWrapper>
                    <Header />
                    <Suspense fallback={<p>Loading feed...</p>}>
                        <MyPollsTable />
                    </Suspense>
                </WalletConnectedWrapper>
            </div>
        </>
    )
}
