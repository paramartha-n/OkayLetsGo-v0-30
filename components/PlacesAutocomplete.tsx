"use client";

import { useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useGooglePlaces } from '@/hooks/use-google-places';

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: () => void;
  placeholder: string;
  className?: string;
  autoFocus?: boolean;
  types?: string[];
  locationBias?: string;
}

export default function PlacesAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  className = "",
  autoFocus = false,
  types = ['(cities)'],
  locationBias
}: PlacesAutocompleteProps) {
  const { isLoaded } = useGooglePlaces();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types,
        fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.name) {
          onChange(place.name);
          onSelect?.();
        }
      });
    }
  }, [isLoaded, onChange, onSelect, types]);

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
          if (types.includes('lodging') && results[0].place_id) {
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