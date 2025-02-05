import { ethers } from 'hardhat';

async function main() {
    // Get the current state
    console.log('Checking network status...');
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log('Current block:', blockNumber);

    // Get signer info
    const [signer] = await ethers.getSigners();
    console.log('Signer:', signer.address);
    console.log('Balance:', ethers.formatEther(await ethers.provider.getBalance(signer.address)), 'MATIC');

    // Get recent transactions
    console.log('\nChecking recent transactions...');
    const block = await ethers.provider.getBlock('latest', true);
    console.log('Latest block:', block.number);
    console.log('Latest transactions:', block.transactions.length);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
