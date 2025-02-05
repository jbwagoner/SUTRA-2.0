import { ethers } from 'hardhat';

async function main() {
    const VERIFIER_ADDRESS = '0x4814D82DBeA38c8f208A36202aE6e8A1cE421989';
    const TEST_ADDRESS = '0xe8f5A8aF4d8cdaa67bD767261695e156Fde65CeD';
    
    console.log('Testing new AlignmentVerifier functions...');
    const verifier = await ethers.getContractAt('AlignmentVerifier', VERIFIER_ADDRESS);
    
    // Test metrics
    const metrics = {
        understanding: 80n,
        intention: 75n,
        communication: 85n,
        action: 70n,
        sustainability: 90n,
        effort: 85n,
        mindfulness: 80n,
        focus: 75n
    };
    
    console.log('\nUpdating alignment metrics...');
    const tx = await verifier.updateAlignment(TEST_ADDRESS, metrics);
    await tx.wait();
    
    console.log('\nVerifying alignment...');
    const storedMetrics = await verifier.verifyAlignment(TEST_ADDRESS);
    console.log('Stored metrics:', storedMetrics);
    
    console.log('\nCalculating score...');
    const score = await verifier.getAlignmentScore(TEST_ADDRESS);
    console.log('Alignment score:', score.toString());
    
    console.log('\nChecking history...');
    const history = await verifier.getAlignmentHistory(TEST_ADDRESS);
    console.log('History entries:', history.length);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Test error:', error);
        process.exit(1);
    });
