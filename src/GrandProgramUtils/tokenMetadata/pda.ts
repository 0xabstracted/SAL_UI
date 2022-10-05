import { PublicKey } from "@solana/web3.js";
import { TOKEN_METADATA_PROGRAM_ID } from "./constants";

export const tokenMetadataPda = (mint: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('metadata'),TOKEN_METADATA_PROGRAM_ID.toBytes(), mint.toBytes()],
        TOKEN_METADATA_PROGRAM_ID
    );
};
