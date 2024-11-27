import { GoogleGenerativeAI } from "@google/generative-ai";
import { getIATACode, estimateFlightPrice, generateFlightData } from "./flight";
import { generateHotelData } from "./hotel";
import { getCurrencyFromCity } from "./currency";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

function getSeason(date: Date): string {
  const month = date.getMonth();
  if (month >= 11 || month <= 1) return "winter";
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  return "autumn";
}

export async function generateItinerary(tripData: any) {
  if (!tripData.dates.from || !tripData.dates.to || !tripData.city || !tripData.originCity) {
    throw new Error("Missing required trip data");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const [originIATA, destinationIATA] = await Promise.all([
    getIATACode(tripData.originCity),
    getIATACode(tripData.city)
  ]);

  const season = getSeason(tripData.dates.from);
  const flightPrices = await estimateFlightPrice(tripData.originCity, tripData.city, season);

  const numberOfDays = Math.ceil(
    (tripData.dates.to.getTime() - tripData.dates.from.getTime()) / (1000 * 60 * 60 * 24)
  );

  const localCurrency = getCurrencyFromCity(tripData.city);

  const flightData = await generateFlightData(
    tripData.originCity,
    tripData.city,
    tripData.dates.from,
    tripData.dates.to,
    flightPrices
  );

  const hotelData = generateHotelData(
    tripData.city,
    tripData.dates.from,
    tripData.dates.to,
    tripData.hotel.type
  );

  const prompt = `\nCreate a ${numberOfDays}-day itinerary for ${tripData.city}. Include activities based on these preferences:
- Activities: ${tripData.activities.join(", ")}
- Dining: ${tripData.restaurants.join(", ")}
- Special requests: ${tripData.preferences}

For each day, follow this EXACT format:

Day 1:
Morning Activity: [Name of Activity]
Duration: [Duration in hours]
Price: [Price in ${localCurrency}, e.g., "1500 ${localCurrency}" or "Free"]
Description: [2-3 sentences about the place]

Lunch: [Restaurant Name]
Description: [2-3 sentences about the restaurant]
Recommended Dish: [Dish Name] - [Brief description of the dish]

Afternoon Activity: [Name of Activity]
Duration: [Duration in hours]
Price: [Price in ${localCurrency}, e.g., "1500 ${localCurrency}" or "Free"]
Description: [2-3 sentences about the place]

Dinner: [Restaurant Name]
Description: [2-3 sentences about the restaurant]
Recommended Dish: [Dish Name] - [Brief description of the dish]

[Repeat this format for each day]

Important formatting rules:
1. Always include ALL fields (Morning Activity, Duration, Price, Description, etc.)
2. Always include the dash (-) between dish name and description
3. Keep descriptions informative but concise
4. Use exact labels: "Morning Activity:", "Duration:", "Price:", etc.
5. For restaurants, always include a recommended dish
6. For activities, always specify duration and price
7. For prices, show only the local currency amount (${localCurrency})
8. Use proper line breaks between sections
`;

  let retryCount = 0;
  const maxRetries = 3;
  const retryDelay = 3000; // 3 seconds

  while (retryCount < maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().trim();

      // Basic validation: check if the content has days and some key required fields
      if (content.includes("Day 1:") && 
          content.includes("Morning Activity:") && 
          content.includes("Duration:") &&
          content.includes("Price:") &&
          content.includes("Description:") &&
          content.includes("Recommended Dish:")) {
        return {
          flights: {
            ...flightData,
            hotel: hotelData
          },
          content: content
        };
      }

      // If validation fails, throw error to trigger retry
      throw new Error("Generated content did not match required format");
    } catch (error) {
      console.error(`Attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // If all retries fail, return a more helpful error message
      return {
        flights: {
          ...flightData,
          hotel: hotelData
        },
        content: "We're having trouble creating your perfect itinerary right now. Please try again in a few moments."
      };
    }
  }

  // Fallback return in case of unexpected loop exit
  return {
    flights: {
      ...flightData,
      hotel: hotelData
    },
    content: "Unable to generate itinerary. Please try again."
  };
}
