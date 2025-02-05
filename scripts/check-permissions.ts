import { ethers } from 'hardhat';

async function main() {
    const TEST_ADDRESS = '0xe8f5A8aF4d8cdaa67bD767261695e156Fde65CeD';
    const ALIGNMENT_VERIFIER = '0x31fE71EA2E20C1f5128D6A56f6773ea5E77472E8';
    
    // Get contract
    const alignmentVerifier = await ethers.getContractAt('AlignmentVerifier', ALIGNMENT_VERIFIER);
    
    // Check owner
    const owner = await alignmentVerifier.owner();
    console.log('Contract owner:', owner);
    console.log('Our address:', TEST_ADDRESS);
    console.log('Is owner?', owner.toLowerCase() === TEST_ADDRESS.toLowerCase());
    
    // Try a manual update
    try {
        console.log('Attempting manual update...');
        const tx = await alignmentVerifier.updateAlignment(
            TEST_ADDRESS,
            {
                understanding: 80n,
                intention: 75n,
                communication: 85n,
                action: 70n,
                sustainability: 90n,
                effort: 85n,
                mindfulness: 80n,
                focus: 75n
            },
            { gasLimit: 500000 }
        );
        console.log('Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt.blockNumber);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
