import { v4 as uuid } from 'uuid'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { decodeBase64 } from 'ethers'
import { randomBytes } from 'crypto'

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, getChainId } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await getChainId()

    const pollSystemDeployment = await deployments.get('PollSystem')
    const pollSystem = await hre.ethers.getContractAt('PollSystem', pollSystemDeployment.address)

    const pollDuration = 1 * 60 * 60 // 1 hour in seconds
    const mockPolls = [
        {
            id: randomBytes(32),
            question: 'What is your favorite color?',
            answers: ['Red', 'Green', 'Blue', 'Yellow'],
            possibleAnswers: 3,
        },
        {
            id: randomBytes(32),
            question: 'What is your favorite animal?',
            answers: ['Dog', 'Cat', 'Bird'],
            possibleAnswers: 1,
        },
        {
            id: randomBytes(32),
            question: 'What is your favorite food?',
            answers: ['Pizza', 'Burger'],
            possibleAnswers: 1,
        },
        {
            id: randomBytes(32),
            question: 'What is your favorite drink?',
            answers: ['Coke', 'Sprite', 'Fanta'],
            possibleAnswers: 2,
        },
        {
            id: randomBytes(32),
            question: 'What is your favorite car?',
            answers: ['BMW', 'Mercedes', 'Audi', 'Volkswagen'],
            possibleAnswers: 3,
        },
        {
            id: randomBytes(32),
            question: 'What is your favorite programming language?',
            answers: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#'],
            possibleAnswers: 2,
        },
        {
            id: randomBytes(32),
            question: 'What is your favorite sport?',
            answers: ['Football', 'Basketball', 'Tennis', 'Golf'],
            possibleAnswers: 2,
        },
        {
            id: randomBytes(32),
            question: 'What is your favorite movie?',
            answers: ['Inception', 'Interstellar', 'The Dark Knight', 'Tenet'],
            possibleAnswers: 3,
        },
        {
            id: randomBytes(32),
            question: 'What is your favorite book?',
            answers: ['Harry Potter', 'The Lord of the Rings', 'The Hobbit', 'The Chronicles of Narnia'],
            possibleAnswers: 2,
        },
        {
            id: randomBytes(32),
            question: 'What is your favorite music genre?',
            answers: ['Rock', 'Pop', 'Rap', 'Jazz', 'Classical'],
            possibleAnswers: 2,
        },
        {
            id: randomBytes(32),
            question: 'What is your favorite TV show?',
            answers: ['Breaking Bad', 'Game of Thrones', 'Friends', 'The Office'],
            possibleAnswers: 1,
        },
    ]

    console.log('Creating mock polls...')
    for (let i = 0; i < mockPolls.length; i++) {
        const poll = mockPolls[i]
        const tx = await pollSystem.createPoll(poll.id, poll.question, poll.answers, poll.possibleAnswers, pollDuration)
        await tx.wait()
    }

    for (let i = 0; i < mockPolls.length; i++) {
        const poll = mockPolls[i]
        console.log(`Poll ${i + 1}:`)
        console.log(`  ID: 0x${poll.id.toString('hex')}`)
        console.log(`  Question: ${poll.question}`)
        console.log(`  Answers: ${poll.answers}`)
        console.log(`  Possible Answers: ${poll.possibleAnswers}`)
        console.log()
    }

    console.log('Mock polls created')
    console.log('-'.repeat(50))
}

module.exports.tags = ['mock-polls', 'all']
