import { parseClaims, validateJwt } from '@/jwt'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useAccount } from 'wagmi'
import Navbar from './navbar'

export default function Header() {
    const [cookies, setCookie] = useCookies(['jwt'])
    const [username, setUsername] = useState('')
    const account = useAccount()

    useEffect(() => {
        const fetchJwt = async () => {
            const jwt = cookies.jwt
            if (jwt) {
                const isValid = await validateJwt(jwt)
                if (isValid) {
                    const claims = parseClaims(jwt)
                    console.log('JWT claims:', claims)

                    setUsername(claims.username)
                }
            }
        }

        fetchJwt()
    }, [cookies.jwt])

    useEffect(() => {
        if (account.isDisconnected) {
            setCookie('jwt', '', { path: '/' })
            setUsername('')
        }
    }, [account.isDisconnected])

    return (
        <div>
            <Navbar />
            <ConnectButton />
            <h1>{username ? `Welcome, ${username}` : 'Welcome, Guest'}</h1>
        </div>
    )
}
