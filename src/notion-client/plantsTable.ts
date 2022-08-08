import moment from 'moment';
import { addToLog, WateringMethod } from './waterLog.js';
import { limiter, Location, notion, plantsTable } from './notion.js';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

export type Page = Extract<QueryDatabaseResponse['results'][number], { parent: {}}>;
export type PageProperty<T> = Extract<Page['properties'][string], { type: T }>;

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
                        property: plantsTable.locationID,
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

export async function getPlantGroup(groupName: string) {
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
                        property: plantsTable.groupID,
                        multi_select: {
                            contains: groupName,
                        },
                    },
                ],
            }
        })
    )
    return plants;
}

export function getPlantName(plantObj: Page): string {
    const prop = plantObj.properties['Name'] as PageProperty<'title'>;
    const [{ plain_text: name }] = prop.title;
    return name;
}

export function getPlantDate(plantObj: Page) {
    const prop = plantObj.properties['Last Watered'] as PageProperty<'date'>;
    return prop.date.start;
}

/**
 * Returns a key value pair of the plant names and the id.
 * @returns {Promise<Record<string,string>>} key value pairs
 */
export async function getPlantsMap(): Promise<Record<string,string>> {
    const plants = await getPlants();

    const map = plants.reduce((acc, plant) => {
        const name = getPlantName(plant as Page);
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
    const plantName = getPlantName(plantPage as Page);
    console.log(`edited: ${plantName}`);
    addToLog(plantPage.id, date, method);
}

export function updatePlantLocation(plantID: string, locationName: Location) {
    limiter.schedule(() => notion.pages.update({
        page_id: plantID,
        properties: {
            [plantsTable.locationID]: {
                select: {
                    name: locationName
                }
            }
        }
    }))
}

export async function getSchedule(ids: string[]) {
    const plants: Page[] = (await getPlants() as Page[]).filter((plant: Page) => ids.includes(plant.id));
    const data: Record<string, string[]> = plants.reduce((acc, plant) => {
        const name = getPlantName(plant);
        const intervalProp = plant.properties['Watering Interval (days)'] as PageProperty<'number'>;
        const interval = intervalProp.number;
        return {
            ...acc,
            [interval]: acc[interval] ? [...acc[interval], name] : [name],
        };
    }, {});
    return data;
}

export async function getFrontPageSchedule() {
    const plants = (await getPlants() as Page[]).filter(
        plant => getPlantDate(plant)
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
