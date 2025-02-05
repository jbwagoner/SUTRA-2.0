import { ethers } from 'hardhat';

async function main() {
    console.log('Starting test deployment...');
    console.log('Network:', await ethers.provider.getNetwork());
    console.log('Gas price:', (await ethers.provider.getFeeData()).gasPrice);
    
    try {
        const AlignmentVerifier = await ethers.getContractFactory('AlignmentVerifier');
        console.log('Contract factory created');
        
        console.log('Starting deployment with higher gas limit...');
        const alignmentVerifier = await AlignmentVerifier.deploy({
            gasLimit: 5000000,
            gasPrice: ethers.parseUnits('50', 'gwei')
        });
        
        console.log('Deployment transaction sent');
        await alignmentVerifier.waitForDeployment();
        console.log('Deployment complete:', await alignmentVerifier.getAddress());
    } catch (error) {
        console.error('Deployment failed:', error);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => console.error('Top level error:', error));
