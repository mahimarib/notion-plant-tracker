import moment from 'moment';
import { notion, plantsTable, limiter } from './notion.js';
import { addToLog, WateringMethod } from './waterLog.js';

async function getPlants() {
    const { results: plants } = await limiter.schedule(() =>
        notion.databases.query({
            database_id: plantsTable.id,
        })
    );
    // filtering out plants that are dead.
    return plants.filter(
        plant => plant.properties['Status'].select.name === 'Alive'
    );
}

function getPlantName(plantObj) {
    const [{ plain_text: name }] = plantObj.properties.Name.title;
    return name;
}

function getPlantDate(plantObj) {
    return plantObj.properties['Last Watered'].date.start;
}

/**
 * Returns a key value pair of the plant names and the id.
 * @returns {Object} key value pairs
 */
export async function getPlantsMap() {
    const plants = await getPlants();

    const map = plants.reduce((acc, plant) => {
        const name = getPlantName(plant);
        return {
            ...acc,
            [name]: plant.id,
        };
    }, {});
    return map;
}

export async function updateLastWatered(pageID) {
    const date = moment().format('YYYY-MM-DD');
    const plantPage = await limiter.schedule(() =>
        notion.pages.update({
            page_id: pageID,
            properties: {
                [plantsTable.dateID]: {
                    date: {
                        start: date,
                    },
                },
            },
        })
    );
    const plantName = getPlantName(plantPage);
    console.log(`edited: ${plantName}`);
    addToLog(plantPage.id, date, WateringMethod.WateringCan);
}

export async function getSchedule(ids) {
    const plants = (await getPlants()).filter(plant => ids.includes(plant.id));
    const data = plants.reduce((acc, plant) => {
        const name = getPlantName(plant);
        const interval = plant.properties['Watering Interval (days)'].number;
        return {
            ...acc,
            [interval]: acc[interval] ? [...acc[interval], name] : [name],
        };
    }, {});
    return data;
}

export async function getFrontPageSchedule() {
    const plants = (await getPlants()).filter(
        plant => plant.properties['Last Watered'].date
    );
    // sort oldest to newest
    plants.sort((a, b) => {
        const dateA = new Date(getPlantDate(a));
        const dateB = new Date(getPlantDate(b));
        return dateA - dateB;
    });
    const plantsDates = plants.reduce((map, plant) => {
        const date = getPlantDate(plant);
        if (map.has(date)) {
            map.set(date, [...map.get(date), plant.id]);
        } else {
            map.set(date, [plant.id]);
        }
        return map;
    }, new Map());
    return plantsDates;
}
