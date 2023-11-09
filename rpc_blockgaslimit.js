// Import ethers from 'ethers' package
const ethers = require('ethers');

// Connect to the local Geth node
const provider = new ethers.JsonRpcProvider('http://localhost:8545');

// Function to get the gas limit of the latest block
async function getLatestBlockGasLimit() {
    const latestBlock = await provider.getBlock('latest');
    console.log(latestBlock.gasLimit.toString());
}

// Call the function
getLatestBlockGasLimit();