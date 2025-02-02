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
        // Initialize with default requirements
        _initializeRequirements();
    }

    function _initializeRequirements() private {
        // Right Understanding - Required, critical metric
        _setRequirement("understanding", 0, ABSOLUTE_MAX, 60, true);
        // Right Intention - Required, critical metric
        _setRequirement("intention", 0, ABSOLUTE_MAX, 60, true);
        // Right Speech - Required but with lower threshold
        _setRequirement("communication", 0, ABSOLUTE_MAX, 50, true);
        // Right Action - Required, critical metric
        _setRequirement("action", 0, ABSOLUTE_MAX, 60, true);
        // Right Livelihood - Optional with recommendation
        _setRequirement("sustainability", 0, ABSOLUTE_MAX, 50, false);
        // Right Effort - Required with moderate threshold
        _setRequirement("effort", 0, ABSOLUTE_MAX, 55, true);
        // Right Mindfulness - Required, critical metric
        _setRequirement("mindfulness", 0, ABSOLUTE_MAX, 60, true);
        // Right Concentration - Required with moderate threshold
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

    function getAlignmentHistory(address entity) external view override returns (AlignmentMetrics[] memory) {
        return _alignmentHistory[entity];
    }

    function updateAlignment(address entity, AlignmentMetrics memory metrics) external override onlyOwner {
        // Validation (will revert if invalid)
        _validateMetrics(metrics);
        
        // Store previous metrics for trend analysis
        if (_alignmentHistory[entity].length > 0) {
            _analyzeTrends(entity, metrics);
        }
        
        // Store current metrics
        _alignmentMetrics[entity] = metrics;
        
        // Update history
        _updateHistory(entity, metrics);
        
        // Check for warnings (won't revert)
        _checkWarnings(entity, metrics);
        
        emit AlignmentUpdated(entity, metrics);
    }

    function _validateMetrics(AlignmentMetrics memory metrics) private view {
        MetricRequirement memory req;

        req = _requirements["understanding"];
        if (req.required) {
            require(
                metrics.understanding >= req.minValid && 
                metrics.understanding <= req.maxValid, 
                "Invalid understanding metric"
            );
        }

        req = _requirements["intention"];
        if (req.required) {
            require(
                metrics.intention >= req.minValid && 
                metrics.intention <= req.maxValid, 
                "Invalid intention metric"
            );
        }

        req = _requirements["communication"];
        if (req.required) {
            require(
                metrics.communication >= req.minValid && 
                metrics.communication <= req.maxValid, 
                "Invalid communication metric"
            );
        }

        req = _requirements["action"];
        if (req.required) {
            require(
                metrics.action >= req.minValid && 
                metrics.action <= req.maxValid, 
                "Invalid action metric"
            );
        }

        req = _requirements["sustainability"];
        if (req.required) {
            require(
                metrics.sustainability >= req.minValid && 
                metrics.sustainability <= req.maxValid, 
                "Invalid sustainability metric"
            );
        }

        req = _requirements["effort"];
        if (req.required) {
            require(
                metrics.effort >= req.minValid && 
                metrics.effort <= req.maxValid, 
                "Invalid effort metric"
            );
        }

        req = _requirements["mindfulness"];
        if (req.required) {
            require(
                metrics.mindfulness >= req.minValid && 
                metrics.mindfulness <= req.maxValid, 
                "Invalid mindfulness metric"
            );
        }

        req = _requirements["focus"];
        if (req.required) {
            require(
                metrics.focus >= req.minValid && 
                metrics.focus <= req.maxValid, 
                "Invalid focus metric"
            );
        }
    }

    function _checkWarnings(address entity, AlignmentMetrics memory metrics) private {
        MetricRequirement memory req;
        
        req = _requirements["understanding"];
        if (metrics.understanding < req.recommended) {
            emit ThresholdWarning(entity, "understanding");
        }

        req = _requirements["intention"];
        if (metrics.intention < req.recommended) {
            emit ThresholdWarning(entity, "intention");
        }

        req = _requirements["communication"];
        if (metrics.communication < req.recommended) {
            emit ThresholdWarning(entity, "communication");
        }

        req = _requirements["action"];
        if (metrics.action < req.recommended) {
            emit ThresholdWarning(entity, "action");
        }

        req = _requirements["sustainability"];
        if (metrics.sustainability < req.recommended) {
            emit ThresholdWarning(entity, "sustainability");
        }

        req = _requirements["effort"];
        if (metrics.effort < req.recommended) {
            emit ThresholdWarning(entity, "effort");
        }

        req = _requirements["mindfulness"];
        if (metrics.mindfulness < req.recommended) {
            emit ThresholdWarning(entity, "mindfulness");
        }

        req = _requirements["focus"];
        if (metrics.focus < req.recommended) {
            emit ThresholdWarning(entity, "focus");
        }
    }

    function _analyzeTrends(address entity, AlignmentMetrics memory newMetrics) private {
        AlignmentMetrics memory lastMetrics = _alignmentHistory[entity][_alignmentHistory[entity].length - 1];

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

    function _updateHistory(address entity, AlignmentMetrics memory metrics) private {
        if (_alignmentHistory[entity].length >= HISTORY_LIMIT) {
            // Shift array to remove oldest entry
            for (uint i = 0; i < HISTORY_LIMIT - 1; i++) {
                _alignmentHistory[entity][i] = _alignmentHistory[entity][i + 1];
            }
            _alignmentHistory[entity][HISTORY_LIMIT - 1] = metrics;
        } else {
            _alignmentHistory[entity].push(metrics);
        }
    }

    function getAlignmentScore(address entity) external view override returns (uint256) {
        AlignmentMetrics memory metrics = _alignmentMetrics[entity];
        
        // Weighted scoring - critical metrics have higher weight
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
