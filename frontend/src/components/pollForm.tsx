import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { contractAddresses, abi } from '../constants'
import React, { useState } from 'react'

interface PollFormProps {
    pollIndex: Number
}

export default function PollForm({ pollIndex }: PollFormProps) {
    const account = useAccount()
    const chainId = account.chainId!
    const address = chainId in contractAddresses ? contractAddresses[chainId.toString()][0] : null
    const formattedAddress = address?.startsWith('0x') ? address.slice(2) : address

    const [selectedAnswers, setSelectedAnswers] = useState<Number[]>([])
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const index = Number(event.target.value)
        if (event.target.checked) {
            setSelectedAnswers([...selectedAnswers, index])
        } else {
            setSelectedAnswers(selectedAnswers.filter((answerIndex: any) => answerIndex !== index))
        }
    }

    const { data: voteData, isSuccess, writeContract, isError, error } = useWriteContract()
    async function vote(e: any) {
        e.preventDefault()
        try {
            writeContract({
                address: `0x${formattedAddress}`,
                abi,
                args: [pollIndex, selectedAnswers],
                functionName: 'vote',
            })
        } catch (error: any) {
            console.error(error.message)
        }
    }
    if (isSuccess) {
        alert('Voted successfully!')
    }

    if (account && isError) {
        alert('Error voting! ' + error?.message)
    }

    const {
        data: getPollData,
        error: getPollError,
        isPending: getPollIsPending,
        refetch: refetchEntranceFee,
    } = useReadContract({
        abi,
        address: `0x${formattedAddress}`,
        functionName: 'getPoll',
        args: [pollIndex],
    })

    if (getPollIsPending) {
        return <div>Loading... </div>
    }

    if (getPollError) {
        return <div>Error: {getPollError.message}</div>
    }

    if (getPollData) {
        const poll = getPollData as any
        const question = poll[0]
        const answers = poll[1]
        const possibleAnswers = Number(poll[2])
        const timestamp = Number(poll[3])
        const endDate = new Date(timestamp * 1000).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })
        const state = poll[4]

        return (
            <div>
                <form onSubmit={vote}>
                    <h1>{question}</h1>
                    <h4>You can pick up to: {possibleAnswers} options.</h4>
                    {answers.map((answer: string, index: number) => (
                        <div key={index}>
                            <input
                                type="checkbox"
                                id={`answer-${index}`}
                                name="answer"
                                value={index}
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
