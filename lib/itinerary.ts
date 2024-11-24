import { GoogleGenerativeAI } from "@google/generative-ai";
import { getIATACode, estimateFlightPrice, generateFlightData } from "./flight";
import { generateHotelData } from "./hotel";

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

  const flightData = generateFlightData(
    originIATA,
    destinationIATA,
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

  const prompt = `
    Create a ${numberOfDays}-day itinerary for ${tripData.city}. Include activities based on these preferences:
    - Activities: ${tripData.activities.join(", ")}
    - Dining: ${tripData.restaurants.join(", ")}
    - Special requests: ${tripData.preferences}

    Format the response exactly like this example:

    Day 1:
    Morning Activity: Eiffel Tower
    Duration: 2 hours
    Price: €26.10
    Description: Iconic symbol of Paris, offering breathtaking city views. Best visited early morning to avoid crowds. Features three levels with observation decks and restaurants.
    Lunch: Le Chateaubriand Restaurant
    Description: Modern French bistro with innovative cuisine. Known for its creative tasting menus and intimate atmosphere. Michelin-starred dining experience.
    Recommended Dish: Aged Beef Tartare - Prepared with smoked eel and horseradish cream, this signature dish perfectly represents the restaurant's innovative approach to French cuisine.
    Afternoon Activity: Luxembourg Gardens
    Duration: 1.5 hours
    Price: Free
    Description: Historic park with French and English gardens. Perfect for relaxation with fountains and statues. Home to the Luxembourg Palace and various art exhibitions.
    Dinner: L'Ami Louis
    Description: Classic Parisian bistro famous for its roast chicken. Rustic atmosphere with traditional French service. Popular among locals and celebrities alike.
    Recommended Dish: Roast Chicken - Perfectly roasted with garlic and herbs, served with their legendary pommes frites. A timeless classic that made this restaurant world-famous.

    Important:
    - Include a 2-3 sentence description for each place
    - Keep descriptions informative but concise
    - Focus on unique features and what makes each place special
    - Include practical tips where relevant
    - Exactly 2 activities per day
    - Exactly 2 restaurants per day (lunch and dinner)
    - For restaurants, include a "Recommended Dish" line with the dish name followed by a dash and its description
    - Only recommend restaurants with Google ratings of 4.0 or higher, and with over 1,000 reviews
    - For activities (not restaurants), include:
      * "Duration:" line with estimated visit time in hours
      * "Price:" line with entrance fee in local currency (use "Free" if no entrance fee)
    - Start each day with "Day X:"
    - Label each line as shown in the example
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

    return {
      flights: {
        ...flightData,
        hotel: hotelData
      },
      content: content || "Unable to generate itinerary content. Please try again."
    };
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return {
      flights: {
        ...flightData,
        hotel: hotelData
      },
      content: "Sorry, we couldn't generate your itinerary at this time. Please try again later."
    };
  }
}
