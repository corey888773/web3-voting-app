import { ReactNode } from 'react'
import { useAccount } from 'wagmi'

export default function WalletConnectedWrapper({ children }: { children: ReactNode }) {
    const account = useAccount()

    if (!account.address) {
        return (
            <div>
                Wallet not connected, go to <a href="/login">Login Page</a>
            </div>
        )
    }

    return <div>{children}</div>
}
