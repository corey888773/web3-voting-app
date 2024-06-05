import { HardhatRuntimeEnvironment } from 'hardhat/types'

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
            question: 'What is your favorite color?',
            answers: ['Red', 'Green', 'Blue', 'Yellow'],
            possibleAnswers: 3,
        },
        {
            question: 'What is your favorite animal?',
            answers: ['Dog', 'Cat', 'Bird'],
            possibleAnswers: 1,
        },
        {
            question: 'What is your favorite food?',
            answers: ['Pizza', 'Burger'],
            possibleAnswers: 1,
        },
    ]

    console.log('Creating mock polls...')
    for (let i = 0; i < mockPolls.length; i++) {
        const poll = mockPolls[i]
        const tx = await pollSystem.createPoll(poll.question, poll.answers, poll.possibleAnswers, pollDuration)
        await tx.wait()
    }

    console.log('Mock polls created')
    console.log('-'.repeat(50))
}

module.exports.tags = ['mock-polls', 'all']
