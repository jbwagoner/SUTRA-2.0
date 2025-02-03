import { ethers } from "hardhat";

async function main() {
  console.log("Starting SUTRA 2.0 deployment to Polygon Amoy...");

  // Deploy SUTRA Token first
  console.log("Deploying SUTRA Token...");
  const SUTRA = await ethers.getContractFactory("SUTRA");
  const sutra = await SUTRA.deploy();
  await sutra.waitForDeployment();
  console.log("SUTRA Token deployed to:", await sutra.getAddress());

  // Deploy AlignmentVerifier
  console.log("Deploying AlignmentVerifier...");
  const AlignmentVerifier = await ethers.getContractFactory("AlignmentVerifier");
  const alignmentVerifier = await AlignmentVerifier.deploy();
  await alignmentVerifier.waitForDeployment();
  console.log("AlignmentVerifier deployed to:", await alignmentVerifier.getAddress());

  // Deploy PreservationRights with SUTRA token address
  console.log("Deploying PreservationRights...");
  const PreservationRights = await ethers.getContractFactory("PreservationRights");
  const preservationRights = await PreservationRights.deploy(await sutra.getAddress());
  await preservationRights.waitForDeployment();
  console.log("PreservationRights deployed to:", await preservationRights.getAddress());

  // Set up contract relationships
  console.log("Setting up contract relationships...");
  await sutra.setAlignmentVerifier(await alignmentVerifier.getAddress());
  await sutra.setPreservationRights(await preservationRights.getAddress());
  console.log("Contract relationships established");

  console.log("Deployment complete!");
  console.log({
    sutra: await sutra.getAddress(),
    alignmentVerifier: await alignmentVerifier.getAddress(),
    preservationRights: await preservationRights.getAddress()
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
