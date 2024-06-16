import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { contractAddresses, abi } from '../constants'
import React, { useEffect, useState } from 'react'
import { apiService } from '@/services/apiService/apiService'
import { useCookies } from 'react-cookie'
import { validateJwt } from '@/jwt'

interface HistoryVoteProps {
    voteDetails: { pollId: string; transactionHash: string; answers: Number[]; contractAddress: string }
}

export default function HistoryVote({ voteDetails }: HistoryVoteProps) {
    const [cookies, setCookie] = useCookies(['jwt'])
    const account = useAccount()
    const chainId = account.chainId!
    const address = chainId in contractAddresses ? contractAddresses[chainId.toString()][0] : null
    const formattedAddress = address?.startsWith('0x') ? address.slice(2) : address

    const { data: voteData, isSuccess, writeContract, isError, error, context, variables } = useWriteContract()

    useEffect(() => {
        if (isSuccess) {
            alert('Voted successfully!')
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
        args: [voteDetails.pollId],
    })

    if (getPollIsPending) {
        return <div>Loading... </div>
    }

    if (getPollError) {
        return (
            <div>
                {voteDetails.pollId.toString()} Error: {getPollError.message}
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

        const votedAnswers = answers.map((answer: string, index: number) => {
            return {
                answer,
                voted: voteDetails.answers.includes(index),
            }
        })

        if (pollId !== voteDetails.pollId) {
            return <div></div>
        }

        return (
            <div>
                <h1>{question}</h1>
                <p>Id : {pollId}</p>
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
}
