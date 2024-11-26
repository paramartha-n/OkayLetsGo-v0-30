"use client";

import { useEffect, useRef, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useGooglePlaces } from '@/hooks/use-google-places';
import debounce from 'lodash.debounce';

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: () => void;
  placeholder: string;
  className?: string;
  autoFocus?: boolean;
  types?: google.maps.places.AutocompletePrediction['types'][];
  locationBias?: string;
}

export default function PlacesAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  className = "",
  autoFocus = false,
  types = [['(cities)']],
  locationBias
}: PlacesAutocompleteProps) {
  const { isLoaded } = useGooglePlaces();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const countryCache = useRef<Map<string, string>>(new Map());
  const lastPredictions = useRef<string[]>([]);
  const mountedRef = useRef<boolean>(false);

  // Function to get predictions with place IDs
  const getPredictions = (input: string): Promise<google.maps.places.AutocompletePrediction[]> => {
    return new Promise((resolve) => {
      if (!sessionToken.current) {
        sessionToken.current = new google.maps.places.AutocompleteSessionToken();
      }

      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input,
          types: types.flat(),
          sessionToken: sessionToken.current,
        },
        (predictions) => {
          resolve(predictions || []);
        }
      );
    });
  };

  // Function to get country code from place details with caching
  const getCountryCode = async (placeId: string): Promise<string> => {
    // Check cache first
    if (countryCache.current.has(placeId)) {
      return countryCache.current.get(placeId)!;
    }

    return new Promise((resolve) => {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails(
        {
          placeId,
          fields: ['address_components'],
          sessionToken: sessionToken.current,
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place?.address_components) {
            const country = place.address_components.find(
              component => component.types.includes('country')
            );
            const countryCode = country?.short_name?.toLowerCase() || '';
            // Cache the result
            countryCache.current.set(placeId, countryCode);
            resolve(countryCode);
          } else {
            resolve('');
          }
        }
      );
    });
  };

  // Function to add country flags to predictions
  const addCountryFlagsToPredictions = async () => {
    const input = inputRef.current?.value || '';
    if (!input || !mountedRef.current) return;

    const predictions = await getPredictions(input);
    const pacContainer = document.querySelector('.pac-container:last-of-type');
    if (!pacContainer) return;

    const pacItems = pacContainer.querySelectorAll('.pac-item');
    if (pacItems.length === 0) return;

    // Fetch all country codes in parallel
    const countryCodePromises = predictions.map(prediction => 
      prediction.place_id ? getCountryCode(prediction.place_id) : Promise.resolve('')
    );
    
    const countryCodes = await Promise.all(countryCodePromises);

    // Update DOM all at once
    pacItems.forEach((item, i) => {
      const countryCode = countryCodes[i];
      if (!countryCode) return;

      // Remove existing elements
      const existingIcon = item.querySelector('.pac-icon');
      const existingFlag = item.querySelector('.pac-flag-icon');
      if (existingIcon) existingIcon.remove();
      if (existingFlag) existingFlag.remove();

      // Create and add the flag
      const flagSpan = document.createElement('span');
      flagSpan.className = 'pac-flag-icon';
      flagSpan.style.cssText = `
        display: inline-block;
        width: 24px;
        height: 18px;
        margin-right: 8px;
        vertical-align: middle;
        background-image: url(https://flagcdn.com/24x18/${countryCode}.png);
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      `;
      item.insertBefore(flagSpan, item.firstChild);
    });
  };

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      mountedRef.current = true;

      // Add CSS to hide default Google Places icon and adjust padding
      const style = document.createElement('style');
      style.textContent = `
        .pac-icon {
          display: none !important;
        }
        .pac-item {
          padding: 8px !important;
          display: flex !important;
          align-items: center !important;
        }
        .pac-item:hover {
          cursor: pointer;
        }
        .pac-item > span:first-child {
          order: -1;
        }
      `;
      document.head.appendChild(style);

      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: types.flat(),
        fields: ['formatted_address', 'geometry', 'name', 'place_id', 'address_components'],
      });

      // Create a MutationObserver to watch for changes in the DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if ((node as Element).classList?.contains('pac-container')) {
              addCountryFlagsToPredictions();
            }
          });
        });
      });

      // Start observing the document with the configured parameters
      observer.observe(document.body, { childList: true, subtree: true });

      // Add input event listener to handle flag updates
      const handleInput = debounce(() => {
        if (inputRef.current?.value) {
          addCountryFlagsToPredictions();
        }
      }, 150);

      inputRef.current.addEventListener('input', handleInput);

      // Add focus listener to update flags when input is focused
      inputRef.current.addEventListener('focus', () => {
        if (inputRef.current?.value) {
          addCountryFlagsToPredictions();
        }
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.name || place?.formatted_address) {
          onChange(place.name || place.formatted_address || '');
          if (onSelect) {
            // Add a small delay to ensure the value is updated before advancing
            setTimeout(onSelect, 100);
          }
        }
      });
    }
  }, [isLoaded, onChange, onSelect]);

  useEffect(() => {
    if (locationBias && autocompleteRef.current) {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      const request: google.maps.places.FindPlaceFromQueryRequest = {
        query: locationBias,
        fields: ['place_id', 'geometry']
      };

      service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results?.[0]?.geometry?.location) {
          const location = results[0].geometry.location;
          
          // Create bounds that cover a reasonable area around the location
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(new google.maps.LatLng(
            location.lat() - 0.1, // Approximately 11km south
            location.lng() - 0.1  // Approximately 11km west
          ));
          bounds.extend(new google.maps.LatLng(
            location.lat() + 0.1, // Approximately 11km north
            location.lng() + 0.1  // Approximately 11km east
          ));

          // Apply the bounds and location bias
          autocompleteRef.current?.setBounds(bounds);
          
          // If searching for lodging, also restrict to the country level
          if (types.flat().includes('lodging') && results[0].place_id) {
            const detailsRequest: google.maps.places.PlaceDetailsRequest = {
              placeId: results[0].place_id,
              fields: ['address_components']
            };

            service.getDetails(detailsRequest, (place, detailsStatus) => {
              if (detailsStatus === google.maps.places.PlacesServiceStatus.OK && place?.address_components) {
                const country = place.address_components.find(
                  component => component.types.includes('country')
                );
                if (country?.short_name) {
                  autocompleteRef.current?.setComponentRestrictions({
                    country: country.short_name
                  });
                }
              }
            });
          }
        }
      });
    }
  }, [locationBias, types]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-10 ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
}