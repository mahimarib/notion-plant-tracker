import moment from 'moment';
import { CronJob } from '../index.js';
import { updateFrontPage } from '../notion-client/frontPage.js';
import {
    getPlantDate,
    getPlantsOutside,
    Page,
    updateLastWatered,
} from '../notion-client/plantsTable.js';
import { WateringMethod } from '../notion-client/waterLog.js';
import { getMinsOfRain, getWeather, isRaining } from '../weatherClient.js';

export const job: CronJob = {
    // runs every hour
    field: '0 * * * *',
    run: async () => {
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
    }
}
