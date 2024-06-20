# Vault

## Overview
The Vault contract is a Solidity smart contract designed to securely handle the deposit, withdrawal, and conversion of Ether(ETH) and Wrapped ETH(WETH). It allows users to deposit various ERC20 tokens or ETH, wrap ETH into WETH (Wrapped Ether), unwrap WETH back into ETH, and withdraw their tokens or ETH. Additionally, it includes functionalities for the contract owner to manage wrapped ETH.

## Features
- Token Deposit: Users can deposit any ERC20 token or ETH into the vault.
- Token Withdrawal: Users can withdraw their deposited tokens or ETH.
- ETH Wrapping: Users can wrap their ETH into WETH.
- WETH Unwrapping: Users can unwrap their WETH back into ETH.
- Owner Privileges: The contract owner can withdraw wrapped ETH to a specified address.

## Installation
Install Dependencies: Ensure you have Node.js and npm installed. Then, install the required dependencies:

## CLI commands

### Compile
```shell
npx hardhat compile
```

### Test
```shell
npx hardhat test
REPORT_GAS=true npx hardhat test
```

### run node
```shell
npx hardhat compile
```

### deploy
Add network in hardhat config and add env variables in your .env file same as .env-examples
```shell
npx hardhat run scripts/deploy.js --network <NETWORK>
```

### verify
Add API_KEY in your .env file to verify contracts
```shell
npx hardhat verify --network <NETWORK> <contract address> <contract args>
```

### help
```shell
npx hardhat help
```
