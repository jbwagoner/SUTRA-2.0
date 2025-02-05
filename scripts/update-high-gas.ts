import { ethers } from 'hardhat';

async function main() {
    const SUTRA_ADDRESS = '0xBAbecAae62E39945a506479f09464faE7F2D61D7';
    const NEW_VERIFIER = '0x4814D82DBeA38c8f208A36202aE6e8A1cE421989';
    
    const sutra = await ethers.getContractAt('SUTRA', SUTRA_ADDRESS);
    
    console.log('Updating with high gas priority...');
    const tx = await sutra.setAlignmentVerifier(NEW_VERIFIER, {
        maxFeePerGas: ethers.parseUnits('150', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('30', 'gwei'),
        gasLimit: 500000
    });
    
    console.log('Transaction sent:', tx.hash);
    await tx.wait();
    console.log('Update complete');
}

main().catch(console.error);
