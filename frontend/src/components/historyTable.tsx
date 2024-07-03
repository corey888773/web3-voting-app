import React, { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { contractAddresses, abi } from '../constants'
import { apiService } from '@/services/apiService/apiService'
import HistoryVote from './historyVote'
import './styles/historyTable.css'

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

                // Usunięcie zduplikowanych ankiet na podstawie pollId
                const uniquePolls = Array.from(new Set(json.map((poll: any) => poll.pollId))).map((pollId) => {
                    return json.find((poll: any) => poll.pollId === pollId)
                })

                setPolls(uniquePolls)
            } catch (error: any) {
                console.error(error.message)
            }
        }

        getUserVotes()
    }, [])

    console.log(polls)

    if (polls.length > 0 && polls[0].pollId)
        return (
            <div className="history-table">
                {polls.map((poll: any, index: number) => (
                    <HistoryVote key={index} voteDetails={poll} />
                ))}
            </div>
        )

    return <div className="no-polls">No polls</div>
}

export default HistoryTable
