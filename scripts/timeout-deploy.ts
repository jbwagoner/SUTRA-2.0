import { ethers } from 'hardhat';

async function main() {
    console.log('Deploying with 30s timeout...');
    const AlignmentVerifier = await ethers.getContractFactory('AlignmentVerifier');
    
    const deployTx = await AlignmentVerifier.getDeployTransaction();
    const [signer] = await ethers.getSigners();
    
    const tx = await signer.sendTransaction({
        ...deployTx,
        gasLimit: 3000000,
        maxFeePerGas: ethers.parseUnits('100', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('25', 'gwei')
    });
    
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Deployment timeout after 30s')), 30000)
    );
    
    try {
        const receipt = await Promise.race([tx.wait(), timeoutPromise]);
        console.log('Deployed at:', receipt.contractAddress);
    } catch (error) {
        if(error.message.includes('timeout')) {
            console.log('Deployment timed out - transaction hash:', tx.hash);
        } else {
            console.error('Error:', error.message);
        }
    }
}

main().catch(console.error);
