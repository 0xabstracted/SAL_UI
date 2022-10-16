import { PublicKey } from "@solana/web3.js"
import { TOKEN_SWAP_PROGRAM_ID } from "./GetProgramObject"

export const findRegistryPDA = (admin: PublicKey, mintTokenIn: PublicKey, mintTokenOut: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('registry'), admin.toBytes(), mintTokenIn.toBytes(), mintTokenOut.toBytes()],
        TOKEN_SWAP_PROGRAM_ID
    )
}

export const findVaultTokenInPDA = (registry: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('vault_token_in'), registry.toBytes()],
        TOKEN_SWAP_PROGRAM_ID
    )
}

export const findVaultTokenOutPDA = (registry: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('vault_token_out'), registry.toBytes()],
        TOKEN_SWAP_PROGRAM_ID
    )
}