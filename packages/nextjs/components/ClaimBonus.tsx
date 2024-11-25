"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { parseEther } from "viem";

interface ClaimBonusProps {
  hotelPrice: number;
}

const ClaimBonus: React.FC<ClaimBonusProps> = ({ hotelPrice }) => {
  const [step, setStep] = useState<"initial" | "cooldown" | "completed">("initial");
  const [error, setError] = useState<string | null>(null);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);

  const stakingContract = process.env.NEXT_PUBLIC_STAKING_CONTRACT as `0x${string}`;
  const deployerPrivateKey = process.env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY as string;
  const deployerWallet = process.env.NEXT_PUBLIC_DEPLOYER_WALLET as `0x${string}`;
  const priceInUSDe = parseEther(hotelPrice.toString());

  // Trigger the cooldown action
  const handleStartCooldown = async () => {
    try {
      setError(null);
      setStep("cooldown");

      console.log("Initiating cooldown with price:", hotelPrice, "USDe");

      // Ensure deployer wallet is correctly set up
      const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
      const deployerSigner = new ethers.Wallet(deployerPrivateKey, provider);

      console.log("Deployer Wallet Address:", deployerSigner.address);

      // Initiate the cooldown from the deployer wallet
      const stakingContractInstance = new ethers.Contract(
        stakingContract,
        [
          {
            name: "cooldownAssets",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [{ name: "amount", type: "uint256" }],
            outputs: [],
          },
        ],
        deployerSigner,
      );

      const tx = await stakingContractInstance.cooldownAssets(priceInUSDe);
      console.log("Cooldown Transaction Sent:", tx);

      await tx.wait(); // Wait for transaction confirmation
      console.log("Cooldown Transaction Confirmed");

      // Set cooldown end time (1 hour)
      const cooldownDuration = 3600; // 1 hour in seconds
      const endTime = Math.floor(Date.now() / 1000) + cooldownDuration;
      setCooldownEndTime(endTime);

      // Set a timer to execute unstake after 1 hour
      setTimeout(() => {
        handleUnstake();
      }, cooldownDuration * 1000); // Wait 1 hour
    } catch (error) {
      console.error("Error during cooldown:", error);
      setError("Cooldown failed. Please try again.");
      setStep("initial");
    }
  };

  // Function to send sUSDe from deployer wallet to 0x0000 automatically
  const handleUnstake = async () => {
    try {
      setError(null);
      setStep("completed");

      console.log("Unstaking assets after cooldown period");

      // Use ethers to sign the transaction with the deployer's private key
      const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
      const deployerSigner = new ethers.Wallet(deployerPrivateKey, provider);

      const stakingContractInstance = new ethers.Contract(
        stakingContract,
        [
          {
            name: "unstake",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [{ name: "receiver", type: "address" }],
            outputs: [],
          },
        ],
        deployerSigner,
      );

      const tx = await stakingContractInstance.unstake(deployerWallet); // Unstake from deployer's wallet
      await tx.wait(); // Wait for transaction confirmation

      console.log("Unstake Transaction Confirmed");

      setStep("completed"); // Mark the process as completed
    } catch (error) {
      console.error("Error during unstaking:", error);
      setError("Unstake failed. Please try again.");
    }
  };

  // Get remaining cooldown time
  const getRemainingCooldownTime = () => {
    if (!cooldownEndTime) return null;
    const now = Math.floor(Date.now() / 1000);
    const remaining = cooldownEndTime - now;
    if (remaining <= 0) return "Ready to unstake";
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="text-center mt-4">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {step === "initial" && (
        <button
          onClick={handleStartCooldown}
          disabled={false} // No longer disabling based on cooldown, just showing the start
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start bonus claim
        </button>
      )}

      {step === "cooldown" && (
        <div>
          <p className="text-sm text-gray-600 mt-2">
            Cooldown started. Bonus will be sent to your wallet after 1 hour. {getRemainingCooldownTime()}
          </p>
          <p className="text-sm text-gray-600 mt-4">Your bonus is being automatically claimed.</p>
        </div>
      )}

      {step === "completed" && <p className="text-sm text-green-600 mt-2">Bonus claimed successfully!</p>}
    </div>
  );
};

export default ClaimBonus;
