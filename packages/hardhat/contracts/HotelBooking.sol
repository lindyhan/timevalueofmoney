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
    IERC20 public USDeToken;
    IEthenaStaking public USDeStaking;
    address public deployerWallet;

    mapping(address => uint256) public userStakedUSDe;

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

    function stakeUSDe(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

    
        require(
            USDeToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
    
        USDeToken.approve(address(USDeStaking), amount);
        USDeStaking.deposit(deployerWallet, amount);
        userStakedUSDe[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function claimReward() external {
        uint256 stakedAmount = userStakedUSDe[msg.sender];
        require(stakedAmount > 0, "No staked amount to claim rewards");
        uint256 cooldownDuration = USDeStaking.cooldownDuration();
        USDeStaking.cooldownAssets(stakedAmount);
        USDeStaking.unstake(deployerWallet);

        uint256 totalUnstaked = USDeToken.balanceOf(deployerWallet);
        require(totalUnstaked >= stakedAmount, "Unstaking failed");

        uint256 rewardAmount = totalUnstaked - stakedAmount;
        require(rewardAmount > 0, "No rewards available");
    
        require(
            USDeToken.transfer(msg.sender, rewardAmount),
            "Reward transfer failed"
        );
    
        userStakedUSDe[msg.sender] = 0;
    
        emit Unstaked(msg.sender, rewardAmount, stakedAmount);
    }
}
