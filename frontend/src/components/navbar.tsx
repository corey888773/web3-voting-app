import { validateJwt } from '@/jwt'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useDisconnect } from 'wagmi'

export default function Navbar() {
    const router = useRouter()
    const [cookie, setCookie] = useCookies(['jwt'])
    const [loggedIn, setLoggedIn] = useState(false)
    const disconnect = useDisconnect()

    const handleLogout = () => {
        setCookie('jwt', '', { path: '/' })
        setLoggedIn(false)
        disconnect.disconnect()
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
            <ul>
                {loggedIn ? (
                    <>
                        <li>
                            <div>
                                <a onClick={() => router.push('/poll/home')}>Home</a>
                            </div>
                        </li>
                        <li>
                            <div>
                                <a onClick={() => router.push('/poll/create')}>New Poll</a>
                            </div>
                        </li>
                        <li>
                            <div>
                                <a onClick={() => router.push('/poll/my')}>My Polls</a>
                            </div>
                        </li>
                        <li>
                            <div>
                                <a onClick={() => router.push('/poll/history')}>My Votes History</a>
                            </div>
                        </li>
                        <li>
                            <div>
                                <a onClick={handleLogout}>Logout</a>
                            </div>
                        </li>
                    </>
                ) : (
                    <li>
                        <div>
                            <a onClick={() => router.push('/login')}>Login</a>
                        </div>
                    </li>
                )}
            </ul>
        </nav>
    )
}
