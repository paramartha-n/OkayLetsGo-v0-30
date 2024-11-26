import { GoogleGenerativeAI } from "@google/generative-ai";
import { format } from "date-fns";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function getIATACode(city: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    As an aviation expert, provide the IATA airport code for the main international airport serving ${city}.
    Only respond with the 3-letter IATA code in uppercase. If unsure, respond with "XXX".
    Example: For "New York" respond with "JFK" or for "London" respond with "LHR".
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const code = response.text().trim().toUpperCase();
    return code.length === 3 ? code : 'XXX';
  } catch (error) {
    console.error("Error getting IATA code:", error);
    return getCityCode(city);
  }
}

function getCityCode(city: string): string {
  return city.split(/[\s,]/)[0].replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
}

function formatDateForUrl(date: Date): string {
  return format(date, "yyyyMMdd");
}

function sanitizeJsonString(str: string): string {
  const match = str.match(/\{[\s\S]*\}/);
  return match ? match[0] : '';
}

export async function estimateFlightPrice(originCity: string, destinationCity: string, seasonality: string): Promise<{ min: number; max: number }> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    As a travel expert, estimate the typical price range in EUR for a round-trip flight from ${originCity} to ${destinationCity} during ${seasonality}.
    Consider factors like:
    - Distance between cities
    - Typical airline routes
    - Season (${seasonality})
    - Common price ranges for this route

    Respond with ONLY a JSON object in this exact format:
    {
      "minPrice": number,
      "maxPrice": number
    }

    Example: {"minPrice": 150, "maxPrice": 300}
    
    Be realistic but conservative in the estimation.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const priceData = JSON.parse(sanitizeJsonString(text));
    return {
      min: priceData.minPrice,
      max: priceData.maxPrice
    };
  } catch (error) {
    console.error("Error estimating flight price:", error);
    return { min: 150, max: 300 };
  }
}

async function getNearestMajorAirport(city: string): Promise<{ code: string; city: string }> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `What is the nearest major international airport to ${city}? 
  Return the response in this exact JSON format:
  {"code": "XXX", "city": "City Name"}
  For example, for Espoo it would be:
  {"code": "HEL", "city": "Helsinki"}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();
    const data = JSON.parse(sanitizeJsonString(text));
    
    // Validate that we got a proper response
    if (data.code && /^[A-Z]{3}$/.test(data.code) && data.city) {
      return data;
    }
    throw new Error("Invalid airport data format");
  } catch (error) {
    console.error("Error getting nearest major airport:", error);
    return { code: await getIATACode(city), city }; // Fallback to regular IATA code
  }
}

export async function generateFlightData(originCity: string, destinationCity: string, departDate: Date, returnDate: Date, flightPrices: { min: number; max: number }) {
  const [departFormatted, returnFormatted] = [departDate, returnDate].map(formatDateForUrl);
  const [originAirport, destIATA] = await Promise.all([
    getNearestMajorAirport(originCity),
    getIATACode(destinationCity)
  ]);
  
  const displayOrigin = originAirport
    ? `${originAirport.city} (${originAirport.code})`
    : originCity;

  return {
    outbound: {
      departure: displayOrigin,
      arrival: `${destinationCity} (${destIATA})`,
      duration: "Varies",
      airline: "Multiple Airlines",
      price: "Varies"
    },
    return: {
      departure: `${destinationCity} (${destIATA})`,
      arrival: displayOrigin,
      duration: "Varies",
      airline: "Multiple Airlines",
      price: "Varies"
    },
    totalPrice: {
      min: flightPrices.min,
      max: flightPrices.max
    },
    origin: {
      city: originCity,
      nearestAirport: originAirport
    },
    destination: {
      city: destinationCity,
      code: destIATA
    },
    skyscannerUrl: `https://www.skyscanner.com/transport/flights/${originAirport.code.toLowerCase()}/${destIATA.toLowerCase()}/${departFormatted}/${returnFormatted}/`
  };
}
