'use client'

import Header from '@/components/header'
import HistoryTable from '@/components/historyTable'
import WalletConnectedWrapper from '@/components/walletConnectedWrapper'
import './page.css'

export default function Home() {
    return (
        <>
            <div className="page-container">
                <WalletConnectedWrapper>
                    <Header />
                    <div className="history-content">
                        <HistoryTable />
                    </div>
                </WalletConnectedWrapper>
            </div>
        </>
    )
}
