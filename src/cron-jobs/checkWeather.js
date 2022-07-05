import moment from 'moment';
import { updateFrontPage } from '../notion-client/frontPage.js';
import {
    getPlantDate,
    getPlantsOutside,
    updateLastWatered,
} from '../notion-client/plantsTable.js';
import { WateringMethod } from '../notion-client/waterLog.js';
import { getMinsOfRain, getWeather, isRaining } from '../weatherClient.js';

// runs every hour
const field = '0 * * * *';

async function jobToRun() {
    const weatherData = await getWeather();
    const minsOfRain = getMinsOfRain(weatherData);
    if (isRaining(weatherData) || minsOfRain >= 10) {
        const plants = await getPlantsOutside();
        plants.forEach(plant => {
            // if not watered today already
            if (!moment(getPlantDate(plant)).isSame(moment(), 'day')) {
                updateLastWatered(plant.id, WateringMethod.Rain);
            }
        });
        updateFrontPage();
    }
}

export { field, jobToRun };
