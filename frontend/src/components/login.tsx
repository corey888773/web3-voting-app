import { apiService } from '@/services/apiService/apiService'

export default function LoginComponent() {
    // get signed message
    // send message to backend
    // get response
    const login = async () => {
        const response = await apiService.login({
            publicAddress: '0x123',
            signedMessage: 'signedMessage',
            nonce: 'nonce',
        })
        console.log(response)
    }

    return (
        <div>
            <h1>Login</h1>
            <button onClick={login}>Login</button>
        </div>
    )
}
