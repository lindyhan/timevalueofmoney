"use client";

import { useState } from "react";
import BookingActions from "../components/BookingActions";
import ClaimBonus from "../components/ClaimBonus";
import ConnectWallet from "../components/ConnectWallet";
import { useAccount } from "wagmi";

export default function Home() {
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [hotelPrice, setHotelPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const { isConnected } = useAccount();

  const handlePriceFetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/hotelrates");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.name || !data.price) {
        throw new Error("Invalid data received from API");
      }

      const priceInUsDe = Number(data.price) / 100;

      setHotelName(data.name);
      setHotelPrice(priceInUsDe);
    } catch (error) {
      console.error("Error details:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch hotel data");
      setHotelName(null);
      setHotelPrice(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Hotel Booking</h1>

      <ConnectWallet />

      {isConnected && !hotelPrice && (
        <button
          onClick={handlePriceFetch}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors mt-4"
        >
          {isLoading ? "Loading..." : "Check Hotel Price"}
        </button>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg max-w-md">
          <p className="font-semibold">Error:</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {hotelName && hotelPrice !== null && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Hotel Name: {hotelName}</h2>
          <p className="text-xl mb-4">
            Room Rate: <span className="font-bold">{hotelPrice} USDe</span>
          </p>
          <BookingActions hotelPrice={hotelPrice} onPaymentComplete={() => setPaymentComplete(true)} />
        </div>
      )}

      {paymentComplete && hotelPrice !== null && (
        <div className="mt-8 w-full max-w-md">
          <ClaimBonus hotelPrice={hotelPrice} />
        </div>
      )}
    </div>
  );
}
