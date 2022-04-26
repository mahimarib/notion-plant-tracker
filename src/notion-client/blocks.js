import { limiter, notion } from './notion.js';

export async function deleteBlock(id) {
    const response = await limiter.schedule(() =>
        notion.blocks.delete({
            block_id: id,
        })
    );
    return response;
}

export async function deleteBlocks(ids) {
    const deletedIds = ids.map(id => deleteBlock(id));
    return await Promise.all(deletedIds);
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
    const ids = (await getAllChildren(parentBlockID)).map(block => block.id);
    return ids;
}

export async function deleteAllChildren(parentID) {
    const childrenIDs = await getAllChildrenIDs(parentID);
    await deleteBlocks(childrenIDs);
}

export async function deleteAllChildrenTypes(parentID, types) {
    const blockChildren = await getAllChildren(parentID);
    const matchedType = blockChildren.filter(block =>
        types.includes(block.type)
    );
    const ids = matchedType.map(block => block.id);
    await deleteBlocks(ids);
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
    const response = await limiter.schedule(() =>
        notion.blocks.children.append({
            block_id: parentID,
            children: blocks,
        })
    );
    return response;
}