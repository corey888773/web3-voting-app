import { getNamedAccounts, ethers, network, deployments } from 'hardhat'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import fs from 'fs'

const FRONTEND_ADDRESSES_FILE = '../frontend/src/constants/contractAddresses.json'
const FRONTEND_ABIS_FILE = '../frontend/src/constants/abi.json'

module.exports = async function (hre: HardhatRuntimeEnvironment) {
    if (process.env.UPDATE_FRONTEND) {
        console.log('Updating front end')
        await updateContractAdresses()
        await updateABIs()
        console.log('-'.repeat(50))
    }
}

async function updateContractAdresses() {
    const deployer = (await getNamedAccounts()).deployer
    const pollSystem = await deployments.get('PollSystem')
    const pollSystemAddress = pollSystem.address
    const currentAddresses = JSON.parse(fs.readFileSync(FRONTEND_ADDRESSES_FILE).toString())
    const chainId = network.config.chainId!
    if (chainId in currentAddresses) {
        if (!currentAddresses[chainId].includes(pollSystemAddress)) {
            currentAddresses[chainId].push(pollSystemAddress)
        }
    } else {
        currentAddresses[chainId] = [pollSystemAddress]
    }
    fs.writeFileSync(FRONTEND_ADDRESSES_FILE, JSON.stringify(currentAddresses, null, 2))
}

async function updateABIs() {
    const deployer = (await getNamedAccounts()).deployer
    const pollSystem = await ethers.getContractAt('PollSystem', deployer)
    const pollSystemABI = pollSystem.interface.fragments
    fs.writeFileSync(FRONTEND_ABIS_FILE, JSON.stringify(pollSystemABI, null, 2))
}

module.exports.tags = ['front-end', 'all']
