// hooks/useLocationService.ts
import { useState, useCallback } from 'react';
import _ from 'lodash';

export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

export interface City {
  name: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface AddressDetails {
  street: string;
  city: string;
  display_name: string;
}

export interface StreetSuggestion {
  street: string;
  city: string;
}

export const useLocationService = () => {
  // Cache results for better performance
  const [cityCache, setCityCache] = useState<Record<string, City[]>>({});
  const [streetCache, setStreetCache] = useState<Record<string, StreetSuggestion[]>>({});

  const getCoordinates = useCallback(async (address: string): Promise<GeocodingResult | null> => {
    try {
      const query = encodeURIComponent(`${address}, Israel`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        { headers: { 'User-Agent': 'ManivPC Contact Form' }}
      );
      const data = await response.json();
      
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          display_name: data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }, []);

  const getCities = useCallback(async () => {
    try {
      if (Object.keys(cityCache).length > 0) {
        return Object.values(cityCache).flat();
      }

      const response = await fetch('https://data.gov.il/api/3/action/datastore_search?resource_id=5c78e9fa-c2e2-4771-93ff-7f400a12f7ba&limit=1500');
      const data = await response.json();
      
      const cities = data.result.records.map((record: any) => ({
        name: record['שם_ישוב'],
        coordinates: {
          lat: record['Y_קואורדינטת'],
          lon: record['X_קואורדינטת']
        }
      }));

      const cacheByFirstLetter = _.groupBy(cities, city => city.name.charAt(0));
      setCityCache(cacheByFirstLetter);
      
      return cities;
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      return [];
    }
  }, [cityCache]);

  const searchStreets = useCallback(async (query: string, cityName: string): Promise<StreetSuggestion[]> => {
    try {
      const cacheKey = `${cityName}-${query}`;
      if (streetCache[cacheKey]) {
        return streetCache[cacheKey];
      }
  
      const searchQuery = encodeURIComponent(`${query}, ${cityName}, ישראל`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${searchQuery}&format=json&addressdetails=1&limit=10&accept-language=he`,
        { 
          headers: { 
            'User-Agent': 'ManivPC Contact Form',
            'Accept-Language': 'he'
          }
        }
      );
      const data: Array<{address: {road?: string, pedestrian?: string}}> = await response.json();
      
      const streets = data
        .filter(item => item.address?.road || item.address?.pedestrian)
        .map(item => (item.address?.road || item.address?.pedestrian) as string);
      
      const uniqueStreets = Array.from(new Set(streets));
      const results: StreetSuggestion[] = uniqueStreets.map(street => ({
        street,
        city: cityName
      }));
  
      if (results.length > 0) {
        setStreetCache(prev => ({
          ...prev,
          [cacheKey]: results
        }));
        return results;
      }
  
      return [];
    } catch (error) {
      console.error('Street search error:', error);
      return [];
    }
  }, [streetCache]);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const calculateLocationCost = useCallback((coords: GeocodingResult | null, deliveryType: 'pickup' | 'build_at_home' | 'shipping'): number => {
    if (deliveryType === 'pickup' || !coords) return 0;
    
    const RAMAT_HASHARON = { lat: 32.1467, lon: 34.8397 };
    const distance = calculateDistance(
      RAMAT_HASHARON.lat,
      RAMAT_HASHARON.lon,
      coords.lat,
      coords.lon
    );
  
    const costPerKm = deliveryType === 'build_at_home' ? 3 : 4;
    return Math.max(50, distance * costPerKm);
  }, [calculateDistance]);

  return {
    getCoordinates,
    getCities,
    searchStreets,
    calculateLocationCost
  };
};

export default useLocationService;