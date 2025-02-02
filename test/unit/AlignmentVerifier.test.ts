import { expect } from "chai";
import { ethers } from "hardhat";
import { AlignmentVerifier } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("AlignmentVerifier", function () {
    let alignmentVerifier: AlignmentVerifier;
    let owner: SignerWithAddress;
    let entity: SignerWithAddress;
    let other: SignerWithAddress;

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
        [owner, entity, other] = await ethers.getSigners();
        const AlignmentVerifier = await ethers.getContractFactory("AlignmentVerifier");
        alignmentVerifier = await AlignmentVerifier.deploy();
    });

    describe("Initial Requirements", function () {
        it("Should accept metrics meeting default requirements", async function () {
            await expect(alignmentVerifier.updateAlignment(entity.address, validMetrics))
                .to.emit(alignmentVerifier, "AlignmentUpdated")
                .withArgs(entity.address, Object.values(validMetrics));
        });

        it("Should emit warnings for metrics below recommended thresholds", async function () {
            const lowMetrics = {
                ...validMetrics,
                understanding: 55n // Below recommended 60
            };

            await expect(alignmentVerifier.updateAlignment(entity.address, lowMetrics))
                .to.emit(alignmentVerifier, "ThresholdWarning")
                .withArgs(entity.address, "understanding");
        });
    });

    describe("Custom Requirements", function () {
        it("Should allow owner to set custom requirements", async function () {
            await expect(alignmentVerifier.setRequirement(
                "understanding",
                50n, // minValid
                95n, // maxValid
                70n, // recommended
                true // required
            )).to.emit(alignmentVerifier, "MetricRequirementSet")
            .withArgs("understanding", 50n, 95n, 70n, true);
        });

        it("Should enforce custom requirements", async function () {
            // Set stricter requirement
            await alignmentVerifier.setRequirement(
                "understanding",
                70n, // minValid
                95n, // maxValid
                80n, // recommended
                true // required
            );

            // Test metric below new minimum
            const lowMetrics = { ...validMetrics, understanding: 65n };
            await expect(alignmentVerifier.updateAlignment(entity.address, lowMetrics))
                .to.be.revertedWith("Invalid understanding metric");
        });
    });

    describe("History and Trends", function () {
        it("Should track alignment history", async function () {
            await alignmentVerifier.updateAlignment(entity.address, validMetrics);
            const history = await alignmentVerifier.getAlignmentHistory(entity.address);
            expect(history.length).to.equal(1);
            expect(history[0]).to.deep.equal(Object.values(validMetrics));
        });

        it("Should detect and alert on significant improvements", async function () {
            await alignmentVerifier.updateAlignment(entity.address, validMetrics);

            const improvedMetrics = {
                ...validMetrics,
                understanding: 95n // +15 points
            };

            await expect(alignmentVerifier.updateAlignment(entity.address, improvedMetrics))
                .to.emit(alignmentVerifier, "AlignmentTrendAlert")
                .withArgs(entity.address, "understanding", true);
        });

        it("Should detect and alert on significant declines", async function () {
            await alignmentVerifier.updateAlignment(entity.address, validMetrics);

            const declinedMetrics = {
                ...validMetrics,
                understanding: 65n // -15 points
            };

            await expect(alignmentVerifier.updateAlignment(entity.address, declinedMetrics))
                .to.emit(alignmentVerifier, "AlignmentTrendAlert")
                .withArgs(entity.address, "understanding", false);
        });

        it("Should maintain limited history size", async function () {
            // Update 11 times to test 10-entry limit
            for (let i = 0; i < 11; i++) {
                const metrics = {
                    ...validMetrics,
                    understanding: BigInt(80 + i)
                };
                await alignmentVerifier.updateAlignment(entity.address, metrics);
            }

            const history = await alignmentVerifier.getAlignmentHistory(entity.address);
            expect(history.length).to.equal(10);
        });
    });

    describe("Access Control", function () {
        it("Should only allow owner to update metrics", async function () {
            await expect(
                alignmentVerifier.connect(other).updateAlignment(entity.address, validMetrics)
            ).to.be.revertedWithCustomError(alignmentVerifier, "OwnableUnauthorizedAccount");
        });

        it("Should only allow owner to set requirements", async function () {
            await expect(
                alignmentVerifier.connect(other).setRequirement(
                    "understanding",
                    50n,
                    95n,
                    70n,
                    true
                )
            ).to.be.revertedWithCustomError(alignmentVerifier, "OwnableUnauthorizedAccount");
        });
    });
});
