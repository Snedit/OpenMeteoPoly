import axios from 'axios';
import { format } from 'date-fns';
const requestCache = new Map<string, number>();
const RATE_LIMIT_MS = 30 * 60 * 1000; 

export interface WeatherData {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
  };
}

export async function fetchWeatherData(
  lat: number,
  lng: number,
  startDate: Date,
  endDate: Date
): Promise<WeatherData> {
  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');

  const key = `${lat},${lng},${start},${end}`;
  const now = Date.now();

  const lastRequest = requestCache.get(key);
  if (lastRequest && now - lastRequest < RATE_LIMIT_MS) {
    throw new Error('Rate limit exceeded. Try again later.');
  }

  requestCache.set(key, now);

  try {
    const response = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
      params: {
        latitude: lat,
        longitude: lng,
        start_date: start,
        end_date: end,
        hourly: 'temperature_2m,relative_humidity_2m',
        timezone: 'auto',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}


export function getPolygonCentroid(coordinates: [number, number][]): [number, number] {
  let x = 0;
  let y = 0;
  for (const [lng, lat] of coordinates) {
    x += lng;
    y += lat;
  }
  return [x / coordinates.length, y / coordinates.length];
}

export function getValueForTime(data: WeatherData, field: keyof WeatherData['hourly'], targetTime: Date): number | null {
  const targetHour = format(targetTime, "yyyy-MM-dd'T'HH:00");
  const hourlyData = data.hourly[field] as number[];
  const timeIndex = data.hourly.time.findIndex(time => time === targetHour);
  
  if (timeIndex === -1 || !hourlyData[timeIndex]) {
    return null;
  }
  
  return hourlyData[timeIndex];
}

export function getAverageValueForTimeRange(
  data: WeatherData, 
  field: keyof WeatherData['hourly'], 
  startTime: Date, 
  endTime: Date
): number | null {
  const hourlyData = data.hourly[field] as number[];
  const values: number[] = [];
  
  data.hourly.time.forEach((time, index) => {
    const timeDate = new Date(time);
    if (timeDate >= startTime && timeDate <= endTime && hourlyData[index] != null) {
      values.push(hourlyData[index]);
    }
  });
  
  if (values.length === 0) return null;
  
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}