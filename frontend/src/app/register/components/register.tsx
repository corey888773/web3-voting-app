import { useState } from 'react'
import { apiService } from '@/services/apiService/apiService'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'

export default function RegisterComponent() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const router = useRouter()
    const account = useAccount()

    const handleSubmit = (event: any) => {
        event.preventDefault()
        console.log('submit')

        apiService
            .register({ mail: email, username, publicAddress: account.address! })
            .then((response) => {
                console.log(response)

                router.push('/poll/home')
            })
            .catch((error) => {
                console.error(error)
            })
    }

    return (
        <div>
            <h2>Register Page</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <input type="submit" value="Register" />
            </form>
        </div>
    )
}
