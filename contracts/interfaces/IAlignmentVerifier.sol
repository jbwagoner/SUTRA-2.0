// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAlignmentVerifier {
    struct AlignmentMetrics {
        uint256 understanding;   // Right Understanding
        uint256 intention;       // Right Intention
        uint256 communication;   // Right Speech
        uint256 action;         // Right Action
        uint256 sustainability; // Right Livelihood
        uint256 effort;         // Right Effort
        uint256 mindfulness;    // Right Mindfulness
        uint256 focus;          // Right Concentration
    }

    struct MetricRequirement {
        uint256 minValid;      // Minimum valid value (validation)
        uint256 maxValid;      // Maximum valid value (validation)
        uint256 recommended;   // Recommended minimum (warning)
        bool required;         // Whether metric is required
    }

    event AlignmentUpdated(address indexed entity, AlignmentMetrics metrics);
    event ThresholdWarning(address indexed entity, string metric);
    event MetricRequirementSet(string metric, uint256 minValid, uint256 maxValid, uint256 recommended, bool required);
    event AlignmentTrendAlert(address indexed entity, string metric, bool isPositive);

    function verifyAlignment(address entity) external view returns (AlignmentMetrics memory);
    function updateAlignment(address entity, AlignmentMetrics memory metrics) external;
    function getAlignmentScore(address entity) external view returns (uint256);
    function getAlignmentHistory(address entity) external view returns (AlignmentMetrics[] memory);
    function setRequirement(string calldata metric, uint256 minValid, uint256 maxValid, uint256 recommended, bool required) external;
}
