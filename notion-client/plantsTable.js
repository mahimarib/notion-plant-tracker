import { notion, plantsTable, limiter } from './notion.js';
import { addToLog } from './waterLog.js';

async function getPlants() {
    const response = await limiter.schedule(() =>
        notion.databases.query({
            database_id: plantsTable.id,
        })
    );
    return response.results;
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
    let map = {};
    const plants = await getPlants();
    plants.forEach(plant => {
        const name = getPlantName(plant);
        map = {
            ...map,
            [name]: plant.id,
        };
    });
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
    await addToLog(response.id, date);
    console.log(`edited: ${plantName}`);
}

export async function getSchedule(ids) {
    const plants = (await getPlants()).filter(plant => ids.includes(plant.id));
    const data = {};
    plants.forEach(plant => {
        const name = getPlantName(plant);
        const interval = plant.properties['Watering Interval (days)'].number;
        data[interval] = data[interval] ? [...data[interval], name] : [name];
    });
    return data;
}

export async function getFrontPageSchedule() {
    const plants = (await getPlants()).filter(
        plant => plant.properties['Last Watered'].date
    );
    plants.sort((a, b) => {
        const dateA = a.properties['Last Watered'].date.start;
        const dateB = b.properties['Last Watered'].date.start;
        if (dateA < dateB) return -1;
        else if (dateA > dateB) return 1;
        else return 0;
    });
    const plantsDates = new Map();
    plants.forEach(plant => {
        const date = plant.properties['Last Watered'].date.start;
        if (plantsDates.has(date)) {
            plantsDates.set(date, [...plantsDates.get(date), plant.id]);
        } else {
            plantsDates.set(date, [plant.id]);
        }
    });
    return plantsDates;
}
