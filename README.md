
# Mint/transfer-SPL token

This code can be used to mint and transfer(not create) tokens on the Solana blockchain using SPL standard.

## Installation

The required dependencies can be installed using the command:
```bash
npm install
```

## Build

To build the project, run the command:
```bash
anchor build
```

## Configure Solana CLI

To configure the Solana CLI to use the testnet, use command:
```bash
solana config set --url https://api.testnet.solana.com
```

## Testing

The code has a file 'spl-token.ts' which contains all the tests and runs using the command:
```bash
anchor test
```

## Deployment

Make sure you airdrop your wallet some SOL tokens to pay for deployment. Use command:
```bash
solana airdrop 2
```
To check your available balance, use the command:
```bash
solana balance
```
To deploy the code on testnet, use the command:
```bash
anchor deploy --provider.cluster testnet
```







