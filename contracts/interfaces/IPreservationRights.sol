// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPreservationRights {
    enum Level {
        None,
        BasicAccess,     // 108 SUTRA
        AdvancedRights,  // 1,080 SUTRA
        GuardianStatus   // 10,800 SUTRA
    }

    function getPreservationLevel(address entity) external view returns (Level);
    function updatePreservationLevel(address entity, Level level) external;
}
