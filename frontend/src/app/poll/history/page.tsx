'use client'

import Header from '@/components/header'
import HistoryTable from '@/components/historyTable'
import WalletConnectedWrapper from '@/components/walletConnectedWrapper'

export default function Home() {
    return (
        <>
            <div>
                <WalletConnectedWrapper>
                    <Header />
                    <HistoryTable />
                </WalletConnectedWrapper>
            </div>
        </>
    )
}
