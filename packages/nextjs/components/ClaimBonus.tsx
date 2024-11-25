import { useState } from "react";
import { ethers } from "ethers";
import { useReadContract, useWriteContract } from "wagmi";

const ClaimBonus: React.FC = () => {
  const [step, setStep] = useState<"initial" | "cooldown" | "unstaking" | "completed">("initial");
  const [error, setError] = useState<string | null>(null);

  const stakingContract = process.env.NEXT_PUBLIC_STAKING_CONTRACT as `0x${string}`;
  const deployerWallet = process.env.NEXT_PUBLIC_DEPLOYER_WALLET as `0x${string}`;
  const deployerPrivateKey = process.env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY as string;

  // Contract write hooks
  const { writeContract: initiateCooldown } = useWriteContract();

  // Get cooldown duration
  const { data: cooldownPeriod } = useReadContract({
    address: stakingContract,
    abi: [
      {
        inputs: [],
        name: "cooldownDuration",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "cooldownDuration",
  });

  // Function to execute automated unstaking after cooldown
  const executeAutomatedUnstaking = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const wallet = new ethers.Wallet(deployerPrivateKey, provider);
      const stakingContractWithSigner = new ethers.Contract(
        stakingContract,
        [
          {
            inputs: [{ internalType: "address", name: "recipient", type: "address" }],
            name: "unstake",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        wallet,
      );

      // Execute unstake transaction
      const tx = await stakingContractWithSigner.unstake(deployerWallet);
      await tx.wait();

      setStep("completed");
    } catch (error) {
      console.error("Automated unstaking error:", error);
      setError("Failed to complete unstaking. Please try again.");
    }
  };

  const handleStartCooldown = async () => {
    try {
      setError(null);
      setStep("cooldown");

      // Get the sUSDe balance of the deployer wallet
      const sUsdeBalance = await getDeployerSUsdeBalance();

      await initiateCooldown({
        address: stakingContract,
        abi: [
          {
            inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
            name: "cooldownAssets",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "cooldownAssets",
        args: [sUsdeBalance],
      });

      // Schedule automated unstaking after cooldown period
      setTimeout(executeAutomatedUnstaking, Number(cooldownPeriod) * 1000);
    } catch (error) {
      console.error("Cooldown error:", error);
      setError("Failed to start cooldown. Please try again.");
      setStep("initial");
    }
  };

  // Helper function to get deployer's sUSDe balance
  const getDeployerSUsdeBalance = async () => {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const sUsdeContract = new ethers.Contract(
      stakingContract,
      [
        {
          inputs: [{ internalType: "address", name: "account", type: "address" }],
          name: "balanceOf",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
      ],
      provider,
    );

    return await sUsdeContract.balanceOf(deployerWallet);
  };

  return (
    <div className="text-center mt-4">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {step === "initial" && (
        <button
          onClick={handleStartCooldown}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start Cooldown Period
        </button>
      )}

      {step === "cooldown" && (
        <p className="text-sm text-gray-600">
          Cooldown period initiated. Unstaking will happen automatically after 1 hour.
        </p>
      )}

      {step === "completed" && (
        <div>
          <p className="text-sm text-green-600 mt-2">
            Unstaking completed! The rewards have been sent to the deployer wallet.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClaimBonus;
