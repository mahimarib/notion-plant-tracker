import moment from 'moment';
import { getFrontPageSchedule } from './plantsTable.js';
import * as blocks from './blocks.js';

const frontPageID = process.env.FRONT_PAGE_ID;

export async function updateFrontPage() {
    try {
        blocks.deleteAllChildrenTypes(frontPageID, [
            'paragraph',
            'heading_3',
            'bulleted_list_item',
        ]);
    } catch (error) {
        console.log(`unable to delete block.`);
    }

    const scheduleMap = await getFrontPageSchedule();
    const blocksToAdd = [];

    scheduleMap.forEach((ids, date) => {
        const dateObj = moment(date);
        const text =
            moment().date() === dateObj.date()
                ? 'today'
                : dateObj.startOf('day').fromNow();
        const headingBlock = blocks.getHeadingBlock(`Watered ${text}`);
        blocksToAdd.push(headingBlock);
        const bulletBlocks = ids.map(id => blocks.getBulletPlantLink(id));
        blocksToAdd.push(...bulletBlocks);
    });

    return blocks.addBlocksToParent(frontPageID, blocksToAdd);
}
