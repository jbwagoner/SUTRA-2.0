# Technical Specifications

## Smart Contracts

### SUTRA Token
- ERC20-compliant
- Initial Supply: 21,000,000
- Total Supply: 108,000,000
- Decimals: 18

### AlignmentVerifier
- 8 tracked metrics
- History limit: 10 entries
- Change threshold: 10 points
- Weights: 15/10 (critical/standard)

### PreservationRights
- Basic Access: 108 SUTRA
- Advanced Rights: 1,080 SUTRA
- Guardian Status: 10,800 SUTRA

## Validation

### Metrics
- Range: 0-100
- Required flag per metric
- Custom thresholds
- Optional metrics bypass

### Trends
- 10-point threshold
- Positive/negative alerts
- Per-metric tracking
- Historical context

### Warnings
- Threshold alerts
- Trend notifications
- Emergency alerts
- Level changes

## Development
- Hardhat framework
- TypeScript/Solidity
- Ethers.js
- Chai testing
