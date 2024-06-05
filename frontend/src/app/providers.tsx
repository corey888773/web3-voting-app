'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'

import { RainbowKitProvider, connectorsForWallets, darkTheme } from '@rainbow-me/rainbowkit'
import { mainnet, sepolia, hardhat } from 'viem/chains'
import { metaMaskWallet, rainbowWallet, walletConnectWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets'

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [rainbowWallet, walletConnectWallet, metaMaskWallet, coinbaseWallet],
        },
    ],
    {
        appName: 'Smart Contract Lottery',
        projectId: 'YOUR_PROJECT_ID',
    },
)

const config = createConfig({
    chains: [mainnet, sepolia, hardhat],
    connectors,
    ssr: true,
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [hardhat.id]: http(),
    },
})

export function Providers(props: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()} modalSize="compact">
                    {props.children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
