import fetch from 'node-fetch';

const API_KEY = process.env.OPEN_WEATHER_KEY;
const LAT = process.env.LAT;
const LONG = process.env.LONG;

const URL = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LONG}&exclude=hourly,daily,alerts&units=imperial&appid=${API_KEY}`;

export async function getWeather() {
    const res = await fetch(URL);
    const data = await res.json();
    console.log(data.current.weather[0].description);
    return data;
}

export function isRaining(id) {
    const firstDigitStr = String(id)[0];
    const num = Number(firstDigitStr);
    return [2, 3, 5].includes(num);
}
