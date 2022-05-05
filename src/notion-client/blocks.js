import { limiter, notion } from './notion.js';

export function deleteBlock(id) {
    return limiter.schedule(() =>
        notion.blocks.delete({
            block_id: id,
        })
    );
}

export function deleteBlocks(ids) {
    const deletedIds = ids.map(id => deleteBlock(id));
    return Promise.all(deletedIds);
}

async function getAllChildren(parentID) {
    const { results } = await limiter.schedule(() =>
        notion.blocks.children.list({
            block_id: parentID,
        })
    );
    return results;
}

export async function getAllChildrenIDs(parentBlockID) {
    return (await getAllChildren(parentBlockID)).map(block => block.id);
}

export async function deleteAllChildren(parentID) {
    const childrenIDs = await getAllChildrenIDs(parentID);
    return deleteBlocks(childrenIDs);
}

export async function deleteAllChildrenTypes(parentID, types) {
    const blockChildren = await getAllChildren(parentID);
    const matchedType = blockChildren.filter(block =>
        types.includes(block.type)
    );
    const ids = matchedType.map(block => block.id);
    return deleteBlocks(ids);
}

export function getHeadingBlock(text) {
    return {
        type: 'heading_3',
        heading_3: {
            text: [
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

export function getBulletPlantLink(plantPageID) {
    return {
        type: 'bulleted_list_item',
        bulleted_list_item: {
            text: [
                {
                    type: 'mention',
                    mention: {
                        type: 'page',
                        page: { id: plantPageID },
                    },
                },
            ],
        },
    };
}

export async function addBlocksToParent(parentID, blocks) {
    return limiter.schedule(() =>
        notion.blocks.children.append({
            block_id: parentID,
            children: blocks,
        })
    );
}
