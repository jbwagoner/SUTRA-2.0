// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IAlignmentVerifier.sol";

contract AlignmentVerifier is IAlignmentVerifier, Ownable {
    // Mapping from entity address to their alignment metrics
    mapping(address => AlignmentMetrics) private _alignmentMetrics;

    // Minimum threshold values for each metric (0-100 scale)
    uint256 public constant MIN_THRESHOLD = 60;
    
    // Events for alignment updates
    event AlignmentUpdated(address indexed entity, AlignmentMetrics metrics);
    event ThresholdWarning(address indexed entity, string metric);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Get the alignment metrics for an entity
     * @param entity Address of the entity to check
     */
    function verifyAlignment(address entity) external view returns (AlignmentMetrics memory) {
        return _alignmentMetrics[entity];
    }

    /**
     * @dev Update alignment metrics for an entity
     * @param entity Address of the entity to update
     * @param metrics New alignment metrics
     */
    function updateAlignment(address entity, AlignmentMetrics memory metrics) external onlyOwner {
        require(_validateMetrics(metrics), "Invalid metrics values");
        
        _alignmentMetrics[entity] = metrics;
        
        emit AlignmentUpdated(entity, metrics);
        
        // Check for metrics below threshold
        _checkThresholds(entity, metrics);
    }

    /**
     * @dev Validate that all metrics are within acceptable range (0-100)
     */
    function _validateMetrics(AlignmentMetrics memory metrics) private pure returns (bool) {
        require(metrics.understanding <= 100, "Understanding metric too high");
        require(metrics.intention <= 100, "Intention metric too high");
        require(metrics.communication <= 100, "Communication metric too high");
        require(metrics.action <= 100, "Action metric too high");
        require(metrics.sustainability <= 100, "Sustainability metric too high");
        require(metrics.effort <= 100, "Effort metric too high");
        require(metrics.mindfulness <= 100, "Mindfulness metric too high");
        require(metrics.focus <= 100, "Focus metric too high");
        
        return true;
    }

    /**
     * @dev Check if any metrics are below threshold and emit warnings
     */
    function _checkThresholds(address entity, AlignmentMetrics memory metrics) private {
        if (metrics.understanding < MIN_THRESHOLD) emit ThresholdWarning(entity, "understanding");
        if (metrics.intention < MIN_THRESHOLD) emit ThresholdWarning(entity, "intention");
        if (metrics.communication < MIN_THRESHOLD) emit ThresholdWarning(entity, "communication");
        if (metrics.action < MIN_THRESHOLD) emit ThresholdWarning(entity, "action");
        if (metrics.sustainability < MIN_THRESHOLD) emit ThresholdWarning(entity, "sustainability");
        if (metrics.effort < MIN_THRESHOLD) emit ThresholdWarning(entity, "effort");
        if (metrics.mindfulness < MIN_THRESHOLD) emit ThresholdWarning(entity, "mindfulness");
        if (metrics.focus < MIN_THRESHOLD) emit ThresholdWarning(entity, "focus");
    }

    /**
     * @dev Calculate overall alignment score (0-100)
     * @param entity Address of the entity to check
     * @return score The overall alignment score
     */
    function getAlignmentScore(address entity) external view returns (uint256 score) {
        AlignmentMetrics memory metrics = _alignmentMetrics[entity];
        
        score = (
            metrics.understanding +
            metrics.intention +
            metrics.communication +
            metrics.action +
            metrics.sustainability +
            metrics.effort +
            metrics.mindfulness +
            metrics.focus
        ) / 8;
        
        return score;
    }
}