// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAlignmentVerifier.sol";
import "./interfaces/IPreservationRights.sol";

contract SUTRA is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 21_000_000 * 10**18;
    uint256 public constant TOTAL_SUPPLY = 108_000_000 * 10**18;
    
    IAlignmentVerifier public alignmentVerifier;
    IPreservationRights public preservationRights;

    event AlignmentVerifierSet(address indexed verifier);
    event PreservationRightsSet(address indexed preservationManager);

    constructor() ERC20("SUTRA Token", "SUTRA") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function setAlignmentVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier address");
        alignmentVerifier = IAlignmentVerifier(_verifier);
        emit AlignmentVerifierSet(_verifier);
    }

    function setPreservationRights(address _rights) external onlyOwner {
        require(_rights != address(0), "Invalid rights address");
        preservationRights = IPreservationRights(_rights);
        emit PreservationRightsSet(_rights);
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        require(_checkTransferRequirements(msg.sender, amount), "Transfer requirements not met");
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        require(_checkTransferRequirements(from, amount), "Transfer requirements not met");
        return super.transferFrom(from, to, amount);
    }

    function _checkTransferRequirements(address from, uint256 amount) internal view returns (bool) {
        // Skip checks if alignment verifier isn't set yet or if sender is owner
        if (address(alignmentVerifier) == address(0) || from == owner()) {
            return true;
        }

        // Skip checks for small transfers
        if (amount <= 1000 * 10**18) { // 1000 SUTRA or less
            return true;
        }

        // Get sender's metrics
        IAlignmentVerifier.AlignmentMetrics memory metrics = alignmentVerifier.verifyAlignment(from);
        
        // Calculate alignment score
        uint256 score = (
            metrics.understanding +
            metrics.intention +
            metrics.communication +
            metrics.action +
            metrics.sustainability +
            metrics.effort +
            metrics.mindfulness +
            metrics.focus
        ) / 8;

        // Require minimum alignment score for significant transfers
        require(score >= 70, "Insufficient alignment score for large transfer");
        return true;
    }

    function getStatus(address account) external view returns (
        IAlignmentVerifier.AlignmentMetrics memory metrics,
        IPreservationRights.Level level
    ) {
        if (address(alignmentVerifier) != address(0)) {
            metrics = alignmentVerifier.verifyAlignment(account);
        }
        if (address(preservationRights) != address(0)) {
            level = preservationRights.getPreservationLevel(account);
        }
    }
}
