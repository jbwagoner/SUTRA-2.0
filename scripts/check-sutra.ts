import { ethers } from 'hardhat';

async function main() {
    const SUTRA_ADDRESS = '0xBAbecAae62E39945a506479f09464faE7F2D61D7';
    const sutra = await ethers.getContractAt('SUTRA', SUTRA_ADDRESS);
    
    console.log('Current AlignmentVerifier:', await sutra.alignmentVerifier());
    console.log('Network block:', await ethers.provider.getBlockNumber());
}

main().catch(console.error);
