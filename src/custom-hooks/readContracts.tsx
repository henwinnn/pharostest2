import { stableSwapContract } from "@/contracts/contracts";
import { useReadContracts } from "wagmi";
import type { Address } from "viem";
import type { QueryObserverResult } from '@tanstack/react-query';

type ContractResult = [
  { error?: undefined; result: unknown; status: "success" } | { error: Error; result?: undefined; status: "failure" },
  { error?: undefined; result: unknown; status: "success" } | { error: Error; result?: undefined; status: "failure" }
];

interface UseTokenContractsResult {
  balance: { result: bigint; status: "success" } | { error: Error; status: "failure" } | null;
  isAllowance: { result: bigint; status: "success" } | { error: Error; status: "failure" } | null;
  error: unknown;
  isPending: boolean;
  refetch: () => Promise<QueryObserverResult<ContractResult, Error>>;
}

type ContractConfig = {
  address: Address;
  abi: readonly {
    type: string;
    name?: string;
    inputs?: { name: string; type: string; internalType: string }[];
    outputs?: { name: string; type: string; internalType: string }[];
    stateMutability?: string;
  }[];
};

export function useTokenContracts(
  tokenContract: ContractConfig,
  addressUser: string,
  swapContract = stableSwapContract // Default to `stableSwapContract`
): UseTokenContractsResult {
  const { data, error, isPending, refetch } = useReadContracts({
    contracts: [
      {
        ...tokenContract,
        functionName: "balanceOf",
        args: [addressUser],
      },
      {
        ...tokenContract,
        functionName: "allowance",
        args: [addressUser, swapContract.address],
      },
    ],
  });

  const [balance = null, isAllowance = null] = data || [];
  
  return {
    balance: balance as UseTokenContractsResult['balance'],
    isAllowance: isAllowance as UseTokenContractsResult['isAllowance'],
    error,
    isPending,
    refetch
  };
}