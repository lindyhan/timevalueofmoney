// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IEthenaStaking {
    function approve(address spender, uint256 amount) external;
    function deposit(address to, uint256 amount) external;
    function cooldownDuration() external view returns (uint256);
    function cooldownAssets(uint256 amount) external;
    function unstake(address recipient) external;
}

contract HotelBooking {
    IERC20 public USDeToken; // ERC20 token for USDe
    IEthenaStaking public USDeStaking; // Ethena staking contract
    address public deployerWallet; // Deployer wallet address

    // Mapping to track staked amounts and rewards for each user
    mapping(address => uint256) public userStakedUSDe;

    // Events for logging staking and unstaking actions
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 reward, uint256 stakedAmount);

    constructor(
        address _USDeToken,
        address _USDeStaking,
        address _deployerWallet
    ) {
        USDeToken = IERC20(_USDeToken);
        USDeStaking = IEthenaStaking(_USDeStaking);
        deployerWallet = _deployerWallet;
    }

    // Stake function: User stakes USDe, deployer receives sUSDe
    function stakeUSDe(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        // Transfer USDe from user wallet to this contract
        require(
            USDeToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Approve the staking contract to spend USDe
        USDeToken.approve(address(USDeStaking), amount);

        // Deposit USDe into staking contract on behalf of deployer wallet
        USDeStaking.deposit(deployerWallet, amount);

        // Record the user's staked amount
        userStakedUSDe[msg.sender] += amount;

        // Emit staking event
        emit Staked(msg.sender, amount);
    }

    // Claim function: User initiates reward claim and unstaking process
    function claimReward() external {
        uint256 stakedAmount = userStakedUSDe[msg.sender];
        require(stakedAmount > 0, "No staked amount to claim rewards");

        // Get cooldown duration and initiate cooldown
        uint256 cooldownDuration = USDeStaking.cooldownDuration();
        USDeStaking.cooldownAssets(stakedAmount);

        // After cooldown, deployer wallet performs unstaking
        USDeStaking.unstake(deployerWallet);

        // Calculate rewards
        uint256 totalUnstaked = USDeToken.balanceOf(deployerWallet); // USDe received back
        require(totalUnstaked >= stakedAmount, "Unstaking failed");

        uint256 rewardAmount = totalUnstaked - stakedAmount;
        require(rewardAmount > 0, "No rewards available");

        // Transfer reward to the user
        require(
            USDeToken.transfer(msg.sender, rewardAmount),
            "Reward transfer failed"
        );

        // Reset user's staked amount
        userStakedUSDe[msg.sender] = 0;

        // Emit unstaking event
        emit Unstaked(msg.sender, rewardAmount, stakedAmount);
    }
}

// deployed at 0x180A58560226B104C90be50259308505773F91fB