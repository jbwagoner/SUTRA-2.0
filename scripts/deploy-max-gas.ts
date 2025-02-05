import { ethers } from 'hardhat';

async function main() {
    const SUTRA_ADDRESS = '0xBAbecAae62E39945a506479f09464faE7F2D61D7';
    const NEW_VERIFIER = '0x4814D82DBeA38c8f208A36202aE6e8A1cE421989';
    
    const sutra = await ethers.getContractAt('SUTRA', SUTRA_ADDRESS);
    
    console.log('Current nonce:', await ethers.provider.getTransactionCount('0xe8f5A8aF4d8cdaa67bD767261695e156Fde65CeD'));
    
    console.log('Attempting update with max gas...');
    const tx = await sutra.setAlignmentVerifier(NEW_VERIFIER, {
        maxFeePerGas: ethers.parseUnits('300', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('100', 'gwei'),
        gasLimit: 1000000,
        nonce: 32  // Use next nonce
    });
    
    console.log('Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');
    await tx.wait();
    console.log('Update confirmed!');
}

main().catch(console.error);
