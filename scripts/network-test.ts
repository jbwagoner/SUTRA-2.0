import { ethers } from 'hardhat';

async function main() {
    console.log('Testing network connection...');
    
    // Test basic operations
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log('Current block:', blockNumber);
    
    const [signer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(signer.address);
    console.log('Balance:', ethers.formatEther(balance), 'MATIC');
}

main()
    .then(() => process.exit(0))
    .catch(error => console.error('Error:', error));
