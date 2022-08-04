import { AppendBlockChildrenParameters } from '@notionhq/client/build/src/api-endpoints';
import { limiter, notion } from './notion.js';

export type Block = AppendBlockChildrenParameters["children"][number];

export function deleteBlock(id: string) {
    return limiter.schedule(() =>
        notion.blocks.delete({
            block_id: id,
        })
    );
}

export function deleteBlocks(ids: string[]) {
    const deletedIds = ids.map(id => deleteBlock(id));
    return Promise.all(deletedIds);
}

async function getAllChildren(parentID: string) {
    const { results } = await limiter.schedule(() =>
        notion.blocks.children.list({
            block_id: parentID,
        })
    );
    return results;
}

export async function getAllChildrenIDs(parentBlockID: string) {
    return (await getAllChildren(parentBlockID)).map(block => block.id);
}

export async function deleteAllChildren(parentID: string) {
    const childrenIDs = await getAllChildrenIDs(parentID);
    return deleteBlocks(childrenIDs);
}

export async function deleteAllChildrenTypes(parentID: string, types: string[]) {
    const blockChildren = await getAllChildren(parentID);
    const matchedType = blockChildren.filter(block =>
        types.includes((block as any).type)
    );
    const ids = matchedType.map(block => block.id);
    return deleteBlocks(ids);
}

export function getHeadingBlock(text: string): Block {
    return {
        type: 'heading_3',
        heading_3: {
            rich_text: [
                {
                    type: 'text',
                    text: {
                        content: text,
                    },
                },
            ],
        },
    };
}

export function getBulletPlantLink(plantPageID: string): Block {
    return {
        type: 'bulleted_list_item',
        bulleted_list_item: {
            rich_text: [
                {
                    type: 'mention',
                    mention: {
                        page: { id: plantPageID },
                    },
                },
            ],
        },
    };
}

export async function addBlocksToParent(parentID: string, blocks: Block[]) {
    return limiter.schedule(() =>
        notion.blocks.children.append({
            block_id: parentID,
            children: blocks,
        })
    );
}
