import { abi, contractAddresses } from '@/constants'
import { apiService } from '@/services/apiService/apiService'
import { useEffect, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import PollForm from './pollForm'
import MyPollForm from './myPollForm'

function MyPollsTable() {
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

    const handleVote = (data: {
        pollId: string
        transactionHash: string
        answers: Number[]
        contractAddress: string
    }) => {
        setPolls([...polls, data])
    }

    const {
        data: getOpenPollsData,
        isError: getOpenPollsIsError,
        error: getOpenPollsError,
        isPending: getOpenPollsIsPending,
        refetch: refetchEntranceFee,
    } = useReadContract({
        abi,
        address: `0x${formattedContractAddress}`,
        functionName: 'getMyPolls',
        args: [account.address],
    })

    if (getOpenPollsIsPending) {
        return <div>Loading... </div>
    }

    if (getOpenPollsIsError) {
        return <div>Error: {getOpenPollsError.message}</div>
    }

    if (getOpenPollsData) {
        const allPolls = getOpenPollsData as any
        const allPollsIds = allPolls.map((pollId: any) => pollId)

        const pollsWithState = allPollsIds.map((pollId: any) => {
            return {
                pollId: pollId,
                voteDetails: polls.find((poll: any) => poll.pollId === pollId),
            }
        })

        if (pollsWithState.length === 0) {
            return <div>No polls</div>
        }

        return (
            <div>
                {pollsWithState.map((poll: any, index: number) => (
                    <MyPollForm key={index} pollId={poll.pollId} voteDetails={poll.voteDetails} onVote={handleVote} />
                ))}
            </div>
        )
    }

    return <div>no polls</div>
}

export default MyPollsTable
