import { validateJwt } from '@/jwt'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import './navbar.css'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    const [cookie, setCookie] = useCookies(['jwt'])
    const [loggedIn, setLoggedIn] = useState(false)
    const disconnect = useDisconnect()

    const handleLogout = () => {
        setCookie('jwt', '', { path: '/' })
        setLoggedIn(false)
        disconnect.disconnect()
        router.push('/login')
    }

    useEffect(() => {
        const fetchJwt = async () => {
            const jwt = cookie.jwt
            if (jwt) {
                const isValid = await validateJwt(jwt)
                if (isValid) {
                    setLoggedIn(true)
                }
            }
        }

        fetchJwt()
    }, [cookie.jwt])

    return (
        <nav>
            <div className="navbar-left">
                <ConnectButton />
            </div>
            <ul className="navbar-right">
                {loggedIn ? (
                    <>
                        <li className={pathname === '/poll/home' ? 'active' : ''}>
                            <a onClick={() => router.push('/poll/home')}>Home</a>
                        </li>
                        <li className={pathname === '/poll/create' ? 'active' : ''}>
                            <a onClick={() => router.push('/poll/create')}>New Poll</a>
                        </li>
                        <li className={pathname === '/poll/my' ? 'active' : ''}>
                            <a onClick={() => router.push('/poll/my')}>My Polls</a>
                        </li>
                        <li className={pathname === '/poll/history' ? 'active' : ''}>
                            <a onClick={() => router.push('/poll/history')}>My Votes History</a>
                        </li>
                        <li>
                            <a onClick={handleLogout}>Logout</a>
                        </li>
                    </>
                ) : (
                    <li className={pathname === '/login' ? 'active' : ''}>
                        <a onClick={() => router.push('/login')}>Login</a>
                    </li>
                )}
            </ul>
        </nav>
    )
}
