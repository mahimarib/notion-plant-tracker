import moment from 'moment';
import { addToLog, WateringMethod } from './waterLog.js';
import { limiter, notion, plantsTable } from './notion.js';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

type Page = QueryDatabaseResponse["results"][number] &
    { properties?: Record<string, any> };

export async function getPlants(): Promise<Page[]> {
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

export async function getPlantsOutside(): Promise<Page[]> {
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

export function getPlantName(plantObj: Page) {
    const [{ plain_text: name }] = plantObj.properties.Name.title;
    return name;
}

export function getPlantDate(plantObj: Page) {
    return plantObj.properties['Last Watered'].date.start;
}

/**
 * Returns a key value pair of the plant names and the id.
 * @returns {Object} key value pairs
 */
export async function getPlantsMap() {
    const plants = await getPlants();

    const map: Record<string, string> = plants.reduce((acc, plant) => {
        const name = getPlantName(plant);
        return {
            ...acc,
            [name]: plant.id,
        };
    }, {});
    return map;
}

export async function updateLastWatered(pageID: string, method: WateringMethod) {
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

export async function getSchedule(ids: string[]) {
    const plants: Page[] = (await getPlants()).filter((plant: Page) => ids.includes(plant.id));
    const data: Record<string, string[]> = plants.reduce((acc, plant) => {
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
        plant => (plant).properties['Last Watered'].date
    );
    // sort oldest to newest
    plants.sort((a, b) => {
        const dateA: Date = new Date(getPlantDate(a));
        const dateB: Date = new Date(getPlantDate(b));
        return dateA.getTime() - dateB.getTime();
    });
    const plantsDates = plants.reduce((map, plant) => {
        const date = getPlantDate(plant);
        if (map.has(date)) {
            map.set(date, [...map.get(date), plant.id]);
        } else {
            map.set(date, [plant.id]);
        }
        return map;
    }, new Map<string, string[]>());
    return plantsDates;
}
