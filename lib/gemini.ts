import { GoogleGenerativeAI } from "@google/generative-ai";
import { format } from "date-fns";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

async function getIATACode(city: string): Promise<string> {
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

function formatBookingDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function sanitizeJsonString(str: string): string {
  const match = str.match(/\{[\s\S]*\}/);
  return match ? match[0] : '';
}

async function estimateFlightPrice(originCity: string, destinationCity: string, seasonality: string): Promise<{ min: number; max: number }> {
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

function getPriceRangeFilter(type: string): string {
  switch (type) {
    case 'backpacker':
      return 'price%3DEUR-5-30-1';
    case 'budget':
      return 'price%3DEUR-30-80-1';
    case 'standard':
      return 'price%3DEUR-80-130-1';
    case 'comfort':
      return 'price%3DEUR-130-300-1';
    case 'first-class':
      return 'price%3DEUR-300-500-1';
    case 'luxury':
      return 'price%3DEUR-500-5000-1';
    default:
      return '';
  }
}

function generateHotelSearchUrl(city: string, checkIn: Date, checkOut: Date, hotelType: string): string {
  const priceFilter = getPriceRangeFilter(hotelType);
  const params = new URLSearchParams({
    ss: city,
    checkin: formatBookingDate(checkIn),
    checkout: formatBookingDate(checkOut),
    group_adults: '2',
    no_rooms: '1',
    order: 'review_score_and_price'
  });
  
  return `https://www.booking.com/searchresults.html?${params.toString()}&nflt=${priceFilter}%3Breview_score%3D80%3Bdistance%3D3000`;
}

function getPriceRangeForHotelType(type: string): string {
  switch (type) {
    case 'backpacker':
      return '€5-€30';
    case 'budget':
      return '€30-€80';
    case 'standard':
      return '€80-€130';
    case 'comfort':
      return '€130-€300';
    case 'first-class':
      return '€300-€500';
    case 'luxury':
      return '€500+';
    default:
      return '€50-€500';
  }
}

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

  const departDate = formatDateForUrl(tripData.dates.from);
  const returnDate = formatDateForUrl(tripData.dates.to);
  const season = getSeason(tripData.dates.from);
  
  const skyscannerUrl = `https://www.skyscanner.com/transport/flights/${originIATA.toLowerCase()}/${destinationIATA.toLowerCase()}/${departDate}/${returnDate}/?stops=!onePlusStops`;

  const numberOfDays = Math.ceil(
    (tripData.dates.to.getTime() - tripData.dates.from.getTime()) / (1000 * 60 * 60 * 24)
  );

  const flightPrices = await estimateFlightPrice(tripData.originCity, tripData.city, season);

  const defaultFlightData = {
    outbound: {
      departure: "Flexible",
      arrival: "Flexible",
      duration: "Varies",
      airline: "Multiple Airlines",
      price: "Varies"
    },
    return: {
      departure: "Flexible",
      arrival: "Flexible",
      duration: "Varies",
      airline: "Multiple Airlines",
      price: "Varies"
    },
    totalPrice: {
      min: flightPrices.min,
      max: flightPrices.max
    },
    skyscannerUrl,
    hotel: {
      name: "Check Booking.com",
      rating: "N/A",
      pricePerNight: "Varies",
      distanceFromCenter: "Various options",
      bookingUrl: generateHotelSearchUrl(tripData.city, tripData.dates.from, tripData.dates.to, tripData.hotel.type)
    }
  };

  const prompt = `
    Create a ${numberOfDays}-day itinerary for ${tripData.city}. Include activities based on these preferences:
    - Activities: ${tripData.activities.join(", ")}
    - Dining: ${tripData.restaurants.join(", ")}
    - Special requests: ${tripData.preferences}

    Format the response exactly like this example:

    Day 1:
    Morning Activity: Eiffel Tower
    Duration: 2 hours
    Description: Iconic symbol of Paris, offering breathtaking city views. Best visited early morning to avoid crowds. Features three levels with observation decks and restaurants.
    Lunch: Le Chateaubriand Restaurant
    Description: Modern French bistro with innovative cuisine. Known for its creative tasting menus and intimate atmosphere. Michelin-starred dining experience.
    Recommended Dish: Aged Beef Tartare - Prepared with smoked eel and horseradish cream, this signature dish perfectly represents the restaurant's innovative approach to French cuisine.
    Afternoon Activity: Luxembourg Gardens
    Duration: 1.5 hours
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
    - Start each day with "Day X:"
    - Label each line as shown in the example
    - For activities (not restaurants), include "Duration:" line with estimated visit time in hours
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

    return {
      flights: defaultFlightData,
      content: content || "Unable to generate itinerary content. Please try again."
    };
  } catch (error) {
    console.error("Error generating itinerary:", error);
    return {
      flights: defaultFlightData,
      content: "Sorry, we couldn't generate your itinerary at this time. Please try again later."
    };
  }
}