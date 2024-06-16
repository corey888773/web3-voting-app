import React, { useEffect, useState } from 'react'
import PollForm from './pollForm'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { contractAddresses, abi } from '../constants'
import { apiService } from '@/services/apiService/apiService'
import HistoryVote from './historyVote'

const HistoryTable = () => {
    const account = useAccount()
    const chainId = account.chainId!
    const address = chainId in contractAddresses ? contractAddresses[chainId.toString()][0] : null
    const formattedContractAddress = address?.startsWith('0x') ? address.slice(2) : address
    let [polls, setPolls] = useState<any[]>([])

    useEffect(() => {
        const getUserVotes = async () => {
            try {
                console.log(formattedContractAddress)

                const response = await apiService.getUserVotes({ contractAddress: `0x${formattedContractAddress}` })
                const json = await response.json()
                console.log(json)

                setPolls(json)
            } catch (error: any) {
                console.error(error.message)
            }
        }

        getUserVotes()
    }, [])

    console.log(polls)

    if (polls.length > 0 && polls[0].pollId)
        return (
            <div>
                {polls.map((poll: any, index: number) => (
                    <HistoryVote key={index} voteDetails={poll} />
                ))}
            </div>
        )

    return <div>no polls</div>
}

export default HistoryTable
