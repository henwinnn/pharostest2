"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Calculator, Info, Moon, Sun } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  injected,
  useAccount,
  useConnect,
  useWriteContract,
} from "wagmi";
import {
  EURCContract,
  IDRXContract,
  stableSwapContract,
  USDCContract,
} from "@/contracts/contracts";
import { useTokenContracts } from "@/custom-hooks/readContracts";
import { formatEther, parseUnits } from "viem";
import { pharosNetwork } from "@/chain/Pharos";

export default function TokenSwapPage() {
  const [fromToken, setFromToken] = useState("IDRX");
  const [toToken, setToToken] = useState("USDC");
  const [indexFromToken, setIndexFromToken] = useState(0);
  const [indexToToken, setIndexToToken] = useState(1);
  const [amount, setAmount] = useState("");
  const [theme, setTheme] = useState("light");
  const [expectedOutput, setExpectedOutput] = useState("0.0");
  const [exchangeRate, setExchangeRate] = useState("0.0");

  const account = useAccount();
  const { connectAsync } = useConnect();
  const {  writeContractAsync } = useWriteContract();
  const addressUser = account.address || "";
  const dataIDRX = useTokenContracts(IDRXContract, addressUser);
  const dataUSDC = useTokenContracts(USDCContract, addressUser);
  const dataEURC = useTokenContracts(EURCContract, addressUser);

  function getContract() {
   if (indexFromToken === 0) {
      return IDRXContract;
    } else if (indexFromToken === 1) {
      return USDCContract;
    } else if (indexFromToken === 2) {
      return EURCContract;
    }
  }

  // Mock exchange rates (in a real app, these would come from an API or blockchain)
  const exchangeRates: Record<string, number> = {
    "IDRX-USDC": 0.0000606, // 1 IDRX = 0.0000606 USDC (1/16500)
    "IDRX-EURC": 0.0000557, // 1 IDRX = 0.0000557 EURC (1/17944)
    "USDC-IDRX": 16500, // 1 USDC = 16500 IDRX
    "USDC-EURC": 1.09, // 1 USDC = 1.09 EURC
    "EURC-IDRX": 17944, // 1 EURC = 17944 IDRX
    "EURC-USDC": 0.92, // 1 EURC = 0.92 USDC
  };

  // Calculate expected output when amount, fromToken, or toToken changes
  useEffect(() => {
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      const pair = `${fromToken}-${toToken}`;
      const rate = exchangeRates[pair] || 0;
      const output = Number(amount) * rate;
      setExchangeRate(rate.toFixed(6));
      setExpectedOutput(output.toFixed(6));
    } else {
      setExpectedOutput("0.0");
      setExchangeRate("0.0");
    }
  }, [amount, fromToken, toToken]);

  // Initialize theme from localStorage if available
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Mock function to simulate token swap
  const swapTokens = async () => {
    try {
      if (!addressUser) {
        alert("Please connect your wallet first");
        await connectAsync({ chainId: pharosNetwork.id, connector: injected() });
        return;
      }

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      if (fromToken === toToken) {
        alert("Please select different tokens to swap");
        return;
      }

      const contract = getContract();
      if (!contract) {
        console.error("Invalid token index. Contract not found.");
        return;
      }

      // Check balances
      if(dataIDRX || dataUSDC || dataEURC) {
        const balanceChecks = {
          0: dataIDRX?.balance?.status === "success" ? Number(formatEther(dataIDRX.balance.result)) : 0,
          1: dataUSDC?.balance?.status === "success" ? Number(formatEther(dataUSDC.balance.result)) : 0,
          2: dataEURC?.balance?.status === "success" ? Number(formatEther(dataEURC.balance.result)) : 0,
        } as const;

        if (balanceChecks[indexFromToken as keyof typeof balanceChecks] < Number(amount)) {
          alert(`Insufficient ${fromToken} balance`);
          return;
        }
      }

      // Step 1: Request approval
      alert("Requesting token approval...");
      const approvalHash = await writeContractAsync({
        address: contract.address,
        abi: contract.abi,
        functionName: "approve",
        args: [stableSwapContract.address, parseUnits(amount, 18)],
      });

      if (!approvalHash) {
        throw new Error("Approval transaction failed");
      }

      alert("Approval successful! Proceeding with token swap...");

      // Step 2: Perform the token swap
      const swapHash = await writeContractAsync({
        chainId: pharosNetwork.id,
        address: stableSwapContract.address,
        functionName: "swap",
        abi: stableSwapContract.abi,
        args: [indexFromToken, indexToToken, parseUnits(amount, 18), 1],
      });

      if (!swapHash) {
        throw new Error("Swap transaction failed");
      }

      // Step 3: Success notification
      alert(`Swap successful! Transaction hash: ${swapHash}`);
      
    } catch (error) {
      console.error("Swap process failed:", error);
      alert(`Swap failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  useEffect(() => {
    if (fromToken === "IDRX") {
      setIndexFromToken(0);
    } else if (fromToken === "USDC") {
      setIndexFromToken(1);
    } else if (fromToken === "EURC") {
      setIndexFromToken(2);
    }
    if (toToken === "IDRX") {
      setIndexToToken(0);
    } else if (toToken === "USDC") {
      setIndexToToken(1);
    } else if (toToken === "EURC") {
      setIndexToToken(2);
    }
  }, [fromToken, toToken]);
  // Function to switch the from and to tokens
  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  const formatIDR = (value: string | number): string => {
    const number = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(number)) return "0";

    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const formatEUR = (value: string | number): string => {
    const number = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(number)) return "0";

    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const formatUSD = (value: string | number): string => {
    const number = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(number)) return "0";

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };
  return (
    // <ThemeProvider attribute="class" defaultTheme={theme}>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <ConnectButton />
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      <Card className="w-full max-w-md border dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl dark:text-white">
              IDSWAP
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Exchange between IDRX, USDC, and EURC
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {addressUser && (
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2">
                <h3 className="text-sm font-medium mb-2 dark:text-gray-200">
                  Available Balance
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      IDRX
                    </span>
                    <span
                      className="font-medium dark:text-white"
                      style={{ overflowWrap: "anywhere", textAlign: "center" }}
                    >
                      {dataIDRX?.balance?.status === "success"
                        ? formatIDR(formatEther(dataIDRX.balance.result))
                        : "0.0"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      USDC
                    </span>
                    <span
                      className="font-medium dark:text-white"
                      style={{ overflowWrap: "anywhere", textAlign: "center" }}
                    >
                      {dataUSDC?.balance?.status === "success"
                        ? formatUSD(formatEther(dataUSDC.balance.result))
                        : "0.0"}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      EURC
                    </span>
                    <span
                      className="font-medium dark:text-white"
                      style={{ overflowWrap: "anywhere", textAlign: "center" }}
                    >
                      {dataEURC?.balance?.status === "success"
                        ? formatEUR(formatEther(dataEURC.balance.result))
                        : "€0.00"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">
                From
              </label>
              <div className="flex space-x-2">
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="w-[120px] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent className="dark:border-gray-600 dark:bg-gray-700">
                    <SelectItem value="IDRX">IDRX</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="EURC">EURC</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={switchTokens}
                className="rounded-full h-8 w-8 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">
                To
              </label>
              <div className="flex space-x-2">
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="w-[120px] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent className="dark:border-gray-600 dark:bg-gray-700">
                    <SelectItem value="IDRX">IDRX</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="EURC">EURC</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="0.0"
                  disabled
                  value={expectedOutput}
                  className="flex-1 bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300"
                />
              </div>
            </div>

            {/* Expected calculation section */}
            {amount && Number(amount) > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center mb-2">
                  <Calculator className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                  <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Expected Calculation
                  </h3>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Exchange Rate:
                    </span>
                    <span className="font-medium dark:text-gray-200">
                      1 {fromToken} = {exchangeRate} {toToken}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Expected Output:
                    </span>
                    <span className="font-medium dark:text-gray-200">
                      {expectedOutput} {toToken}
                    </span>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <Info className="h-3 w-3 mr-1" />
                    <span>Rate includes 0.3% swap fee</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={swapTokens}
            className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
            disabled={!addressUser || !amount}
          >
            Swap
          </Button>
        </CardFooter>
      </Card>
    </div>
    // </ThemeProvider>
  );
}
