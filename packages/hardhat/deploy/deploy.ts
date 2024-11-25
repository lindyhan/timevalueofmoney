import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const deployHotelBooking: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  // Retrieve named accounts
  const { deployer } = await getNamedAccounts();

  // Load environment variables for constructor arguments
  const usDeToken = process.env.USDE_TOKEN!;
  const stakingContract = process.env.STAKING_CONTRACT!;
  const deployerWallet = process.env.DEPLOYER_WALLET!;

  console.log("Deploying HotelBooking contract...");

  // Deploy the contract
  const hotelBooking = await deploy("HotelBooking", {
    from: deployer,
    args: [usDeToken, stakingContract, deployerWallet],
    log: true,
  });

  console.log(`HotelBooking deployed at: ${hotelBooking.address}`);
};

export default deployHotelBooking;

deployHotelBooking.tags = ["HotelBooking"];
