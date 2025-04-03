import StableSwapABI from "../abi/StableSwapABI.json" assert { type: "json" }; // Import ABI dari file JSON
import idrxABI from "../abi/idrxABI.json" assert { type: "json" }; // Import ABI dari file JSON
import usdcABI from "../abi/usdcABI.json" assert { type: "json" }; // Import ABI dari file JSON
import eurcABI from "../abi/eurcABI.json" assert { type: "json" }; // Import ABI dari file JSON
export const stableSwapContract = {
    address: '0x34ADFc585fd4cD8b7641Ab5F23Eec15431A822c7',
    abi: StableSwapABI.abi,
  } as const

  export const IDRXContract = {
    address: '0x3EC5Fcbd6AABa546Ee3E861bb6adA1D0074d6EA2',
    abi: idrxABI.abi,
  } as const

  export const USDCContract = {
    address: '0x83d9D53bB598b082A18B36D5F1612b7bDB9A4061',
    abi: usdcABI.abi,
  } as const

  export const EURCContract = {
    address: '0xAf374bE65c1983712DeD1A82869862F746F3fe11',
    abi:eurcABI.abi,
  } as const