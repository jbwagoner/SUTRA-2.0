// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAlignmentVerifier.sol";

contract AlignmentVerifier is IAlignmentVerifier, Ownable {
    // Mappings
    mapping(address => AlignmentMetrics) private _alignmentMetrics;
    mapping(address => AlignmentMetrics[]) private _alignmentHistory;
    mapping(string => MetricRequirement) private _requirements;

    // Constants
    uint256 public constant ABSOLUTE_MAX = 100;
    uint256 public constant HISTORY_LIMIT = 10;
    uint256 public constant SIGNIFICANT_CHANGE = 10;

    constructor() Ownable(msg.sender) {
        _initializeRequirements();
    }

    function _initializeRequirements() private {
        _setRequirement("understanding", 0, ABSOLUTE_MAX, 60, true);
        _setRequirement("intention", 0, ABSOLUTE_MAX, 60, true);
        _setRequirement("communication", 0, ABSOLUTE_MAX, 50, true);
        _setRequirement("action", 0, ABSOLUTE_MAX, 60, true);
        _setRequirement("sustainability", 0, ABSOLUTE_MAX, 50, false);
        _setRequirement("effort", 0, ABSOLUTE_MAX, 55, true);
        _setRequirement("mindfulness", 0, ABSOLUTE_MAX, 60, true);
        _setRequirement("focus", 0, ABSOLUTE_MAX, 55, true);
    }

    function _setRequirement(
        string memory metric,
        uint256 minValid,
        uint256 maxValid,
        uint256 recommended,
        bool required
    ) private {
        require(maxValid <= ABSOLUTE_MAX, "Max value exceeds absolute maximum");
        require(recommended <= maxValid, "Recommended value exceeds maximum");
        require(minValid <= recommended, "Minimum value exceeds recommended");

        _requirements[metric] = MetricRequirement(minValid, maxValid, recommended, required);
        emit MetricRequirementSet(metric, minValid, maxValid, recommended, required);
    }

    function setRequirement(
        string calldata metric,
        uint256 minValid,
        uint256 maxValid,
        uint256 recommended,
        bool required
    ) external override onlyOwner {
        _setRequirement(metric, minValid, maxValid, recommended, required);
    }

    function updateAlignment(address entity, AlignmentMetrics memory metrics) external override onlyOwner {
        // First store current metrics and emit event
        _alignmentMetrics[entity] = metrics;
        emit AlignmentUpdated(entity, metrics);
        
        // Then validate
        _validateMetrics(metrics);

        // Update history efficiently
        if (_alignmentHistory[entity].length > 0) {
            AlignmentMetrics memory lastMetrics = _alignmentHistory[entity][_alignmentHistory[entity].length - 1];
            _checkTrends(entity, metrics, lastMetrics);
        }
        
        // Add to history
        if (_alignmentHistory[entity].length >= HISTORY_LIMIT) {
            delete _alignmentHistory[entity][0];
            _alignmentHistory[entity].push(metrics);
        } else {
            _alignmentHistory[entity].push(metrics);
        }

        // Check warnings last
        _checkWarnings(entity, metrics);
    }

    function _validateMetrics(AlignmentMetrics memory metrics) private view {
        MetricRequirement memory req;

        req = _requirements["understanding"];
        require((!req.required || metrics.understanding >= req.minValid) && 
                metrics.understanding <= req.maxValid, "Invalid understanding metric");

        req = _requirements["intention"];
        require((!req.required || metrics.intention >= req.minValid) && 
                metrics.intention <= req.maxValid, "Invalid intention metric");

        req = _requirements["communication"];
        require((!req.required || metrics.communication >= req.minValid) && 
                metrics.communication <= req.maxValid, "Invalid communication metric");

        req = _requirements["action"];
        require((!req.required || metrics.action >= req.minValid) && 
                metrics.action <= req.maxValid, "Invalid action metric");

        req = _requirements["sustainability"];
        require((!req.required || metrics.sustainability >= req.minValid) && 
                metrics.sustainability <= req.maxValid, "Invalid sustainability metric");

        req = _requirements["effort"];
        require((!req.required || metrics.effort >= req.minValid) && 
                metrics.effort <= req.maxValid, "Invalid effort metric");

        req = _requirements["mindfulness"];
        require((!req.required || metrics.mindfulness >= req.minValid) && 
                metrics.mindfulness <= req.maxValid, "Invalid mindfulness metric");

        req = _requirements["focus"];
        require((!req.required || metrics.focus >= req.minValid) && 
                metrics.focus <= req.maxValid, "Invalid focus metric");
    }

    function _checkWarnings(address entity, AlignmentMetrics memory metrics) private {
        MetricRequirement memory req;

        req = _requirements["understanding"];
        if (metrics.understanding < req.recommended) {
            emit ThresholdWarning(entity, "understanding");
        }
        if (metrics.intention < _requirements["intention"].recommended) {
            emit ThresholdWarning(entity, "intention");
        }
        if (metrics.communication < _requirements["communication"].recommended) {
            emit ThresholdWarning(entity, "communication");
        }
        if (metrics.action < _requirements["action"].recommended) {
            emit ThresholdWarning(entity, "action");
        }
        if (metrics.sustainability < _requirements["sustainability"].recommended) {
            emit ThresholdWarning(entity, "sustainability");
        }
        if (metrics.effort < _requirements["effort"].recommended) {
            emit ThresholdWarning(entity, "effort");
        }
        if (metrics.mindfulness < _requirements["mindfulness"].recommended) {
            emit ThresholdWarning(entity, "mindfulness");
        }
        if (metrics.focus < _requirements["focus"].recommended) {
            emit ThresholdWarning(entity, "focus");
        }
    }

    function _checkTrends(address entity, AlignmentMetrics memory newMetrics, AlignmentMetrics memory lastMetrics) private {
        if (_hasSignificantChange(newMetrics.understanding, lastMetrics.understanding)) {
            emit AlignmentTrendAlert(entity, "understanding", newMetrics.understanding > lastMetrics.understanding);
        }
        if (_hasSignificantChange(newMetrics.intention, lastMetrics.intention)) {
            emit AlignmentTrendAlert(entity, "intention", newMetrics.intention > lastMetrics.intention);
        }
        if (_hasSignificantChange(newMetrics.communication, lastMetrics.communication)) {
            emit AlignmentTrendAlert(entity, "communication", newMetrics.communication > lastMetrics.communication);
        }
        if (_hasSignificantChange(newMetrics.action, lastMetrics.action)) {
            emit AlignmentTrendAlert(entity, "action", newMetrics.action > lastMetrics.action);
        }
        if (_hasSignificantChange(newMetrics.sustainability, lastMetrics.sustainability)) {
            emit AlignmentTrendAlert(entity, "sustainability", newMetrics.sustainability > lastMetrics.sustainability);
        }
        if (_hasSignificantChange(newMetrics.effort, lastMetrics.effort)) {
            emit AlignmentTrendAlert(entity, "effort", newMetrics.effort > lastMetrics.effort);
        }
        if (_hasSignificantChange(newMetrics.mindfulness, lastMetrics.mindfulness)) {
            emit AlignmentTrendAlert(entity, "mindfulness", newMetrics.mindfulness > lastMetrics.mindfulness);
        }
        if (_hasSignificantChange(newMetrics.focus, lastMetrics.focus)) {
            emit AlignmentTrendAlert(entity, "focus", newMetrics.focus > lastMetrics.focus);
        }
    }

    function _hasSignificantChange(uint256 newValue, uint256 oldValue) private pure returns (bool) {
        if (newValue > oldValue) {
            return newValue - oldValue >= SIGNIFICANT_CHANGE;
        }
        return oldValue - newValue >= SIGNIFICANT_CHANGE;
    }

    function getAlignmentHistory(address entity) external view override returns (AlignmentMetrics[] memory) {
        return _alignmentHistory[entity];
    }

    function getAlignmentScore(address entity) external view override returns (uint256) {
        AlignmentMetrics memory metrics = _alignmentMetrics[entity];
        
        return (
            (metrics.understanding * 15) +  // Critical
            (metrics.intention * 15) +      // Critical
            (metrics.communication * 10) +
            (metrics.action * 15) +         // Critical
            (metrics.sustainability * 10) +
            (metrics.effort * 10) +
            (metrics.mindfulness * 15) +    // Critical
            (metrics.focus * 10)
        ) / 100;
    }

    function verifyAlignment(address entity) external view override returns (AlignmentMetrics memory) {
        return _alignmentMetrics[entity];
    }
}
