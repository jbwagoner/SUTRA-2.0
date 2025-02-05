import { run } from 'hardhat';

async function main() {
    const NEW_VERIFIER = '0x4814D82DBeA38c8f208A36202aE6e8A1cE421989';
    
    console.log('Verifying AlignmentVerifier on Amoy scanner...');
    await run('verify:verify', {
        address: NEW_VERIFIER,
        contract: 'contracts/AlignmentVerifier.sol:AlignmentVerifier',
        constructorArguments: []
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Verification error:', error);
        process.exit(1);
    });
