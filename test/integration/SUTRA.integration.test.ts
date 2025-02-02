import { expect } from "chai";
import { ethers } from "hardhat";
import { SUTRA, AlignmentVerifier, PreservationRights } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SUTRA Integration", function () {
    let sutra: SUTRA;
    let alignmentVerifier: AlignmentVerifier;
    let preservationRights: PreservationRights;
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;

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

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy contracts
        const SUTRA = await ethers.getContractFactory("SUTRA");
        const AlignmentVerifier = await ethers.getContractFactory("AlignmentVerifier");
        const PreservationRights = await ethers.getContractFactory("PreservationRights");

        sutra = await SUTRA.deploy();
        alignmentVerifier = await AlignmentVerifier.deploy();
        preservationRights = await PreservationRights.deploy(await sutra.getAddress());

        // Set up contract relationships
        await sutra.setAlignmentVerifier(await alignmentVerifier.getAddress());
        await sutra.setPreservationRights(await preservationRights.getAddress());

        // Setup initial metrics for user1
        await alignmentVerifier.updateAlignment(user1.address, validMetrics);
    });

    describe("Contract Setup", function () {
        it("Should have correct contract references", async function () {
            expect(await sutra.alignmentVerifier()).to.equal(await alignmentVerifier.getAddress());
            expect(await sutra.preservationRights()).to.equal(await preservationRights.getAddress());
            expect(await preservationRights.sutraToken()).to.equal(await sutra.getAddress());
        });
    });

    describe("Token Transfers with Alignment Checks", function () {
        beforeEach(async function () {
            // Transfer some tokens to test accounts
            const transferAmount = ethers.parseEther("2000"); // 2000 SUTRA
            await sutra.transfer(user1.address, transferAmount);
        });

        it("Should allow transfers when alignment score is sufficient", async function () {
            const transferAmount = ethers.parseEther("1500"); // 1500 SUTRA
            await expect(sutra.connect(user1).transfer(user2.address, transferAmount))
                .to.not.be.reverted;
        });

        it("Should block large transfers with insufficient alignment", async function () {
            const lowMetrics = {
                understanding: 40n,
                intention: 45n,
                communication: 40n,
                action: 40n,
                sustainability: 40n,
                effort: 40n,
                mindfulness: 40n,
                focus: 40n
            };
            
            // Transfer tokens to user2 from owner
            const transferAmount = ethers.parseEther("1500");
            await sutra.transfer(user2.address, transferAmount);
            
            // Set low alignment metrics for user2
            await alignmentVerifier.updateAlignment(user2.address, lowMetrics);
            
            // Now try to transfer from user2 to user1
            await expect(
                sutra.connect(user2).transfer(user1.address, transferAmount)
            ).to.be.revertedWith("Insufficient alignment score for large transfer");
        });
    });

    describe("Preservation Rights Integration", function () {
        it("Should correctly assign preservation levels based on token balance", async function () {
            const guardianAmount = ethers.parseEther("11000"); // 11,000 SUTRA
            await sutra.transfer(user1.address, guardianAmount);

            expect(await preservationRights.getPreservationLevel(user1.address)).to.equal(3); // GuardianStatus

            // Transfer most tokens away, keeping enough for AdvancedRights
            await sutra.connect(user1).transfer(user2.address, ethers.parseEther("9000"));
            expect(await preservationRights.getPreservationLevel(user1.address)).to.equal(2); // AdvancedRights
        });
    });

    describe("Status Checks", function () {
        it("Should return correct combined status", async function () {
            const guardianAmount = ethers.parseEther("11000");
            await sutra.transfer(user1.address, guardianAmount);

            const [metrics, level] = await sutra.getStatus(user1.address);
            
            expect(metrics.understanding).to.equal(validMetrics.understanding);
            expect(metrics.intention).to.equal(validMetrics.intention);
            expect(level).to.equal(3); // GuardianStatus
        });
    });

    describe("Emergency Scenarios", function () {
        it("Should allow owner to override preservation level", async function () {
            await preservationRights.setLevelOverride(user1.address, 3); // Set to Guardian
            expect(await preservationRights.getPreservationLevel(user1.address)).to.equal(3);
        });

        it("Should respect manual overrides over token balance", async function () {
            await preservationRights.setLevelOverride(user1.address, 3); // Set to Guardian
            expect(await preservationRights.getPreservationLevel(user1.address)).to.equal(3);
        });
    });
});
