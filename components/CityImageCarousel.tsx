"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface CityImageCarouselProps {
  city: string;
}

interface PlacePhoto {
  url: string;
  attribution: string;
}

export function CityImageCarousel({ city }: CityImageCarouselProps) {
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCityPhotos = useCallback(async () => {
    if (!window.google?.maps) {
      console.error('Google Maps not loaded');
      return;
    }

    try {
      setLoading(true);
      const service = new google.maps.places.PlacesService(document.createElement('div'));

      const searchRequest: google.maps.places.TextSearchRequest = {
        query: `${city} landmarks tourist attractions popular sights`,
        type: 'tourist_attraction'
      };

      service.textSearch(searchRequest, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const allPhotos: PlacePhoto[] = [];
          
          // Get first photo from each place until we have 10
          results.slice(0, 10).forEach(place => {
            if (place.photos && place.photos[0]) {
              const photo = place.photos[0];
              allPhotos.push({
                url: photo.getUrl({ maxWidth: 1920, maxHeight: 1080 }),
                attribution: photo.html_attributions[0] || ''
              });
            }
          });

          // If we have less than 10 photos, make additional queries
          if (allPhotos.length < 10) {
            const additionalQueries = [
              `${city} city center plaza square`,
              `${city} architecture buildings`,
              `${city} parks gardens nature`
            ];

            let queryIndex = 0;
            const fetchMore = () => {
              if (queryIndex < additionalQueries.length && allPhotos.length < 10) {
                service.textSearch({
                  query: additionalQueries[queryIndex],
                  type: 'tourist_attraction'
                }, (moreResults, moreStatus) => {
                  if (moreStatus === google.maps.places.PlacesServiceStatus.OK && moreResults) {
                    moreResults.forEach(place => {
                      if (allPhotos.length < 10 && place.photos && place.photos[0]) {
                        const photo = place.photos[0];
                        allPhotos.push({
                          url: photo.getUrl({ maxWidth: 1920, maxHeight: 1080 }),
                          attribution: photo.html_attributions[0] || ''
                        });
                      }
                    });
                  }
                  queryIndex++;
                  if (allPhotos.length < 10 && queryIndex < additionalQueries.length) {
                    fetchMore();
                  } else {
                    setPhotos(allPhotos);
                    setLoading(false);
                  }
                });
              } else {
                setPhotos(allPhotos);
                setLoading(false);
              }
            };
            fetchMore();
          } else {
            setPhotos(allPhotos.slice(0, 10));
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error fetching photos:', error);
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    if (city) {
      fetchCityPhotos();
    }
  }, [city, fetchCityPhotos]);

  useEffect(() => {
    if (photos.length > 0) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [photos.length]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2))`,
          backgroundColor: 'rgb(var(--muted))'
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0">
      {photos.map((photo, index) => (
        <div
          key={photo.url}
          className="absolute inset-0 w-full h-full transition-opacity duration-1000"
          style={{
            opacity: index === currentPhotoIndex ? 1 : 0,
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.2)), url(${photo.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}
    </div>
  );
}