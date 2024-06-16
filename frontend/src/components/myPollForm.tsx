import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { contractAddresses, abi } from '../constants'
import React, { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { validateJwt } from '@/jwt'

interface PollFormProps {
    pollId: Number
    onVote: (data: { pollId: string; transactionHash: string; answers: Number[]; contractAddress: string }) => void
    voteDetails: { pollId: string; transactionHash: string; answers: Number[]; contractAddress: string }
}

enum PollState {
    OPEN = 0,
    LOCKED = 1,
}

export default function MyPollForm({ pollId, voteDetails, onVote }: PollFormProps) {
    const [cookies, setCookie] = useCookies(['jwt'])
    const account = useAccount()
    const chainId = account.chainId!
    const address = chainId in contractAddresses ? contractAddresses[chainId.toString()][0] : null
    const formattedAddress = address?.startsWith('0x') ? address.slice(2) : address
    const [question, setQuestion] = useState<string>('')
    const [answers, setAnswers] = useState<string[]>([])
    const [timestamp, setTimestamp] = useState<number>(0)
    const [endDate, setEndDate] = useState<string>('')
    const [creatorAddress, setCreatorAddress] = useState<string>('')
    const [results, setResults] = useState<any[]>([])
    const [state, setState] = useState<PollState>(PollState.OPEN)

    const { data: lockData, isSuccess, writeContract, isError, error, context, variables } = useWriteContract()
    async function lockPoll(e: any) {
        e.preventDefault()
        try {
            const jwt = cookies.jwt
            if (!jwt) {
                alert('You need to be logged in to lock poll!')
                return
            }
            const isValid = await validateJwt(jwt)
            if (!isValid) {
                alert('You need to be logged in to lock poll!')
                window.location.reload()
                return
            }

            writeContract({
                address: `0x${formattedAddress}`,
                abi,
                args: [pollId],
                functionName: 'lockPoll',
            })
        } catch (error: any) {
            console.error(error.message)
        }
    }

    useEffect(() => {
        if (isSuccess) {
            alert('Poll locked successfully!')
            setState(PollState.LOCKED)
        }

        if (isError) {
            alert('Error locking poll: ' + error?.message)
        }
    }, [isSuccess, isError])

    const {
        data: getPollData,
        error: getPollError,
        isPending: getPollIsPending,
        refetch: refetchEntranceFee,
    } = useReadContract({
        abi,
        address: `0x${formattedAddress}`,
        functionName: 'getPoll',
        args: [pollId],
    })

    const {
        data: getPollResultsData,
        error: getPollResultsError,
        isPending: getPollResultsIsPending,
        refetch: refetchPollResults,
    } = useReadContract({
        abi,
        address: `0x${formattedAddress}`,
        functionName: 'getPollResults',
        args: [pollId],
    })

    useEffect(() => {
        if (getPollData && getPollResultsData) {
            const poll = getPollData as any
            const question = poll[1]
            setQuestion(question)
            const answers = poll[2] as string[]
            setAnswers(answers)
            const timestamp = Number(poll[4])
            setTimestamp(timestamp)
            const endDate = new Date(timestamp * 1000).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })
            setEndDate(endDate)
            const state = Number(poll[5])
            setState(state)
            const creatorAddress = poll[6]
            setCreatorAddress(creatorAddress)
            const results = (getPollResultsData as any).map((result: any) => Number(result))
            setResults(results)
        }
    }, [getPollData, getPollResultsData])

    if (getPollIsPending || getPollResultsIsPending) {
        return <div>Loading... </div>
    }

    if (getPollError || getPollResultsError) {
        return <div>{pollId.toString()} Error</div>
    }

    if (getPollData && getPollResultsData) {
        return (
            <div>
                <h1>{question}</h1>
                <p>
                    Id: {pollId.toString()} <br />
                    Creator: {creatorAddress}
                </p>
                <h2>Results</h2>
                {results.map((result: any, index: any) => (
                    <div>
                        <p>
                            {answers[index]}: {result}
                        </p>
                    </div>
                ))}

                <h2>State: {PollState[state]}</h2>
                {PollState[state] === 'OPEN' && <button onClick={lockPoll}>LOCK NOW</button>}
                <p>EndDate: {endDate}</p>
            </div>
        )
    }

    return (
        <div>
            <h1>{getPollData?.toString()}</h1>
        </div>
    )
}
