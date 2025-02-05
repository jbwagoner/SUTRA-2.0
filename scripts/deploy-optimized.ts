import { ethers } from 'hardhat';

async function main() {
    console.log('Deploying optimized AlignmentVerifier...');
    
    const AlignmentVerifier = await ethers.getContractFactory('AlignmentVerifier');
    const alignmentVerifier = await AlignmentVerifier.deploy();
    await alignmentVerifier.waitForDeployment();

    console.log('New AlignmentVerifier deployed to:', await alignmentVerifier.getAddress());
    
    // Get SUTRA contract to update reference
    const SUTRA_ADDRESS = '0xBAbecAae62E39945a506479f09464faE7F2D61D7';
    const sutra = await ethers.getContractAt('SUTRA', SUTRA_ADDRESS);
    
    console.log('Updating SUTRA reference...');
    const tx = await sutra.setAlignmentVerifier(await alignmentVerifier.getAddress());
    await tx.wait();
    
    console.log('Deployment and update complete!');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
