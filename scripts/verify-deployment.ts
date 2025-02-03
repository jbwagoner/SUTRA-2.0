import { ethers } from 'hardhat';

async function main() {
  console.log('Verifying SUTRA 2.0 deployment...');
  
  // Contract addresses
  const SUTRA_ADDRESS = '0xBAbecAae62E39945a506479f09464faE7F2D61D7';
  const ALIGNMENT_VERIFIER_ADDRESS = '0x31fE71EA2E20C1f5128D6A56f6773ea5E77472E8';
  const PRESERVATION_RIGHTS_ADDRESS = '0x946Af4547b475A18F536a9Cac869c7A4BC80C3DA';

  // Get contract instances
  const SUTRA = await ethers.getContractFactory('SUTRA');
  const AlignmentVerifier = await ethers.getContractFactory('AlignmentVerifier');
  const PreservationRights = await ethers.getContractFactory('PreservationRights');

  const sutra = await SUTRA.attach(SUTRA_ADDRESS);
  const alignmentVerifier = await AlignmentVerifier.attach(ALIGNMENT_VERIFIER_ADDRESS);
  const preservationRights = await PreservationRights.attach(PRESERVATION_RIGHTS_ADDRESS);

  console.log('Checking contract relationships...');
  
  const verifierAddress = await sutra.alignmentVerifier();
  const rightsAddress = await sutra.preservationRights();
  const sutraInRights = await preservationRights.sutraToken();

  console.log('Verification Results:');
  console.log('---------------------');
  console.log('SUTRA -> AlignmentVerifier:', verifierAddress === ALIGNMENT_VERIFIER_ADDRESS);
  console.log('SUTRA -> PreservationRights:', rightsAddress === PRESERVATION_RIGHTS_ADDRESS);
  console.log('PreservationRights -> SUTRA:', sutraInRights === SUTRA_ADDRESS);

  // Check initial supply
  const totalSupply = await sutra.totalSupply();
  console.log('Initial Supply:', ethers.formatEther(totalSupply), 'SUTRA');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
