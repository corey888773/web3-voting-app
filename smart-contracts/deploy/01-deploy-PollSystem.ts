import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { developmentChains } from '../helper-hardhat-config'
import { network } from 'hardhat'
import { verify } from '../utils/verify'

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const args: any = []
    const pollSystem = await deploy('PollSystem', {
        from: deployer,
        args: args,
        log: true,
    })
    log(`PollSystem deployed at ${pollSystem.address} for ${pollSystem.receipt?.gasUsed}`)
    log('-'.repeat(50))

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log('Verifying contract on Etherscan...')
        await verify(pollSystem.address, args)
        log('Contract verified')
        log('-'.repeat(50))
    }
}

module.exports.tags = ['all', 'PollSystem']
