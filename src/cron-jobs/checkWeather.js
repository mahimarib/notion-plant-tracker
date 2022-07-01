import moment from 'moment';
import { updateFrontPage } from '../notion-client/frontPage.js';
import {
    getPlantDate,
    getPlantsOutside,
    updateLastWatered,
} from '../notion-client/plantsTable.js';
import { WateringMethod } from '../notion-client/waterLog.js';
import { getWeather, isRaining } from '../weatherClient.js';

// runs every hour
const field = '0 0 * * * *';

async function jobToRun() {
    const weatherData = await getWeather();
    const minsOfRain = weatherData.minutely.filter(
        min => min.precipitation > 0
    ).length;
    if (isRaining(weatherData.current.weather.id) || minsOfRain >= 10) {
        const plants = await getPlantsOutside();
        plants.forEach(plant => {
            // if not watered today
            if (!moment(getPlantDate(plant)).isSame(moment(), 'day')) {
                updateLastWatered(plant.id, WateringMethod.Rain);
            }
        });
        updateFrontPage();
    }
}

export { field, jobToRun };
