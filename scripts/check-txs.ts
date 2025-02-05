import { ethers } from 'hardhat';

async function main() {
    const txHashes = [
        '0xcab27306fbd08701efc0003f0e0edd4e5367bf714f39571e1226250d28eda7a9',  // original
        '0xab63ebc727756e4766c7c156a2bc5a9682c979b3e7ac6cd655795e283bf2ac36'   // cancellation
    ];
    
    console.log('Checking transaction statuses...');
    for (const hash of txHashes) {
        const tx = await ethers.provider.getTransaction(hash);
        console.log('Transaction ' + hash.slice(0,6) + ':');
        console.log({
            blockNumber: tx.blockNumber,
            status: tx.blockNumber ? 'Confirmed' : 'Pending',
            nonce: tx.nonce,
            maxFeePerGas: tx?.maxFeePerGas?.toString(),
            maxPriorityFeePerGas: tx?.maxPriorityFeePerGas?.toString()
        });
    }
}

main().catch(console.error);
