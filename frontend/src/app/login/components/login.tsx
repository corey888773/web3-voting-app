import { useEffect, useRef, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ErrorResponse, NonceResponse } from '@/services/apiService/responses'
import Header from '@/components/header'
import { apiService } from '@/services/apiService/apiService'
import { GetServerSideProps } from 'next'

export default function LoginComponent() {
    const account = useAccount()
    const router = useRouter()
    const [nonce, setNonce] = useState('')
    const { signMessage, data: signedMessage } = useSignMessage()

    const hanldleLogin = async () => {
        console.log('handle login')

        if (!account.address) {
            console.log('No address')
            return
        }

        try {
            const nonceResponse = await apiService.nonce({ publicAddress: account.address })
            console.log(nonceResponse)
            setNonce(nonceResponse.nonce)
            signMessage({ message: nonceResponse.nonce })
        } catch (error) {
            console.error(error)
            router.push('/register')
        }
    }

    const [isFirstRender, setIsFirstRender] = useState(true)
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            return
        }

        if (account.address) {
            hanldleLogin()
        }
    }, [account.isConnected])

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            return
        }

        if (signedMessage) {
            const publicAddress = account.address!

            console.log({ publicAddress, signedMessage, nonce })

            apiService
                .login({ publicAddress, signedMessage, nonce })
                .then((response) => {
                    if ((response as ErrorResponse).message) {
                        console.log((response as ErrorResponse).message)
                        return
                    }
                    router.push('/poll/home')
                    console.log(response)
                })
                .catch((error) => {
                    console.log(error)
                    router.push('/register')
                })
        }
    }, [signedMessage])

    const initialized = useRef(false)

    return (
        <div>
            <Header />
        </div>
    )
}
