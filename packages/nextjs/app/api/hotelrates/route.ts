import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiUrl = "https://api.mockapi.com/hotelrates";
    console.log("Attempting to fetch from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-api-key": "16f888a524c845588236c91822da592e",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    console.log("API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error response:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch hotel rates: ${response.status} ${response.statusText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log("API Response data:", data);

    // Map the API response fields to match the expected structure
    if (!data.hotelname || !data.price) {
      console.error("Invalid data structure:", data);
      return NextResponse.json({ error: "Invalid data structure received from API" }, { status: 500 });
    }

    return NextResponse.json({
      name: data.hotelname, // Map `hotelname` to `name`
      price: parseFloat(data.price), // Convert price to a number
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch hotel rates" },
      { status: 500 },
    );
  }
}
