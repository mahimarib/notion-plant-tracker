import { limiter, notion, waterLog } from './notion.js';

export const WateringMethod = {
    Rain: waterLog.select.rain,
    WateringCan: waterLog.select.wateringCan,
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
                [waterLog.methodID]: {
                    select: {
                        id: method,
                    },
                },
            },
        })
    );
}
