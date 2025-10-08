# Stacks Token Contract Addresses

This file documents the token contract addresses used in the trading pairs.

## Important Note
The contract addresses below are placeholders and should be verified and updated with the actual contract addresses from the Stacks blockchain before use in production.

## Token Addresses

### STX / AEUSDC
- STX: `SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2`
- AEUSDC: `SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc`

### DOG / SBTC
- DOG: `SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-wdog`
- SBTC: `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token`

Reference: https://explorer.hiro.so/txid/0xdacb8e7b261e9aa6f2f2103414177b937b9d2f7ebc65b52c912c467aff4c0620?chain=mainnet

### ALEX / STX
- ALEX: `SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token`
- STX: `SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2`

Reference: https://explorer.stxer.xyz/txid/bf135a345921ff6df23a3c37da5b97acf4b1c47d35dfd50e57376bc4adbcdfb3

### ABTC / SUSDT
- ABTC: `SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc`
- SUSDT: `SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-susdt`

Reference: https://explorer.hiro.so/txid/0xc5469fc24a67be247aa81a00c650555fc5578bfcb2702d88a3eba8e7a7b5964a?chain=mainnet

### AEUSDC / USDA
- AEUSDC: `SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc`
- USDA: `SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token`

Reference: https://explorer.hiro.so/txid/0x53e048ef1b61e4a5f748f1be27dcf990daedd7c999572070464ea616b88d335e?chain=mainnet

### USDA / STX
- USDA: `SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token`
- STX: `SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2`

Reference: https://explorer.hiro.so/txid/0x9ce19ac06113b23c7d0b618f9ab632b98be7f05af21b7d5c994e83ee1de19f1c?chain=mainnet

## How to Verify Contract Addresses

1. Visit the transaction link in the Stacks explorer
2. Look at the contract call details
3. Identify the token contract addresses used in the transaction
4. Update the addresses in `/src/views/swap/alex.tsx`

## Backend Integration

All trading operations are handled by the backend API endpoints:
- `/dex/xykautosell` - Execute sell orders
- `/dex/xykautobuy` - Execute buy orders
- `/dex/xykfetchdy` - Get expected output amount (dy)
- `/dex/xykfetchdx` - Get expected input amount (dx)

The backend should be configured to handle these token contract addresses correctly.
