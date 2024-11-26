"use client";

import { useEffect, useState } from 'react';

const cities = [
"Paris, France",
"Tokyo, Japan",
"New York, USA",
"Rome, Italy",
"Barcelona, Spain",
"Sydney, Australia",
"Dubai, UAE",
"London, UK",
"Rio de Janeiro, Brazil",
"Amsterdam, Netherlands",
"Bangkok, Thailand",
"Venice, Italy",
"Kyoto, Japan",
"Istanbul, Turkey",
"Santorini, Greece",
"Prague, Czech Republic",
"Singapore, Singapore",
"Los Angeles, USA",
"Florence, Italy",
"Hong Kong, China",
"Seoul, South Korea",
"Bali, Indonesia",
"Cairo, Egypt",
"Munich, Germany",
"Marrakech, Morocco",
"Las Vegas, USA",
"Buenos Aires, Argentina",
"Mexico City, Mexico",
"Berlin, Germany",
"Vienna, Austria",
"Lisbon, Portugal",
"Edinburgh, Scotland",
"Budapest, Hungary",
"Shanghai, China",
"Milan, Italy",
"Capetown, South Africa",
"Phuket, Thailand",
"Antalya, Turkey",
"Bruges, Belgium",
"San Francisco, USA",
"Chiang Mai, Thailand",
"Reykjavik, Iceland",
"Petra, Jordan",
"Manila, Philippines",
"Kuala Lumpur, Malaysia",
"Hanoi, Vietnam",
"Vancouver, Canada",
"Dublin, Ireland",
"Galápagos Islands, Ecuador",
"Montreal, Canada",
"Osaka, Japan",
"Seville, Spain",
"Copenhagen, Denmark",
"Moscow, Russia",
"Naples, Italy",
"Auckland, New Zealand",
"Lima, Peru",
"Zanzibar, Tanzania",
"Ho Chi Minh City, Vietnam",
"Cartagena, Colombia",
"Dubrovnik, Croatia",
"Brisbane, Australia",
"Nice, France",
"Stockholm, Sweden",
"Quebec City, Canada",
"Salzburg, Austria",
"Jakarta, Indonesia",
"Chengdu, China",
"Maldives, Maldives",
"Granada, Spain",
"Luang Prabang, Laos",
"Kraków, Poland",
"Machu Picchu, Peru",
"Kathmandu, Nepal",
"New Orleans, USA",
"Tehran, Iran",
"Jaipur, India",
"Sapporo, Japan",
"Bogotá, Colombia",
"Santiago, Chile",
"Bordeaux, France",
"Havana, Cuba",
"Fes, Morocco",
"Luxor, Egypt",
"Ulaanbaatar, Mongolia",
"Split, Croatia",
"Giza, Egypt",
"Belgrade, Serbia",
"Victoria Falls, Zambia/Zimbabwe",
"Canberra, Australia",
"Yogyakarta, Indonesia",
"Bergen, Norway",
"Palawan, Philippines",
"Rotorua, New Zealand",
"Cusco, Peru",
"Siem Reap, Cambodia",
"Agra, India",
"Chichén Itzá, Mexico",
"Rio de Janeiro, Brazil",
"Beijing, China",
"Amman, Jordan",
"Delhi, India",
"Mexico City, Mexico",
"Athens, Greece",
"Cairo, Egypt",
"Xi'an, China",
"Florence, Italy"
];

interface AnimatedPlaceholderProps {
  isTyping: boolean;
}

export function AnimatedPlaceholder({ isTyping }: AnimatedPlaceholderProps) {
  const [currentCity, setCurrentCity] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [cityIndex, setCityIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [randomizedCities, setRandomizedCities] = useState<string[]>([]);

  // Initialize randomized cities on first render
  useEffect(() => {
    const shuffledCities = [...cities].sort(() => Math.random() - 0.5);
    setRandomizedCities(shuffledCities);
  }, []);

  useEffect(() => {
    if (isTyping) {
      setCurrentCity('');
      return;
    }

    const typingSpeed = isDeleting ? 10 : 25; // Even faster typing and super fast deleting
    const currentCityText = randomizedCities[cityIndex];

    // If we don't have randomized cities yet, don't proceed
    if (!currentCityText) return;

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setCurrentCity(currentCityText.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
        
        if (charIndex === 0) {
          setIsDeleting(false);
          // When moving to next city, re-randomize remaining cities
          if (cityIndex === randomizedCities.length - 1) {
            const newShuffledCities = [...cities].sort(() => Math.random() - 0.5);
            setRandomizedCities(newShuffledCities);
            setCityIndex(0);
          } else {
            setCityIndex(prev => prev + 1);
          }
        }
      } else {
        setCurrentCity(currentCityText.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);

        if (charIndex === currentCityText.length) {
          setTimeout(() => {
            setIsDeleting(true);
          }, 1000); // Reduced wait time to 1 second
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, cityIndex, isDeleting, isTyping, randomizedCities]);

  return currentCity;
}
