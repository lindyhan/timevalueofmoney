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
  const priceInUSDe = parseEther(hotelPrice.toString());

  // Approval transaction
  const { writeContract: approveToken, isPending: isApproving } = useWriteContract();

  // Payment/Staking transaction
  const { writeContract: makePayment, isPending: isPaying } = useWriteContract();

  const handleApprove = async () => {
    try {
      setError(null);
      setStep("approving");

      await approveToken({
        address: usdeToken,
        abi: [
          {
            inputs: [
              { internalType: "address", name: "spender", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "approve",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "approve",
        args: [stakingContract, priceInUSDe],
      });

      setStep("approved");
    } catch (error) {
      console.error("Approval error:", error);
      setError("Approval failed. Please try again.");
      setStep("initial");
    }
  };

  const handlePay = async () => {
    try {
      setError(null);
      setStep("paying");

      // Call deposit function on staking contract
      await makePayment({
        address: stakingContract,
        abi: [
          {
            inputs: [
              { internalType: "address", name: "to", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            name: "deposit",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "deposit",
        args: [process.env.NEXT_PUBLIC_DEPLOYER_WALLET as `0x${string}`, priceInUSDe],
      });

      setStep("paid");
      onPaymentComplete();
    } catch (error) {
      console.error("Payment error:", error);
      setError("Payment failed. Please try again.");
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
          {isPaying ? "Processing Payment..." : `Pay ${hotelPrice.toFixed(2)} USDe`}
        </button>
      )}

      {step === "paid" && <p className="text-sm text-green-600 mt-2">Payment successful!</p>}
    </div>
  );
};

export default BookingActions;
