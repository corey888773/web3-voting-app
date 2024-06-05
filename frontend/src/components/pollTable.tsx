import React, { useEffect, useState } from 'react'
import PollForm from './pollForm'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { contractAddresses, abi } from '../constants'

const PollTable = () => {
    const account = useAccount()
    const chainId = account.chainId!
    const address = chainId in contractAddresses ? contractAddresses[chainId.toString()][0] : null
    const formattedAddress = address?.startsWith('0x') ? address.slice(2) : address

    const {
        data: getOpenPollsData,
        isError: getOpenPollsIsError,
        error: getOpenPollsError,
        isPending: getOpenPollsIsPending,
        refetch: refetchEntranceFee,
    } = useReadContract({
        abi,
        address: `0x${formattedAddress}`,
        functionName: 'getOpenPolls',
        args: [],
    })

    if (getOpenPollsIsPending) {
        return <div>Loading... </div>
    }

    if (getOpenPollsIsError) {
        return <div>Error: {getOpenPollsError.message}</div>
    }

    if (getOpenPollsData) {
        const polls = getOpenPollsData as any

        return (
            <div>
                {polls.map((pollIndex: any, index: number) => (
                    <PollForm key={index} pollIndex={pollIndex} />
                ))}
            </div>
        )
    }

    return <div>no polls</div>
}

export default PollTable
