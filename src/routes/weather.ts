import { Router } from 'express';
import moment from 'moment';
import { updateFrontPage } from '../notion-client/frontPage.js';
import {
    getPlantDate,
    getPlantsOutside,
    Page,
    updateLastWatered,
} from '../notion-client/plantsTable.js';
import { WateringMethod } from '../notion-client/waterLog.js';
import {
    getMaxPrecipitation,
    getMinsOfRain,
    getWeather,
    isRaining,
} from '../weatherClient.js';

const router = Router();

router.get('/', async (_req, res) => {
    const weatherData = await getWeather();
    const data = {
        ...weatherData.current,
        minsOfRain: getMinsOfRain(weatherData),
        isRaining: isRaining(weatherData),
        precipOverZero: getMinsOfRain(weatherData, 0),
        maxPrecip: getMaxPrecipitation(weatherData),
    };
    res.status(200).json(data);
});

router.post('/update', async (_req, res) => {
    const weatherData = await getWeather();
    const minsOfRain = getMinsOfRain(weatherData);
    if (isRaining(weatherData) || minsOfRain >= 10) {
        const plants = await getPlantsOutside() as Page[];
        plants.forEach(plant => {
            // if not watered today already
            if (!moment(getPlantDate(plant)).isSame(moment(), 'day')) {
                updateLastWatered(plant.id, WateringMethod.Rain);
            }
        });
        updateFrontPage();
    }
    res.status(200).json({
        ...weatherData.current,
        minsOfRain,
        isRaining: isRaining(weatherData),
        precipOverZero: getMinsOfRain(weatherData, 0),
        maxPrecip: getMaxPrecipitation(weatherData),
    });
});

export { router as weather };
