export interface NetworkConfig {
  [networkId: number]: {
    name: string;
  };
}

export const networkConfig: NetworkConfig = {
  11155111: {
    name: "sepolia",
  },
  31337: {
    name: "localhost",
  },
};

export const developmentChains = ["hardhat", "localhost"];
