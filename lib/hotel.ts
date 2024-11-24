import { format } from "date-fns";

function formatBookingDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
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

export function generateHotelSearchUrl(city: string, checkIn: Date, checkOut: Date, hotelType: string): string {
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

export function getPriceRangeForHotelType(type: string): string {
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

export function generateHotelData(city: string, checkIn: Date, checkOut: Date, hotelType: string) {
  return {
    name: "Check Booking.com",
    rating: "N/A",
    pricePerNight: getPriceRangeForHotelType(hotelType),
    distanceFromCenter: "Various options",
    bookingUrl: generateHotelSearchUrl(city, checkIn, checkOut, hotelType)
  };
}
