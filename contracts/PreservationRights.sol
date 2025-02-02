// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IPreservationRights.sol";

contract PreservationRights is IPreservationRights, Ownable {
    // SUTRA token contract reference
    IERC20 public sutraToken;
    
    // Token thresholds for each level
    uint256 public constant BASIC_ACCESS_THRESHOLD = 108 * 10**18;    // 108 SUTRA
    uint256 public constant ADVANCED_RIGHTS_THRESHOLD = 1080 * 10**18; // 1,080 SUTRA
    uint256 public constant GUARDIAN_STATUS_THRESHOLD = 10800 * 10**18; // 10,800 SUTRA

    // Mapping to store manual level overrides (for special cases)
    mapping(address => Level) private _levelOverrides;
    
    // Events
    event PreservationLevelChanged(address indexed entity, Level level);
    event ManualOverrideSet(address indexed entity, Level level);

    constructor(address _sutraToken) Ownable(msg.sender) {
        require(_sutraToken != address(0), "Invalid token address");
        sutraToken = IERC20(_sutraToken);
    }

    /**
     * @dev Get the preservation level for an entity based on token holdings or override
     * @param entity Address to check
     */
    function getPreservationLevel(address entity) external view returns (Level) {
        // Check for manual override first
        if (_levelOverrides[entity] != Level.None) {
            return _levelOverrides[entity];
        }

        // Get token balance
        uint256 balance = sutraToken.balanceOf(entity);
        
        // Determine level based on balance
        if (balance >= GUARDIAN_STATUS_THRESHOLD) {
            return Level.GuardianStatus;
        } else if (balance >= ADVANCED_RIGHTS_THRESHOLD) {
            return Level.AdvancedRights;
        } else if (balance >= BASIC_ACCESS_THRESHOLD) {
            return Level.BasicAccess;
        }
        
        return Level.None;
    }

    /**
     * @dev Update preservation level for an entity (implements interface)
     * @param entity Address to update
     * @param level New preservation level
     */
    function updatePreservationLevel(address entity, Level level) external onlyOwner {
        require(entity != address(0), "Invalid entity address");
        _levelOverrides[entity] = level;
        emit PreservationLevelChanged(entity, level);
    }

    /**
     * @dev Set a manual override for an entity's preservation level
     * @param entity Address to set override for
     * @param level New preservation level
     */
    function setLevelOverride(address entity, Level level) external onlyOwner {
        require(entity != address(0), "Invalid entity address");
        _levelOverrides[entity] = level;
        emit ManualOverrideSet(entity, level);
        emit PreservationLevelChanged(entity, level);
    }

    /**
     * @dev Remove manual override for an entity
     * @param entity Address to remove override for
     */
    function removeLevelOverride(address entity) external onlyOwner {
        require(_levelOverrides[entity] != Level.None, "No override exists");
        delete _levelOverrides[entity];
        
        // Emit event with current level based on token balance
        Level currentLevel = this.getPreservationLevel(entity);
        emit PreservationLevelChanged(entity, currentLevel);
    }

    /**
     * @dev Check if an entity has at least a specific preservation level
     * @param entity Address to check
     * @param level Minimum level required
     */
    function hasMinimumLevel(address entity, Level level) external view returns (bool) {
        Level currentLevel = this.getPreservationLevel(entity);
        return uint8(currentLevel) >= uint8(level);
    }
}
