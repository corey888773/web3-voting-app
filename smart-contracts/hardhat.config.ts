import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import 'dotenv/config'
import 'solidity-coverage'
import 'hardhat-gas-reporter'
import 'hardhat-contract-sizer'

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL!
const PRIVATE_KEY = process.env.PRIVATE_KEY!
const CHAIN_ID = parseInt(process.env.CHAIN_ID!)
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY!

const config: HardhatUserConfig = {
    solidity: '0.8.24',
    defaultNetwork: 'hardhat',
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: CHAIN_ID,
        },
        localhost: {
            url: 'http://127.0.0.1:8545',
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
    mocha: {
        timeout: 20 * 60 * 1000, // 20 mins
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        currency: 'USD',
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
}

export default config
