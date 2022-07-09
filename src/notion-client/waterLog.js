import { limiter, notion, waterLog } from './notion.js';

export const WateringMethod = {
    Rain: waterLog.method.select.rain,
    WateringCan: waterLog.method.select.wateringCan,
};

export function addToLog(id, date, method) {
    return limiter.schedule(() =>
        notion.pages.create({
            parent: {
                database_id: waterLog.id,
            },
            properties: {
                [waterLog.nameID]: {
                    title: [
                        {
                            type: 'mention',
                            mention: {
                                type: 'page',
                                page: { id },
                            },
                        },
                        {
                            type: 'text',
                            text: {
                                content: ' ',
                            },
                        },
                    ],
                },
                [waterLog.dateID]: {
                    date: {
                        start: date,
                    },
                },
                [waterLog.method.id]: {
                    select: {
                        id: method,
                    },
                },
            },
        })
    );
}
