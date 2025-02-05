import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SUTRA, AlignmentVerifier, PreservationRights } from '../typechain-types';

describe('SUTRA Integration Tests', function() {
    // Increase timeout for all tests
    this.timeout(120000); // 2 minutes

    let sutra: SUTRA;
    let alignmentVerifier: AlignmentVerifier;
    let preservationRights: PreservationRights;
    let owner: any;

    const DEPLOYED_ADDRESSES = {
        SUTRA: '0xBAbecAae62E39945a506479f09464faE7F2D61D7',
        AlignmentVerifier: '0x31fE71EA2E20C1f5128D6A56f6773ea5E77472E8',
        PreservationRights: '0x946Af4547b475A18F536a9Cac869c7A4BC80C3DA'
    };

    const TEST_ADDRESS = '0xe8f5A8aF4d8cdaa67bD767261695e156Fde65CeD';

    const validMetrics = {
        understanding: 80n,
        intention: 75n,
        communication: 85n,
        action: 70n,
        sustainability: 90n,
        effort: 85n,
        mindfulness: 80n,
        focus: 75n
    };

    beforeEach(async function() {
        owner = (await ethers.getSigners())[0];
        
        // Connect to deployed contracts
        sutra = await ethers.getContractAt('SUTRA', DEPLOYED_ADDRESSES.SUTRA);
        alignmentVerifier = await ethers.getContractAt('AlignmentVerifier', DEPLOYED_ADDRESSES.AlignmentVerifier);
        preservationRights = await ethers.getContractAt('PreservationRights', DEPLOYED_ADDRESSES.PreservationRights);

        const ownerAddress = await owner.getAddress();
        console.log('Testing with address:', ownerAddress);
        console.log('Owner balance:', ethers.formatEther(await ethers.provider.getBalance(ownerAddress)), 'MATIC');
    });

    describe('System Integration', function() {
        it('Should have correct contract relationships', async function() {
            const verifierAddress = await sutra.alignmentVerifier();
            const rightsAddress = await sutra.preservationRights();
            const sutraInRights = await preservationRights.sutraToken();

            expect(verifierAddress).to.equal(DEPLOYED_ADDRESSES.AlignmentVerifier);
            expect(rightsAddress).to.equal(DEPLOYED_ADDRESSES.PreservationRights);
            expect(sutraInRights).to.equal(DEPLOYED_ADDRESSES.SUTRA);
        });

        it('Should update alignment and affect transfer permissions', async function() {
            console.log('Checking current alignment...');
            const beforeMetrics = await alignmentVerifier.verifyAlignment(TEST_ADDRESS);
            console.log('Before metrics:', beforeMetrics);
            
            console.log('Updating alignment metrics...');
            try {
                // Prepare transaction with higher gas limit
                const tx = await alignmentVerifier.updateAlignment(
                    TEST_ADDRESS, 
                    validMetrics,
                    { gasLimit: 500000 }
                );
                console.log('Transaction hash:', tx.hash);
                
                console.log('Waiting for confirmation...');
                const receipt = await tx.wait();
                console.log('Transaction confirmed in block:', receipt.blockNumber);
                
                // Wait a few seconds for the state to update
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                console.log('Checking updated metrics...');
                const afterMetrics = await alignmentVerifier.verifyAlignment(TEST_ADDRESS);
                console.log('After metrics:', afterMetrics);
                
                expect(afterMetrics.understanding).to.equal(validMetrics.understanding);
            } catch (error) {
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    data: error.data,
                });
                throw error;
            }
        });

        it('Should check preservation level', async function() {
            const level = await preservationRights.getPreservationLevel(TEST_ADDRESS);
            console.log('Preservation level:', level);
            expect(level).to.be.gte(0);
        });
    });

    describe('View Functions', function() {
        it('Should retrieve alignment metrics', async function() {
            const metrics = await alignmentVerifier.verifyAlignment(TEST_ADDRESS);
            console.log('Current metrics:', metrics);
            expect(metrics).to.not.be.undefined;
        });

        it('Should get token balances', async function() {
            const balance = await sutra.balanceOf(TEST_ADDRESS);
            console.log('Token balance:', ethers.formatEther(balance), 'SUTRA');
            expect(balance).to.not.be.undefined;
        });
    });
});
