import { apiService } from '@/services/apiService/apiService'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'

export default function Header() {
    const account = useAccount()
    const router = useRouter()
    let previouslyConnected = useRef(account.isConnected)

    const hanldleLogin = async () => {
        console.log('handle login')

        if (!account.address) {
            console.log('No address')
            return
        }

        const response = await apiService.nonce({ publicAddress: account.address })
        console.log(response)
    }

    useEffect(() => {
        if (account.address) {
            hanldleLogin()
        }
    }, [account.isConnected])

    return (
        <div>
            <ConnectButton />
        </div>
    )
}
