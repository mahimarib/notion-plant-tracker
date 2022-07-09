import moment from 'moment';
import { notion, plantsTable, limiter } from './notion.js';
import { addToLog } from './waterLog.js';

export async function getPlants() {
    const { results: plants } = await limiter.schedule(() =>
        notion.databases.query({
            database_id: plantsTable.id,
            // only getting plants that are alive
            filter: {
                property: plantsTable.status.id,
                select: {
                    equals: 'alive',
                },
            },
        })
    );
    return plants;
}

export async function getPlantsOutside() {
    const { results: plants } = await limiter.schedule(() =>
        notion.databases.query({
            database_id: plantsTable.id,
            filter: {
                and: [
                    {
                        property: plantsTable.status.id,
                        select: {
                            equals: 'alive',
                        },
                    },
                    {
                        property: plantsTable.location.id,
                        select: {
                            equals: 'backyard',
                        },
                    },
                ],
            },
        })
    );
    return plants;
}

export function getPlantName(plantObj) {
    const [{ plain_text: name }] = plantObj.properties.Name.title;
    return name;
}

export function getPlantDate(plantObj) {
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

export async function updateLastWatered(pageID, method) {
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
    addToLog(plantPage.id, date, method);
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
