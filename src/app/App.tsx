"use client";
import "@rainbow-me/rainbowkit/styles.css";
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
  
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
// import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { pharosNetwork } from "@/chain/Pharos";



// Set up the RainbowKit configuration with your custom chain
const config = getDefaultConfig({
  appName: "Pharos Network App",
  projectId: "YOUR_PROJECT_ID", // Replace with your WalletConnect projectId
  chains: [pharosNetwork],
});

const queryClient = new QueryClient();

function App({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
