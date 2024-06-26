import { useState } from 'react'
import { apiService } from '@/services/apiService/apiService'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import './register.css'

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
                alert('Error: ' + error.message)
            })
    }

    return (
        <div className="register-container">
            <h2 className="text-3xl font-bold mb-6">Register Page</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label className="form-label">Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                    />
                </div>
                <input type="submit" value="Register" className="form-submit" />
            </form>
        </div>
    )
}
