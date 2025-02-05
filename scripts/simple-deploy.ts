import { ethers } from 'hardhat';

async function main() {
    console.log('Creating basic test deployment...');
    
    try {
        // Deploy AlignmentVerifier with minimal config
        const AlignmentVerifier = await ethers.getContractFactory('AlignmentVerifier');
        
        console.log('Deploying with updated gas params...');
        const deployTx = await AlignmentVerifier.getDeployTransaction();
        const [signer] = await ethers.getSigners();
        
        console.log('Sending transaction...');
        const tx = await signer.sendTransaction({
            ...deployTx,
            gasLimit: 3000000,
            maxFeePerGas: ethers.parseUnits('100', 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei')  // Increased to required minimum
        });
        
        console.log('Waiting for confirmation...');
        const receipt = await tx.wait();
        console.log('Deployed at:', receipt.contractAddress);
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            code: error.code
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Top level error:', error);
        process.exit(1);
    });
