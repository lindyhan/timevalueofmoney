"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";

interface BookingActionsProps {
  hotelPrice: number;
  onPaymentComplete: () => void;
}

const BookingActions: React.FC<BookingActionsProps> = ({ hotelPrice, onPaymentComplete }) => {
  const [step, setStep] = useState<"initial" | "approving" | "approved" | "paying" | "paid">("initial");
  const [error, setError] = useState<string | null>(null);

  const usdeToken = process.env.NEXT_PUBLIC_USDE_TOKEN as `0x${string}`;
  const stakingContract = process.env.NEXT_PUBLIC_STAKING_CONTRACT as `0x${string}`;
  const deployerWallet = process.env.NEXT_PUBLIC_DEPLOYER_WALLET as `0x${string}`;

  const priceInUSDe = parseEther(hotelPrice.toString());

  const { writeContract: approveToken, isPending: isApproving } = useWriteContract();
  const { writeContract: makePayment, isPending: isPaying } = useWriteContract();

  const handleApprove = async () => {
    try {
      setError(null);
      setStep("approving");

      await approveToken({
        address: usdeToken,
        abi: [
          {
            name: "approve",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "spender", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ type: "bool" }],
          },
        ],
        functionName: "approve",
        args: [stakingContract, priceInUSDe],
      });

      setTimeout(() => {
        setStep("approved");
      }, 15000);
    } catch (error) {
      console.error("Approval error:", error);
      setError("Failed to approve USDe spending. Please try again.");
      setStep("initial");
    }
  };

  const handlePay = async () => {
    try {
      setError(null);
      setStep("paying");

      await makePayment({
        address: stakingContract,
        abi: [
          {
            name: "deposit",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "amount", type: "uint256" },
              { name: "to", type: "address" },
            ],
            outputs: [],
          },
        ],
        functionName: "deposit",
        args: [priceInUSDe, deployerWallet],
      });

      setTimeout(() => {
        setStep("paid");
        onPaymentComplete();
      }, 15000);
    } catch (error) {
      console.error("Staking error:", error);
      setError("Failed to complete. Please try again.");
      setStep("approved");
    }
  };

  return (
    <div className="text-center mt-4">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {step === "initial" && (
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isApproving ? "Approving..." : `Approve ${hotelPrice.toFixed(2)} USDe`}
        </button>
      )}

      {step === "approved" && (
        <button
          onClick={handlePay}
          disabled={isPaying}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {isPaying ? "Payment in progress..." : `Pay ${hotelPrice.toFixed(2)} USDe`}
        </button>
      )}

      {step === "paid" && (
        <p className="text-sm text-green-600 mt-2">
          Payment successful! You may claim your bonus after your hotel stay.
        </p>
      )}
    </div>
  );
};

export default BookingActions;
