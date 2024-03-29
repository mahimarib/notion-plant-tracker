import { limiter, notion, waterLog } from './notion.js';

export enum WateringMethod {
    Rain, WateringCan
}

function getWateringMethodID(method: WateringMethod) {
    if (method == WateringMethod.Rain) return waterLog.method.select.rain;
    else return waterLog.method.select.wateringCan;
}

export function addToLog(id: string, date: string, method: WateringMethod) {
    return limiter.schedule(() =>
        notion.pages.create({
            parent: {
                type: 'database_id',
                database_id: waterLog.id,
            },
            properties: {
                [waterLog.nameID]: {
                    title: [
                        {
                            type: 'mention',
                            mention: {
                                page: { id }
                            }
                        },
                        {
                            type: 'text',
                            text: {
                                content: ' ',
                            },
                        }
                    ]
                },
                [waterLog.dateID]: {
                    date: {
                        start: date
                    }
                },
                [waterLog.method.id]: {
                    select: {
                        id: getWateringMethodID(method)
                    }
                }
            }
        })
    );
}
