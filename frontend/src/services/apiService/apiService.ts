import axios from 'axios'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

export const apiService = {
    async register(data: { mail: string; username: string; publicAddress: string }) {
        try {
            const response = await axios.post(`${backendUrl}/api/auth/register`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            console.log(response)
            return response.data
        } catch (error) {
            throw new Error('Network response was not ok')
        }
    },

    async login(data: { publicAddress: string; signedMessage: string; nonce: string }) {
        try {
            const response = await axios.post(`${backendUrl}/api/auth/login`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            })

            console.log(response)
            return response.data
        } catch (error: any) {
            throw new Error('Network response was not ok ' + error.message)
        }
    },

    async nonce(data: { publicAddress: string }) {
        try {
            const response = await axios.post(`${backendUrl}/api/auth/nonce`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            console.log(response)

            return response.data
        } catch (error) {
            throw new Error('Network response was not ok')
        }
    },

    async refreshJwt(data: { publicAddress: string }, headers: any) {
        const response = await fetch(`${backendUrl}/api/jwt/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        })

        console.log(JSON.stringify(data))

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText)
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

    async vote(data: { contractAddress: string; pollId: string; answers: number[]; transactionHash: string }) {
        const response = await fetch(`${backendUrl}/api/polls/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        return response
    },

    async getUserVotes(data: { contractAddress: string }) {
        const response = await fetch(`${backendUrl}/api/polls/votes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        return response
    },

    async createPoll(data: {
        contractAddress: string
        transactionHash: string
        pollId: string
        question: string
        options: String[]
        possibleAnswers: Number
        endDateTime: Number
        creatorAddress: String
    }) {
        const response = await fetch(`${backendUrl}/api/polls/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        return response
    },
}
