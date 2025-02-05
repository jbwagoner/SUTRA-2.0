import { ethers } from 'hardhat';

async function main() {
    const [signer] = await ethers.getSigners();
    
    console.log('Sending cancellation transaction...');
    const tx = await signer.sendTransaction({
        to: signer.address,
        value: 0,
        nonce: 31,  // Same nonce as pending tx
        maxFeePerGas: ethers.parseUnits('200', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('50', 'gwei'),
        gasLimit: 21000
    });
    
    console.log('Cancellation sent:', tx.hash);
    await tx.wait();
    console.log('Cancellation confirmed');
}

main().catch(console.error);
