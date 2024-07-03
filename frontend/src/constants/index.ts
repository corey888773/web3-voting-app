import abi from './abi.json'
import addresses from './contractAddresses.json'

type AddressesType = { [key: string]: string[] }

const contractAddresses: AddressesType = addresses

export { abi, contractAddresses }
