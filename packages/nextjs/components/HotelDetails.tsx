import { useState } from "react";

interface HotelDetailsProps {
  onPriceFetch: (name: string, price: number) => void;
}

const HotelDetails: React.FC<HotelDetailsProps> = ({ onPriceFetch }) => {
  const [loading, setLoading] = useState(false);

  const fetchHotelRates = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hotelRates");
      const data = await response.json();
      const hotelName = data.name;
      const roomRate = data.rate / 100; // Divide by 100 as instructed
      onPriceFetch(hotelName, roomRate);
    } catch (error) {
      console.error("Failed to fetch hotel rates:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center my-4">
      <button
        onClick={fetchHotelRates}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {loading ? "Loading..." : "Check Hotel Price"}
      </button>
    </div>
  );
};

export default HotelDetails;
