import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
  description: '특정 위치의 현재 날씨를 가져옵니다.',
  inputSchema: z.object({
    latitude: z.number().describe('위도'),
    longitude: z.number().describe('경도'),
  }),
  execute: async ({ latitude, longitude }) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
    );

    const weatherData = await response.json();
    return weatherData;
  },
});
