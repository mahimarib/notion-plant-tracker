import { notion, plantsTable, limiter } from './notion.js';
import { addToLog } from './waterLog.js';

async function getPlants() {
    const response = await limiter.schedule(() =>
        notion.databases.query({
            database_id: plantsTable.id,
        })
    );
    const plants = response.results;
    // filtering out plants that are dead.
    return plants.filter(
        plant => plant.properties['Status'].select.name === 'Alive'
    );
}

function getPlantName(plantObj) {
    const [{ plain_text: name }] = plantObj.properties.Name.title;
    return name;
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
    const [date] = new Date().toISOString().split('T');
    const response = await limiter.schedule(() =>
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
    const plantName = getPlantName(response);
    addToLog(response.id, date);
    console.log(`edited: ${plantName}`);
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
    plants.sort((a, b) => {
        const dateA = new Date(a.properties['Last Watered'].date.start);
        const dateB = new Date(b.properties['Last Watered'].date.start);
        return dateA - dateB;
    });
    const plantsDates = plants.reduce((map, plant) => {
        const date = plant.properties['Last Watered'].date.start;
        if (map.has(date)) {
            map.set(date, [...map.get(date), plant.id]);
        } else {
            map.set(date, [plant.id]);
        }
        return map;
    }, new Map());
    return plantsDates;
}
