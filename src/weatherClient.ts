import fetch from 'node-fetch';

const API_KEY = process.env.OPEN_WEATHER_KEY;
const LAT = process.env.LAT;
const LONG = process.env.LONG;

const URL = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LONG}&exclude=hourly,daily,alerts&units=imperial&appid=${API_KEY}`;


interface WeatherData {
    current: {
        weather: Array<{
            id: number,
            main: string,
            description: string,
            icon: string
        }>,
        [key: string]: any
    },
    minutely: Array<{
        dt: number,
        precipitation: number
    }>
}

export async function getWeather(): Promise<WeatherData> {
    const res = await fetch(URL);
    const data = await res.json() as WeatherData;
    console.log(data.current.weather[0].description);
    return data;
}

export function getMinsOfRain(data: WeatherData, percent = 0.15) {
    return data.minutely.filter(
        // precipitation more than 15%
        min => min.precipitation > percent
    ).length;
}

export function isRaining(data: WeatherData) {
    const id = data.current.weather[0].id;
    const firstDigitStr = String(id)[0];
    const num = Number(firstDigitStr);
    return [2, 3, 5].includes(num);
}

export function getMaxPrecipitation(data: WeatherData) {
    const values = data.minutely.map(m => m.precipitation);
    return Math.max(...values);
}