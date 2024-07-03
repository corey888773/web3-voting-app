import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { contractAddresses, abi } from '../constants'
import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/apiService/apiService'
import { useCookies } from 'react-cookie'
import { validateJwt } from '@/jwt'

interface PollFormProps {
    pollId: String
    onVote: (data: { pollId: string; transactionHash: string; answers: Number[]; contractAddress: string }) => void
    voteDetails: { pollId: string; transactionHash: string; answers: Number[]; contractAddress: string }
}

export default function PollForm({ pollId, voteDetails, onVote }: PollFormProps) {
    const [cookies, setCookie] = useCookies(['jwt'])
    const account = useAccount()
    const chainId = account.chainId!
    const address = chainId in contractAddresses ? contractAddresses[chainId.toString()][0] : null
    const formattedAddress = address?.startsWith('0x') ? address.slice(2) : address
    const [disabled, setDisabled] = useState<boolean>(false)

    const [selectedAnswers, setSelectedAnswers] = useState<Number[]>([])
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const index = Number(event.target.value)
        if (event.target.checked) {
            setSelectedAnswers([...selectedAnswers, index])
        } else {
            setSelectedAnswers(selectedAnswers.filter((answerIndex: any) => answerIndex !== index))
        }
    }

    const { data: voteData, isSuccess, writeContract, isError, error, context, variables } = useWriteContract()
    async function vote(e: any) {
        e.preventDefault()
        try {
            const jwt = cookies.jwt
            if (!jwt) {
                alert('You need to be logged in to vote!')
                return
            }
            const isValid = await validateJwt(jwt)
            if (!isValid) {
                alert('You need to be logged in to vote!')
                window.location.reload()
                return
            }

            writeContract({
                address: `0x${formattedAddress}`,
                abi,
                args: [pollId, selectedAnswers],
                functionName: 'vote',
            })
        } catch (error: any) {
            console.error(error.message)
        }
    }

    useEffect(() => {
        if (isSuccess) {
            alert('Voted successfully!')

            const finalizeVote = async () => {
                try {
                    const answers = selectedAnswers.map((answer: any) => Number(answer))
                    const pollId = variables.args![0]?.toString()!
                    const transactionHash = voteData
                    const contractAddress = variables.address

                    const response = await apiService.vote({
                        contractAddress,
                        pollId,
                        answers,
                        transactionHash,
                    })

                    onVote({
                        pollId,
                        transactionHash,
                        answers,
                        contractAddress,
                    })

                    setDisabled(true)
                } catch (error: any) {
                    console.error(error?.message)
                }
            }
            finalizeVote()
        }

        if (isError) {
            alert('Error voting! ' + error?.message)
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

    if (getPollIsPending) {
        return <div>Loading... </div>
    }

    if (getPollError) {
        return (
            <div>
                {pollId.toString()} Error: {getPollError.message}
            </div>
        )
    }

    if (getPollData) {
        const poll = getPollData as any
        const pollId = poll[0]
        const question = poll[1]
        const answers = poll[2]
        const possibleAnswers = Number(poll[3])
        const timestamp = Number(poll[4])
        const endDate = new Date(timestamp * 1000).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })
        const state = poll[5]

        if (voteDetails) {
            const votedAnswers = answers.map((answer: string, index: number) => {
                return {
                    answer,
                    voted: voteDetails.answers.includes(index),
                }
            })

            return (
                <div>
                    <h1>{question}</h1>
                    <p>Id : {pollId}</p>
                    <p>You have already voted in this poll.</p>
                    {votedAnswers.map((votedAnswer: any, index: number) => (
                        <div key={index}>
                            <input
                                type="checkbox"
                                id={`answer-${index}`}
                                name="answer"
                                value={index}
                                disabled
                                checked={votedAnswer.voted}
                            />
                            <label htmlFor={`answer-${index}`}>{votedAnswer.answer}</label>
                        </div>
                    ))}
                    <p>EndDate: {endDate}</p>
                </div>
            )
        }

        return (
            <div>
                <form onSubmit={vote}>
                    <h1>{question}</h1>
                    <p>Id : {pollId}</p>
                    <h4>You can pick up to: {possibleAnswers} options.</h4>
                    {answers.map((answer: string, index: number) => (
                        <div key={index}>
                            <input
                                type="checkbox"
                                id={`answer-${index}`}
                                name="answer"
                                value={index}
                                disabled={disabled}
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor={`answer-${index}`}>{answer}</label>
                        </div>
                    ))}
                    <p>EndDate: {endDate}</p>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        )
    }

    return (
        <div>
            <h1>{getPollData?.toString()}</h1>
        </div>
    )
}
