import { ethers } from 'hardhat';

async function main() {
  console.log('Testing network connection...');
  const provider = ethers.provider;
  
  try {
    const network = await provider.getNetwork();
    console.log('Connected to network:', {
      chainId: network.chainId,
      name: network.name
    });

    const blockNumber = await provider.getBlockNumber();
    console.log('Current block number:', blockNumber);

    // Try to get a signer using the private key
    const [signer] = await ethers.getSigners();
    const address = await signer.getAddress();
    console.log('Signer address:', address);

    const balance = await provider.getBalance(address);
    console.log('Balance:', ethers.formatEther(balance), 'MATIC');
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
