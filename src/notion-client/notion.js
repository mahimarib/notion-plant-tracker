import { Client } from '@notionhq/client';
import Bottleneck from 'bottleneck';

export const notion = new Client({ auth: process.env.NOTION_KEY });

export const plantsTable = {
    id: process.env.PLANTS_TABLE_ID,
    nameID: process.env.PLANTS_TABLE_NAME_ID,
    dateID: process.env.PLANTS_TABLE_DATE_ID,
    intervalID: process.env.PLANTS_TABLE_INTERVAL_ID,
    statusID: process.env.PLANTS_TABLE_STATUS_ID,
};

export const waterLog = {
    id: process.env.WATER_LOG_ID,
    nameID: process.env.WATER_LOG_NAME_ID,
    dateID: process.env.WATER_LOG_DATE_ID,
};

export const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 333,
});
