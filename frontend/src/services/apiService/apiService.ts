import { ErrorResponse } from './responses'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

export const apiService = {
    async register(data: { mail: string; username: string; publicAddress: string }) {
        const response = await fetch(`${backendUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        return response.json()
    },

    async login(data: { publicAddress: string; signedMessage: string; nonce: string }) {
        const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        console.log(response)

        if (!response.ok) {
            return response.json() as Promise<ErrorResponse>
        }

        return response.json()
    },

    async nonce(data: { publicAddress: string }) {
        const response = await fetch(`${backendUrl}/api/auth/nonce`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            return response.json() as Promise<ErrorResponse>
        }

        return response.json()
    },

    async hello() {
        const response = await fetch(`${backendUrl}/api/hello`, {
            method: 'GET',
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        return response
    },
}
