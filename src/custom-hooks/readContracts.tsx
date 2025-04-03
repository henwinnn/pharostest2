import { stableSwapContract } from "@/contracts/contracts";
import { useReadContracts } from "wagmi";
import type { ContractFunctionParameters } from "wagmi";

interface UseTokenContractsResult {
  balance: '' // Replace `any` with the actual type of the balance (e.g., `string` or `BigNumber`)
  isAllowance: ''; // Replace `any` with the actual type
  error: unknown;
  isPending: boolean;
}

export function useTokenContracts(
  tokenContract: ContractFunctionParameters,
  addressUser: string,
  swapContract = stableSwapContract // Default to `stableSwapContract`
): UseTokenContractsResult {
  const { data, error, isPending } = useReadContracts({
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
  return { balance, isAllowance, error, isPending };
}