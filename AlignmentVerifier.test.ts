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

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await alignmentVerifier.owner()).to.equal(owner.address);
    });
  });

  describe("Alignment Updates", function () {
    it("Should allow owner to update alignment metrics", async function () {
      await expect(alignmentVerifier.updateAlignment(entity.address, validMetrics))
        .to.emit(alignmentVerifier, "AlignmentUpdated")
        .withArgs(entity.address, Object.values(validMetrics));
    });

    it("Should not allow non-owner to update metrics", async function () {
      await expect(alignmentVerifier.connect(other).updateAlignment(entity.address, validMetrics))
        .to.be.revertedWithCustomError(alignmentVerifier, "OwnableUnauthorizedAccount")
        .withArgs(other.address);
    });

    it("Should reject metrics above 100", async function () {
      const invalidMetrics = { ...validMetrics, understanding: 101n };
      await expect(alignmentVerifier.updateAlignment(entity.address, invalidMetrics))
        .to.be.revertedWith("Understanding metric too high");
    });
  });

  describe("Alignment Verification", function () {
    beforeEach(async function () {
      await alignmentVerifier.updateAlignment(entity.address, validMetrics);
    });

    it("Should return correct metrics for an entity", async function () {
      const metrics = await alignmentVerifier.verifyAlignment(entity.address);
      expect(metrics.understanding).to.equal(validMetrics.understanding);
      expect(metrics.intention).to.equal(validMetrics.intention);
      expect(metrics.communication).to.equal(validMetrics.communication);
      expect(metrics.action).to.equal(validMetrics.action);
      expect(metrics.sustainability).to.equal(validMetrics.sustainability);
      expect(metrics.effort).to.equal(validMetrics.effort);
      expect(metrics.mindfulness).to.equal(validMetrics.mindfulness);
      expect(metrics.focus).to.equal(validMetrics.focus);
    });

    it("Should calculate correct alignment score", async function () {
      const score = await alignmentVerifier.getAlignmentScore(entity.address);
      // Average of all metrics
      const expectedScore = (80n + 75n + 85n + 70n + 90n + 85n + 80n + 75n) / 8n;
      expect(score).to.equal(expectedScore);
    });
  });

  describe("Threshold Warnings", function () {
    it("Should emit warnings for metrics below threshold", async function () {
      const lowMetrics = { ...validMetrics, understanding: 50n };
      await expect(alignmentVerifier.updateAlignment(entity.address, lowMetrics))
        .to.emit(alignmentVerifier, "ThresholdWarning")
        .withArgs(entity.address, "understanding");
    });
  });
});