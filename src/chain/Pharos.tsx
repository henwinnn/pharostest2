import { Chain } from "@rainbow-me/rainbowkit";

// Define the Pharos Network as a custom chain
export const pharosNetwork = {
    id: 50002,
    name: "Pharos Devnet",
    iconUrl: "https://pharosnetwork.xyz/favicon.svg", // Replace with actual logo URL if available
    iconBackground: "#fff",
    nativeCurrency: {
      name: "Pharos",
      symbol: "PHS", // Replace with the actual token symbol if different
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["https://devnet.dplabs-internal.com"],
        webSocket: ["wss://devnet.dplabs-internal.com"],
      },
    },
    blockExplorers: {
      default: { name: "Pharos Explorer", url: "https://pharosscan.xyz" },
    },
    contracts: {
      multicall3: {
        address: "0xcA11bde05977b3631167028862bE2a173976CA11", // Replace with actual multicall address if known
        blockCreated: 7371844, // Replace with actual block if known
      },
    },
  } as const satisfies Chain;