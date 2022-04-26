import { limiter, notion, waterLog } from './notion.js';

export async function addToLog(id, date) {
    const response = await limiter.schedule(() =>
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
            },
        })
    );
    return response;
}
