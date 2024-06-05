import React, { useState, useEffect } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { contractAddresses, abi } from '../constants'

export default function CreatePoll() {
    const account = useAccount()
    const chainId = account.chainId!
    const address = chainId in contractAddresses ? contractAddresses[chainId.toString()][0] : null
    const formattedAddress = address?.startsWith('0x') ? address.slice(2) : address

    const { writeContract, isSuccess, isError, error } = useWriteContract()

    const [question, setQuestion] = useState('')
    const [options, setOptions] = useState([''])
    const [endDate, setEndDate] = useState('')
    const [possibleAnswers, setPossibleAnswers] = useState(1)

    const handleEndDateChange = (event: any) => {
        setEndDate(event.target.value)
    }

    const handlePossibleAnswersChange = (event: any) => {
        setPossibleAnswers(event.target.value)
    }

    const handleQuestionChange = (event: any) => {
        setQuestion(event.target.value)
    }

    const handleOptionChange = (index: any) => (event: any) => {
        const newOptions = [...options]
        newOptions[index] = event.target.value
        setOptions(newOptions)
    }

    const handleAddOption = () => {
        setOptions([...options, ''])
    }

    const handleSubmit = async (event: any) => {
        // duration = endDate - now in seconds
        const duration = new Date(endDate).getTime() - Date.now()

        event.preventDefault()
        const args = [question, options, BigInt(duration), BigInt(possibleAnswers)]
        await writeContract({
            address: `0x${formattedAddress}`,
            abi,
            args,
            functionName: 'createPoll',
        })
    }
    if (isSuccess) {
        alert('Poll created successfully!')
    }
    if (isError) {
        alert('Error creating poll! ' + error?.message)
    }

    useEffect(() => {
        if (isSuccess) {
            setQuestion('')
            setOptions([''])
            setEndDate('')
            setPossibleAnswers(1)
        }
    }, [isSuccess])

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Question:
                <input type="text" value={question} onChange={handleQuestionChange} />
            </label>
            {options.map((option, index) => (
                <label key={index}>
                    Option {index + 1}:
                    <input type="text" value={option} onChange={handleOptionChange(index)} />
                </label>
            ))}
            <label>
                End Date:
                <input type="datetime-local" value={endDate} onChange={handleEndDateChange} />
            </label>
            <label>
                Possible Answers:
                <input type="number" min="1" value={possibleAnswers} onChange={handlePossibleAnswersChange} />
            </label>
            <button type="button" onClick={handleAddOption}>
                Add option
            </button>
            <input type="submit" value="Create Poll" />
        </form>
    )
}
