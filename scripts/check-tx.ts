import { ethers } from 'hardhat';

async function main() {
    const txHash = '0xcab27306fbd08701efc0003f0e0edd4e5367bf714f39571e1226250d28eda7a9';
    
    console.log('Checking transaction status...');
    const tx = await ethers.provider.getTransaction(txHash);
    console.log('Transaction:', {
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        status: tx.blockNumber ? 'Confirmed' : 'Pending',
        from: tx.from,
        nonce: tx.nonce
    });
}

main().catch(console.error);
